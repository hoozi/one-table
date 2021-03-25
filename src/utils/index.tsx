import type { TablePagination,PageInfo, OneTableColumnProps, OneTableProps } from '../typings';

export function omitBoolean<T>(obj: boolean | T): T | undefined {
  if (obj && obj !== true) {
    return obj;
  }
  return undefined;
};

export function omitUndefined<T>(obj: any): T {
  const newObj = {} as any;
  Object.keys(obj || {}).forEach((key:string) => {
    if (obj[key] !== undefined) {
      newObj[key] = obj[key];
    }
  });
  if (Object.keys(newObj).length < 1) {
    return undefined as any;
  }
  return newObj;
};

export function mergePaginationProps (
  pagination: TablePagination = {},
  selectedRows: any[],
  pageInfo: PageInfo & {
    setPageInfo(pageInfo: Partial<PageInfo>): void;
  }
): TablePagination | false | undefined {
  if(pagination === false) return;
  const { current, pageSize, total, setPageInfo } = pageInfo; 
  const defaultPagination: TablePagination = typeof pagination === 'object' ? pagination : {};
  function mergeChange(page:number, newPageSize: number, change: string) {
    (pagination as any)[change]?.(page, newPageSize || 20);
    if (newPageSize !== pageSize || current !== page) {
      setPageInfo({ pageSize: newPageSize, current: page });
    }
  }
  
  return {
    showTotal: (all:number, range: [number, number]) =>(<span>{`第 ${range[0]}-${range[1]} 条/总共 ${all} 条`}{selectedRows.length > 0 ?<span> | <b class='primary-bold-color'>{'已选择'+selectedRows.length+'条'}</b></span> : ''}</span>),
    showSizeChanger: true,
    showQuickJumper: true,
    total,
    ...defaultPagination,
    current,
    pageSize,
    onChange: (page: number, newPageSize: number) => {
      mergeChange(page, newPageSize || 20, 'onChange');
    },
    onShowSizeChange: (page:number, newPageSize: number) => {
      mergeChange(page, newPageSize, 'onShowSizeChange');
    }
  }
}

export const createRowEvent = (emit:(name:string, ...args:any[]) => void) => (evtName: string, e:MouseEvent, row:any) => emit(evtName, { e, row });

export const genColumnKey = (key?: string | number, index?: number): string => {
  if (key) {
    return Array.isArray(key) ? key.join('-') : key.toString();
  }
  return `${index}`;
};

export const defaultOnFilter = (value: string, record: any, dataIndex: string) => {
  const recordElement = record[dataIndex];
  const itemValue = String(recordElement) as string;

  return String(itemValue) === String(value);
};

export function omitUndefinedAndEmptyArr(obj: any) {
  const newObj:any = {};
  Object.keys(obj || {}).forEach((key) => {
    if (Array.isArray(obj[key]) && obj[key]?.length === 0) {
      return;
    }
    if (obj[key] === undefined) {
      return;
    }
    newObj[key] = obj[key];
  });
  return newObj;
};

export const proFieldParsingValueEnumToArray = (
  valueEnumParams: any = new Map(),
): {
  value: string | number;
  text: string;
}[] => {
  const enumArray: {
    value: string | number;
    text: string;
    /** 是否禁用 */
    disabled?: boolean;
  }[] = [];
  const valueEnum = Object.prototype.toString.call(valueEnumParams) === '[object Map]' ? 
    valueEnumParams :
    new Map(Object.entries(valueEnumParams || {}));

  valueEnum.forEach((_:any, key:number | string) => {
    const value = (valueEnum.get(key) || valueEnum.get(`${key}`)) as {
      text: string;
      disabled?: boolean;
    };

    if (!value) {
      return;
    }

    if (typeof value === 'object' && value?.text) {
      enumArray.push({
        text: (value?.text as unknown) as string,
        value: key,
        disabled: value.disabled,
      });
      return;
    }
    enumArray.push({
      text: (value as unknown) as string,
      value: key,
    });
  });
  return enumArray;
};

export function genColumns(props: {
  columns: OneTableColumnProps[],
  columnEmptyText: string | false,
  tableProps: OneTableProps
}): OneTableColumnProps[] {
  const { columns, tableProps, columnEmptyText } = props;
  return columns.map((columnProps, index) => {
    const {
      key,
      dataIndex,
      valueEnum,
      valueType,
      children,
      onFilter,
      filters = [],
    } = columnProps;
    //const columnKey = genColumnKey(key, index);
    const genOnFilter = () => {
      if (!tableProps?.request || onFilter === true) {
        return (value: string, row: any) => defaultOnFilter(value, row, dataIndex as string);
      }
      return omitBoolean(onFilter);
    };
    const column = {
      index,
      ...columnProps,
      onFilter: genOnFilter(),
      filters: filters === true ?
          proFieldParsingValueEnumToArray(valueEnum)
          .filter((valueItem) => valueItem && valueItem.value !== 'all') :
          filters,
      children: children ? genColumns({ ...props, columns: children }) : undefined

    }
    return omitUndefinedAndEmptyArr(column);
  }).filter(item => !item.hideInTable);
}