import { ref, onUpdated, onBeforeUnmount, onMounted } from 'vue';

export type ReturnValue<T extends any[]> = {
  run: (...args: T) => void;
  cancel: () => void;
};

function useDebounce<T extends any[]>(
  fn: (...args: T) => Promise<any>,
  wait?: number,
): ReturnValue<T> {
  // eslint-disable-next-line no-underscore-dangle
  const hookWait: number = wait || 0;
  const timer = ref<any>();
  const fnRef = ref<any>(fn);

  const cancel = () => {
    if (timer.value) {
      clearTimeout(timer.value);
      timer.value = null;
    }
  };

  const run = async (...args: any): Promise<void> => {
    return new Promise((resolve) => {
      cancel();
      timer.value = setTimeout(async () => {
        await fnRef.value(...args);
        resolve();
      }, hookWait);
    });
  }

  return {
    run,
    cancel,
  };
}

export default useDebounce;
