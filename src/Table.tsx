import './index.less';
import { defineComponent, PropType, ref, unref, computed, onMounted, provide } from 'vue';
import { Table } from 'ant-design-vue';
import { defaultTableProps } from 'ant-design-vue/lib/table/Table';
import PropTypes from 'ant-design-vue/es/_util/vue-types';
import { SortOrder, TableProps, ColumnProps } from 'ant-design-vue/lib/table/interface';
import { OneTableProps, ParamsType, RequestData, VNodeText, PageInfo, ActionType, OneTableColumnProps } from './typings';
import useFetchData from './hooks/useFetchData';
import usePagination from './hooks/usePagation';
import useDefaultState from './hooks/useDefaultState';
import useResizeProxy from './hooks/useResizeProxy';
import { mergePaginationProps, createRowEvent, omitUndefined, mergeHotKeys } from './utils';
import { genColumns } from './utils/column';
import useBindAction from './hooks/useBindAction';
import usePrefix from './hooks/usePrefix';
import DraggableTh from './DraggableTh';
import { tableKey } from './token';
import { genKeyFormater } from './hooks/useKeyPress';

type Key = ColumnProps['key']

const OneTable = defineComponent<OneTableProps>({
  name: 'OneTable',
  setup(props, { emit, slots }) {
    const { 
      postData, 
      request,
      debounceTime, 
      defaultData, 
      params:propsParams = {},
      columnEmptyText = '-',
      manualRequest = false,
      dataSource,
      contextMenuActions,
      search,
      hotKeys:propsHotKeys,
      columns,
      rowKey,
      tableClass,
      tableStyle,
      containerStyle,
      getAction,
      highlightCurrentRow,
      ...rest
    } = props;

    // @ts-ignore
    const initColumns = ref<OneTableColumnProps[]>(columns);

    const tableBaseCls = usePrefix('table-container');
    const tableRef = ref(null);

    useResizeProxy();

    // @ts-ignore
    provide(tableKey, {
      columns: unref(initColumns),
      tableProps: props
    });
    
    const fetchPagination = typeof props.pagination === 'object' ? props.pagination : { pageSize: 20, current: 1, total: 0, defaultPageSize: 20, defaultCurrent:1 }
    const { pageInfo, defaultPageInfo, setPageInfo } = usePagination(fetchPagination);
    const rootRef = ref<HTMLDivElement>();
    //const params = reactive<ParamsType>(propsParams);
    const selectedRow = ref<number>(-1);
    const [sortRef, setSort] = useDefaultState<Record<string, SortOrder> | undefined>({});
    const [filterRef, setFilter] = useDefaultState<Record<string, VNodeText[]> | undefined>({});
    const [selectedRowKeys, setSelectedRowKeys] = useDefaultState<Key[]>(props.rowSelection?.selectedRowKeys || []);

    const [selectedRows, setSelectedRows] = useDefaultState<typeof dataSource>([]);
    const [formSearch, setFormSearch]= useDefaultState<Record<string, any> | undefined>(() => {
      if(manualRequest || search !== false ) {
        return undefined
      }
      return {}
    });
    const manual = computed(() => {
      if(unref(formSearch) === undefined) {
        return true;
      }
      return false;
    });
    function setSelectedKeysAndRows(keys: Key[], rows: typeof dataSource):void {
      setSelectedRowKeys(keys);
      setSelectedRows(rows);
    }

    /* const tableColumns = computed(() => {
      return columns?.filter(item => item.show);
    }); */

    const getRowKey = computed(() => {
      if(typeof rowKey === 'function') {
        return rowKey;
      }
      return (row: typeof dataSource, index:number) => (row as any)?.[rowKey as string] ?? index
    });

    // 选择项相关
    const rowSelection: TableProps['rowSelection'] = computed(() => (
      {
        selectedRowKeys: unref(selectedRowKeys),
        //fixed: true,
        ...props.rowSelection,
        onChange: (keys: Key[], rows: typeof dataSource) => {
          if (props.rowSelection && ('onChange' in props.rowSelection)) {
            props.rowSelection.onChange(keys, rows)
          }
          setSelectedKeysAndRows(keys, rows);
        }
      }
    ));

    const onCleanSelected = () => {
      if (props.rowSelection && ('onChange' in props.rowSelection)) {
        props.rowSelection.onChange([], [])
      }
      setSelectedKeysAndRows([], []);
    };
    
    // 拉取数据
    const action = useFetchData(
      request ? 
      async (pageInfo) => {
        const requestParams = Object.assign(
          (pageInfo || {}),
          propsParams,
          unref(formSearch)
        )
        const response = await request(requestParams, unref(sortRef), unref(filterRef) ) as RequestData<any>;
        return response;
      } : undefined,
      defaultData,
      {
        pageInfo,
        defaultPageInfo,
        setPageInfo,
        loading: props.loading,
        dataSource: props.dataSource,
        emit,
        postData,
        manual: manual.value,
        //polling,
        effects: [propsParams, formSearch, sortRef, filterRef],
        debounceTime,
      },
      rootRef
    );

    const tableWrapperCls = computed(() => ({
      [`${tableBaseCls}`]: true,
      [`${tableBaseCls}-small`]: props.size === 'small',
      [`${tableBaseCls}-pagination`]: !!props.pagination,
      [`${tableBaseCls}-full`]: !!props.full,
      [`${tableBaseCls}-bordered`]: !!props.bordered,
      [`${tableBaseCls}-nodata`]: !unref(action.dataSource).length
    }));

    const bindedAction = useBindAction(
      Object.assign(action,{ pageInfo, setPageInfo }),
      {
        fullScreen: () => {
          if (!unref(rootRef) || !document.fullscreenEnabled) {
            return;
          }
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else {
            unref(rootRef)?.requestFullscreen();
          }
        },
        onCleanSelected: () => {
          // 清空选中行
          onCleanSelected();
        },
        resetAll: () => {
          // 清空选中行
          onCleanSelected();
          // 清空筛选
          setFilter({});
          // 清空排序
          setSort({});
          // 清空 toolbar 搜索
          //counter.setKeyWords(undefined);
          // 重置页码
          setPageInfo({
            current: 1,
          });
    
          // 重置表单
          //formRef?.current?.resetFields();
          setFormSearch({});
        }
      }
    );
    
    // columns 
    const getColumns = computed(() => genColumns({
      columns: unref(initColumns),
      columnEmptyText,
      tableProps: props
    }));

    const isLocaleFilter = computed(() => props?.columns?.every(
      (column) =>
        (column.filters === true && column.onFilter === true) ||
        (column.filters === undefined && column.onFilter === undefined),
    ));

    // 分页相关
    const pagination = computed(() => mergePaginationProps(
      props.pagination,
      unref(selectedRows) || [],
      Object.assign(pageInfo, {
        setPageInfo: ({ current, pageSize }: PageInfo) => {

          // pageSize的变化 可能会出现空白页
          // 所以要把current变为1
  
          if(
            pageSize !== pageInfo.pageSize &&
            current !== 1
          ) {
            action.setDataSource([]);
            setPageInfo({
              pageSize,
              current: 1
            });
          }
          setPageInfo({ pageSize, current });
        }
      }),
    ));
    
    // customRow
    const customRow = (row:any) => {
      const rowEvent = createRowEvent(emit);
      return {
        onClick: (e:MouseEvent) => {
          selectedRow.value = action.dataSource.value.indexOf(row);
          rowEvent('rowClick', e, row);
        },
        onDblclick: (e:MouseEvent) => rowEvent('rowDbClick', e, row),
        onContextmenu: (e:MouseEvent) => {
          rowEvent('rowContextMenu', e, row)
        },
        onMouseenter: (e:MouseEvent) => rowEvent('rowEnter', e, row),
        onMouseleave: (e:MouseEvent) => rowEvent('rowLeave', e, row)
      }
    }

    const getTableProps = computed(() => ({
      ...rest,
      columns: getColumns.value,
      loading: action.loading.value,
      dataSource: action.dataSource.value,
      pagination: props.pagination === false ? false : pagination.value,
      rowSelection: props.rowSelection === null ? undefined : rowSelection.value,
      rowKey: getRowKey.value,
      class: tableClass,
      style: tableStyle,
      scroll: {
        y: !!props.full,
        x: !!props.scroll ? (props.scroll as any)?.x : '100%'
      },
      onChange: (
        pagination: OneTableProps['pagination'],
        filters: Record<string, VNodeText[]>,
        sorter: SortOrder,
        { currentDataSource }: any
      ) => {
        if(rest.onChange) {
          rest.onChange(pagination, filters, sorter, { currentDataSource });
        }
        if(!isLocaleFilter.value) {
          setFilter(omitUndefined(filters));
        }
      },
      rowClassName: (row:any, index:number) => (selectedRow.value === index && !!highlightCurrentRow) ? `${tableBaseCls}-tbody-row-selected` : rest.rowClassName?.(row, index) || '',
      customRow: (row:any) => ({
        ...rest.customRow?.(row),
        ...customRow(row)
      }),
      components: {
        header: {
          cell: DraggableTh
        }
      }
    } as OneTableProps));
    onMounted(() => {
      getAction?.(bindedAction);
    });

    const hotKeys = mergeHotKeys({
      hotKeys: propsHotKeys,
      action
    });

    const handleRootKeyPress = (event: KeyboardEvent) => {
      if(!hotKeys) return;
      Object.keys(hotKeys).forEach((key:string)=> {
        const isEvenType = genKeyFormater(key);
        if(isEvenType(event)) {
          // @ts-ignore
          return hotKeys[key].call(null, event);
        }
      })
    }
    return () => {
      return (
        <div class={tableWrapperCls.value} onKeydown={handleRootKeyPress} ref={rootRef} tabindex={-1} style={containerStyle}>
          <Table {...getTableProps.value} v-slots={slots || {}} ref={tableRef}/>
        </div>
      )
    }
  }
});

