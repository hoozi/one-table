import type { TablePagination,PageInfo, OneTableProps, ActionType } from '../typings';

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

export function get(obj:any, path:string) {
  if(!obj) return null;
  const paths = path.indexOf('.') > -1 ? path.split('.') : path;
  let value = obj;
  if(Array.isArray(paths)) {
    for(let i = 0; i<paths.length; i++) {
      value = value[paths[i]];
    }
    return value;
  }
  return obj[paths];
}

export function omit(obj:any, paths: string | string[]) {
  const newObj:any = {};
  Object.keys(obj || {}).forEach((key) => {
    if(typeof paths === 'string' && key === paths) {
      return;
    }
    if(Array.isArray(paths) && paths.includes(key)) {
      return;
    }
    newObj[key] = obj[key];
  });
  return newObj;
}

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

export function mergeHotKeys(props: {
  hotKeys: OneTableProps['hotKeys'],
  action: ActionType
}): Record<string, any> | false {
  const { action, hotKeys } = props;
  if(!hotKeys) return false;
  const defaultHotKeys = {
    'F5': action.reload
  }
  return Object.assign(
    defaultHotKeys,
    hotKeys
  )
}