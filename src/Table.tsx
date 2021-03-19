import './index.less';
import { defineComponent, PropType, ref, reactive, unref, computed, onMounted, onUpdated, nextTick } from 'vue';
import { Table } from 'ant-design-vue';
import { defaultTableProps } from 'ant-design-vue/lib/table/Table';
import PropTypes from 'ant-design-vue/es/_util/vue-types';
import { SortOrder, TableProps, ColumnProps } from 'ant-design-vue/lib/table/interface';
import { OneTableProps, ParamsType, RequestData, VNodeText, PageInfo, ActionType } from './typings';
import useFetchData from './hooks/useFetchData';
import usePagination from './hooks/usePagation';
import useDefaultState from './hooks/useDefaultState'
import { mergePaginationProps } from './utils';
import useBindAction from './hooks/useBindAction';
import usePrefix from './hooks/usePrefix';

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
      manualRequest = false,
      dataSource,
      search,
      columns,
      rowKey,
      tableClass,
      tableStyle,
      getAction,
      ...rest
    } = props;

    const tableBaseCls = usePrefix('table-container');

    const tableWrapperCls = computed(() => ({
      [`${tableBaseCls}`]: true,
      [`${tableBaseCls}-small`]: props.size === 'small',
      [`${tableBaseCls}-pagination`]: !!props.pagination,
      [`${tableBaseCls}-full`]: !!props.full,
      [`${tableBaseCls}-bordered`]: !!props.bordered
    }))

    const fetchPagination = typeof props.pagination === 'object' ? props.pagination : { pageSize: 20, current: 1, total: 0, defaultPageSize: 20, defaultCurrent:1 }
    const { pageInfo, defaultPageInfo, setPageInfo } = usePagination(fetchPagination);
    const rootRef = ref<HTMLDivElement>();
    const params = reactive<ParamsType>(propsParams);
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
    })

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
          params,
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
        effects: [params, formSearch, sortRef, filterRef],
        debounceTime,
      },
      rootRef
    );

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
    const getTableProps = () => ({
      ...rest,
      columns,
      loading: action.loading.value,
      dataSource: action.dataSource.value,
      pagination: props.pagination === false ? false : pagination.value,
      rowSelection: props.rowSelection === null ? undefined : rowSelection.value,
      rowKey: getRowKey.value,
      class: tableClass,
      style: tableStyle,
      scroll: {
        y: !!props.full,
        x: props.scroll ? props.scroll.x : 100
      }
    });
    onMounted(() => {
      getAction?.(bindedAction);
    });
    /* onUpdated(() => {
      getAction?.(bindedAction);
    }); */
    return () => {
      return (
        <div class={tableWrapperCls.value} ref={rootRef}>
          <Table {...getTableProps()} v-slots={slots || {}}/>
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
  'requestError'
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
  full: PropTypes.bool.def(false)
};

export default OneTable;