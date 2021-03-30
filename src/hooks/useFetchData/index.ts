import type { RequestData, UseFetchDataAction, UseFetchProps } from '../../typings';
import { ref, Ref, watch, unref, onBeforeMount, onMounted, watchEffect } from 'vue';
import useDebounce from '../useDebounce';
import useFullFixed from '../useFullFixed';

function useFetchData(
  asyncGetData: undefined | ((params?: { pageSize: number; current: number }) => Promise<RequestData<any>>),
  defaultData: any[] | undefined,
  options: UseFetchProps,
  root: Ref<HTMLElement | undefined>
):UseFetchDataAction {
  const { 
    debounceTime = 20, 
    manual=true, 
    setPageInfo,
    postData,
    loading,
    dataSource = [], 
    emit, 
    effects,
    pageInfo
  } = options;
  
  const manualRef = ref<boolean>(manual);
  const dataSourceRef = ref<any[]>(defaultData || dataSource);
  const requesting = ref<boolean>(false);
  const loadingRef = ref<any>(loading);
  watch(loadingRef, loading => {
    emit?.('loadingChange', loading)
  });
  watch(dataSourceRef, dataSource => {
    emit?.('dataSourceChange', dataSource)
  });

  function setDataSource(data: any[]) {
    dataSourceRef.value = data;
  }

  function setData(data:any[], dataTotal: number) {
    dataSourceRef.value = data;
    if(pageInfo?.total !== dataTotal) {
      setPageInfo?.({
        ...pageInfo!,
        total: dataTotal
      });
    }
    //setPageInfo?.(pageInfo);
  }

  const fetchData = async () => {
    if(
      unref(loadingRef) ||
      unref(requesting) ||
      !asyncGetData
    ) {
      return [];
    }
    
    // 手动触发
    if(unref(manualRef)) {
      manualRef.value = false;
      return [];
    }

    // loading
    loadingRef.value = true;

    requesting.value = true;
    const { pageSize = 20, current = 1 } = pageInfo || {};
    try {
      const { code, data, msg, ...rest } = await asyncGetData({ pageSize, current }) as RequestData<any>;
      if(code !== 0) {
        return [];
      }
      emit?.('dataLoad', data?.records, rest);
      const responseData = postData?.(data) || data?.records;
      setData(responseData, data?.total || 0);
      useFullFixed(root);
      return responseData;
    } catch(e) {
      emit?.('requestError');
      setDataSource([]);
      throw Error(e);
    } finally {
      loadingRef.value = false;
      requesting.value = false;
    }
    return [];
  }
  const fetchDebounce = useDebounce(async () => {
    await fetchData();
  }, debounceTime);

  watch(() => pageInfo.pageSize, (newPageSize, oldPageSize) => {
    // 假分页或者pageSize没变 那么就不执行
    if(
      newPageSize === oldPageSize ||
      ( unref(dataSourceRef) && newPageSize < unref(dataSourceRef).length)
    ) return;
    fetchDebounce.run();
  });

  watch(() => pageInfo.current, (newCurrent, oldCurrent)  => {
    if(
      newCurrent === oldCurrent ||
      ( unref(dataSourceRef) && pageInfo.pageSize < unref(dataSourceRef).length)
    ) return;
    fetchDebounce.run();
  })

  watch(effects, fetchDebounce.run)

  onMounted(() => {
    fetchDebounce.run();
  });
  onBeforeMount(() => {
    fetchDebounce.cancel();
  });

  return {
    dataSource: dataSourceRef,
    setDataSource,
    loading: loadingRef,
    reload: async () => {
      await fetchDebounce.run();
    },
    reset: () => {
      const defaultPageInfo = {
        pageSize: 20,
        current: 1,
        total: 0
      }
      setPageInfo(defaultPageInfo);
    }
  }
}

export default useFetchData;