OneTable.inheritAttrs = false;
OneTable.emits = [
  'dataSourceChange',
  'dataLoad',
  'loadingChange',
  'requestError',
  'rowClick',
  'rowContextMenu',
  'rowDbClick',
  'rowEnter',
  'rowLeave'
]
OneTable.props = {
  ...defaultTableProps,
  getAction: {
    type: Function as PropType<(action: ActionType & { fullScreen?: () => void; }) => void>
  },
  params: PropTypes.object.def({}),
  defaultData: PropTypes.array.def([]),
  postData: PropTypes.func,
  manualRequest: PropTypes.bool.def(false),
  debounceTime: PropTypes.number.def(20),
  request: {
    type: Function as PropType<(params:ParamsType, s:Record<string, SortOrder>, f:Record<string, VNodeText[]>) => Promise<any>>
  },
  search: PropTypes.oneOfType([Boolean, Object]).def(false),
  tableClass: PropTypes.string.def(''),
  tableStyle: PropTypes.style.def({}),
  full: PropTypes.bool.def(false),
  columnEmptyText: PropTypes.string.def('-'),
  hotKeys: PropTypes.oneOfType([Object, Boolean]).def(false),
  contextMenuActions: PropTypes.oneOfType([Array, Boolean]).def(false),
  highlightCurrentRow: PropTypes.bool.def(false),
  containerStyle: PropTypes.style.def({})
};

export default OneTable;