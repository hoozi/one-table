import { Ref, ref } from 'vue';
import type { TablePagination,PageInfo, UseFetchDataAction } from '../typings';

export function mergePaginationProps(
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
    showTotal: (all:number, range: [number, number]) =>(<span>{`第 ${range[0]}-${range[1]} 条/总共 ${all} 条`}{selectedRows.length > 0 ?<span> | <b class='primary-bold-color'>{'已选择'+selectedRows.length + '条'}</b></span> : ''}</span>),
    showSizeChanger: true,
    showQuickJumper: true,
    total,
    ...defaultPagination,
    current,
    pageSize,
    onChange: (page: number, newPageSize: number) => {
      mergeChange(page, newPageSize, 'onChange');
    },
    onShowSizeChange: (page:number, newPageSize: number) => {
      mergeChange(page, newPageSize, 'onShowSizeChange');
    }
  }
}