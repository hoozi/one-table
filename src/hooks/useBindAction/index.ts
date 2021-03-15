import { Ref } from 'vue';
import type { ActionType, PageInfo, UseFetchDataAction } from '../../typings';

export default function useBindAction(
  action: UseFetchDataAction & { pageInfo:PageInfo } & {
    setPageInfo(pageInfo: Partial<PageInfo>):void
  },
  props: {
    fullScreen: () => void;
    onCleanSelected: () => void;
    resetAll: () => void;
  }
):ActionType & { fullScreen?: () => void; } {
  const bindedAction = {
    pageInfo: action.pageInfo,
    reload: async (resetPageIndex?: boolean) => {
      if (resetPageIndex) {
        await props.onCleanSelected();
      }
      action?.reload();
    },
    reloadAndRest: async () => {
      props.onCleanSelected();
      await action.setPageInfo({
        current: 1,
      });
      await action?.reload();
    },
    reset: async () => {
      await props.resetAll();
      await action?.reset?.();
      await action?.reload();
    },
    fullScreen: () => props.fullScreen(),
    clearSelected: () => props.onCleanSelected(),
  };
  return bindedAction;
}