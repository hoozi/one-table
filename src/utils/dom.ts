import { Ref, unref, isRef } from 'vue';

export type BasicTarget<T = HTMLElement> =
  | (() => T | null)
  | T
  | null
  | Ref<T | null | undefined>;

export type TargetElement = HTMLElement | Element | Document | Window;

export function addEvent(el:HTMLElement | Document | null, eventName: string, handle:((...args:any[]) => void)):Function | void {
  el?.addEventListener(eventName, handle);
  return () => {
    return el?.removeEventListener(eventName, handle);
  }
}

export function createDom(type: string, props?: any) {
  const elem = document.createElement(type) as HTMLElement & { [key:string]:any };
  Object.entries(props).forEach(([key, value]) => {
    elem.setAttribute(key, value as string);
  });
  return elem
}

export function getTargetElement(
  target?: BasicTarget<TargetElement>,
  defaultElement?: TargetElement,
): TargetElement | undefined | null {
  if (!target) {
    return defaultElement;
  }

  let targetElement: TargetElement | undefined | null;

  if (isRef(target)) {
    targetElement = unref(target);
  }

  if (typeof target === 'function') {
    targetElement = target();
  }
  // else if ('current' in target) {
  //   targetElement = target.current;
  // } else {
  //   targetElement = target;
  // }

  if (!targetElement) {
    console.error('target is not available!');
  }

  return targetElement;
}