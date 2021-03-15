import { reactive, UnwrapRef } from 'vue';
import omit from 'lodash/omit';
import type { PageInfo } from '../../typings';

type DefaultPageInfo = {
  current?:number;
  pageSize?:number;
  defaultCurrent?:number;
  defaultPageSize?:number;
}

function mergePagination(pageInfo: DefaultPageInfo = {}):PageInfo {
  if(pageInfo) {
    return {
      pageSize: pageInfo.pageSize || 20,
      total: 0,
      current: pageInfo.current || 1
    }
  }
  return {
    pageSize: 20,
    total: 0,
    current: 1
  }
}

function usePagination(
  defaultPageInfo: DefaultPageInfo
):{
  pageInfo: UnwrapRef<PageInfo>,
  setPageInfo(pageInfo: Partial<PageInfo>): void,
  defaultPageInfo: Omit<DefaultPageInfo, 'current' & 'pageSize'>
} {
  const pageInfoReactive = reactive<PageInfo>(mergePagination(defaultPageInfo))
  function setPageInfo(pageInfo: Partial<PageInfo>) {
    Object.assign(pageInfoReactive, pageInfo);
  }
  return {
    pageInfo:pageInfoReactive,
    defaultPageInfo: omit(defaultPageInfo, ['current', 'pageSize']),
    setPageInfo
  }
}

export default usePagination;