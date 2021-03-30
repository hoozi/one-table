import type { VNodeChild, Ref, CSSProperties, UnwrapRef } from 'vue';
import type { ColumnProps, TableProps, SortOrder } from 'ant-design-vue/es/table/interface';
//import type {  } from 'ant-design-vue/es/input'

export type RenderVNode = VNodeChild | Element | JSX.Element;

export type TablePagination = TableProps['pagination'];

export type TableRowSelection = TableProps['rowSelection'];

export type SpinProps = {
  prefixCls: string;
  spinning: boolean;
  size: "default" | "small" | "large";
  wrapperClassName: string;
  tip: string;
  delay: number;
  indicator: any;
}

export type PageInfo = {
  pageSize: number;
  total: number;
  current: number;
};

export type UseFetchDataAction<T = any> = {
  dataSource: Ref<T[]>;
  setDataSource: (dataSource: T[]) => void;
  loading: Ref<boolean | SpinProps | undefined>;
  //pageInfo: PageInfo;
  reload: () => Promise<void>;
  fullScreen?: () => void;
  reset: () => void;
  //pollingLoading: boolean;
  //setPageInfo: (pageInfo: Partial<PageInfo>) => void;
};

export type UseFetchProps = {
  dataSource?: any[];
  loading: boolean | SpinProps | undefined;
  postData: any;
  setPageInfo(pageInfo:PageInfo):void;
  pageInfo: PageInfo;
  defaultPageInfo: { defaultPageSize?: number; defaultCurrent?: number };
  effects: any[];
  manual: boolean;
  debounceTime?: number;
  emit(name:string, ...args:any[]):void;
  //polling?: number | ((dataSource: any[]) => number);
};

export type RequestData<T> = {
  data: {
    current: number;
    size: number;
    records: T[] | null;
    total: number;
    [key: string]: any;
  } | null;
  msg?: string | null; 
  code?: number;
} & Record<string, any>;

export type OneTableColumnProps = Omit<ColumnProps, 'filters' | 'onFilter'> & {
  valueType?:string;
  valueEnum?: Record<string, { text:string; [key: string]: string | number }> | ((...args: any[]) => Promise<any>);
  renderFormItem?():RenderVNode;
  props?: any;
  show?:boolean;
  hideInTable?:boolean;
  hideInSearch?:boolean;
  hideInSettings?:boolean;
  children?:OneTableColumnProps[];
  onFilter?:boolean | ((value: string, record: any) => boolean);
  filters?:boolean | ColumnProps['filters'];
  resizable?: boolean;
}

type SearchConfig = {}

export type VNodeText = string | number;

export type ParamsType = Record<string, any>;

export type ActionType = {
  reload?: (resetPageIndex?: boolean) => void;
  reloadAndRest?: () => void;
  reset?: () => void;
  clearSelected?: () => void;
  pageInfo?: PageInfo;
}

export type TableContextMenu = {
  action():void;
  text: string | VNodeChild;
  icon: string | VNodeChild;
  extra: string | VNodeChild;
  children: TableContextMenu[]
}

export type OneTableProps = Omit<TableProps, 'columns'> & {
  columns?:OneTableColumnProps[];
  params?:ParamsType;
  onDataLoad?: (dataSource: any[]) => void;
  onLoadingChange?: (loading: boolean | SpinProps | undefined) => void;
  onRequestError?: (e: Error) => void;
  onDataSourceChange?: (dataSource: any[]) => void;
  request?(
    params: ParamsType & {
      pageSize?: number;
      current?: number;
      keyword?: string;
    },
    sort: Record<string, SortOrder> | undefined,
    filter: Record<string, VNodeText[]> | undefined,
  ) : Promise<Partial<RequestData<any>>>;
  getAction?(action:UnwrapRef<ActionType & { fullScreen?: () => void; }>):void;
  defaultData?:any[];
  postData?: (data: any[]) => any[];
  manualRequest?: boolean;
  debounceTime?:number;
  search?: boolean;
  tableStyle?: CSSProperties;
  tableClass?: string;
  full?:boolean;
  columnEmptyText?:string;
  hotKeys?:boolean | Record<string, any>;
  contextMenuActions?:boolean | Partial<TableContextMenu>[];
  highlightCurrentRow?:boolean;
  containerStyle?:CSSProperties;
}

export type WithFalse<T> = T | false;