import { ref, UnwrapRef, Ref } from 'vue';

export default function useDefaultState<T=any>(
  defaultValue?: T | (() => T)
): [Ref<UnwrapRef<T>>, (v:UnwrapRef<T>) => void] {
  const def = typeof defaultValue === 'function' ? (defaultValue as any)(): defaultValue;
  const state = ref<T>(def);
  function setState(v:UnwrapRef<T>) {
    state.value = v;
  }
  return [state, setState]
}