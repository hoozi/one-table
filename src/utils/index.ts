import { Ref, ref } from 'vue';
import type { TablePagination,PageInfo, UseFetchDataAction } from '../typings';

export function mergePaginationProps(
  pagination: TablePagination = {},
  pageInfo: PageInfo & {
    setPageInfo(pageInfo: Partial<PageInfo>): void;
  }
): TablePagination | false | undefined {
  if(pagination === false) return;
  const { current, pageSize, total, setPageInfo } = pageInfo; 
  const defaultPagination: TablePagination = typeof pagination === 'object' ? pagination : {};
  return {
    showTotal: (all:number, range: [number, number]) =>`第 ${range[0]}-${range[1]} 条/总共 ${all} 条`,
    showSizeChanger: true,
    total,
    ...defaultPagination,
    current,
    pageSize,
    onChange: (page: number, newPageSize?: number) => {
      const { onChange } = defaultPagination;
      onChange?.(page, newPageSize || 20);
      // pageSize 改变之后就没必要切换页码
      if (newPageSize !== pageSize || current !== page) {
        setPageInfo({ pageSize: newPageSize, current: page });
      }
    }
  }
}