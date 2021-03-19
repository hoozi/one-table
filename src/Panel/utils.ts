export function addEvent(el:HTMLElement | Document | null, eventName: string, handle:((...args:any[]) => void)):Function | void {
  el?.addEventListener(eventName, handle);
  return () => {
    return el?.removeEventListener(eventName, handle);
  }
}

export function restrictToBounds (value:number, min:number | null, max:number | null) {
  
  if (min !== null && min !== 0 && value < min) {
    return min
  }
  if (max !== null && max !== 0 && max < value) {
    return max
  }
  return value
}