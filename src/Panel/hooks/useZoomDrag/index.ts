import { unref, ref, reactive, Ref, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { PanelProps, PanelSplitProps } from '../../typings';
import { addEvent, restrictToBounds } from '../../utils';

const initPos = 8;

export default function useZoomDrag(
  zoomRef:Ref<HTMLElement | null>, 
  options?: Partial<PanelSplitProps> & { direction?: PanelProps['direction'] }
) {
  
  let el: HTMLElement | null;
  const limit = ref();
  const { 
    splitable, 
    minH, 
    minW, 
    maxW, 
    maxH, 
    w, 
    h,
    position,
    direction
  } = options || {};
  const dragState = reactive({
    dx: 0,
    dy: 0,
    x: 0,
    y: 0,
    left: initPos,
    right: initPos,
    bottom: initPos,
    top: initPos,
    width: w || minW || '100%',
    height: h || minH || '100%'
  });

  const dragging = ref<boolean>(false);

  let removeMouseDown: any;
  let removeMouseMove: any;
  let removeMouseUp: any;

  function limitSize() {
    const parentWidth = (el?.parentNode as HTMLElement)?.getBoundingClientRect().width;
    const parentHeight = (el?.parentNode as HTMLElement)?.getBoundingClientRect().height;
    return {
      maxLeft: maxW ? parseInt(maxW as string) - parentWidth : null,
      minLeft: minW ? parseInt(minW as string) - parentWidth : null,
      maxTop: maxH ? parseInt(maxH as string) - parentHeight : null,
      minTop: minH ? parseInt(minH as string) - parentHeight : null
    }
  }

  function resetPos() {
    dragState.left = initPos;
    dragState.right = initPos;
    dragState.top = initPos;
    dragState.bottom = initPos;
  }

  // move
  function doMouseMove(e: MouseEvent) {
    e.preventDefault();
    if(!unref(dragging)) return;
    

    if(direction === 'horizontal') {
      if(!unref(limit).minLeft || !unref(limit).maxLeft) return;
    } else {
      if(!unref(limit).minTop || !unref(limit).maxTop) return;
    }
  
    const { pageX, pageY } = e;
    dragState.x = pageX;
    dragState.y = pageY;
    dragState.left = restrictToBounds(pageX - dragState.dx, unref(limit)!.minLeft , unref(limit)!.maxLeft );
    dragState.top = restrictToBounds(pageY - dragState.dy, unref(limit)!.minTop , unref(limit)!.maxTop );
    dragState.bottom = restrictToBounds(-(pageY - dragState.dy), unref(limit)!.minTop , unref(limit)!.maxTop );
    dragState.right = restrictToBounds(-(pageX - dragState.dx), unref(limit)!.minLeft , unref(limit)!.maxLeft );
  }

  // up
  function doMouseUp(e: MouseEvent) {
    dragging.value = false;
    el!.style.backgroundColor = 'transparent';
    el!.style.pointerEvents = 'auto';
    //dragState.width = (el?.parentNode as HTMLElement)?.getBoundingClientRect().width + dragState.left + 'px'
    const parentWidth = (el?.parentNode as HTMLElement)?.getBoundingClientRect().width;
    const parentHeight = (el?.parentNode as HTMLElement)?.getBoundingClientRect().height;
    const width = (parentWidth+dragState[position!]);

    const height = (parentHeight+dragState[position!]);
    //console.log();
    resetPos();
    setTimeout(() => {
      dragState.width = restrictToBounds(width, parseInt(minW as string), parseInt(maxW as string)) + 'px';
      //dragState.height = restrictToBounds(height, parseInt(minH as string), parseInt(maxH as string)) + 'px'
      
    },64);     
  }

  // down
  function doMouseDown(e: MouseEvent) {
    e.preventDefault();
    if(!splitable) return;
    dragging.value = true;
    el!.style.backgroundColor = 'rgba(0,0,0,0.1)';
    el!.style.pointerEvents = 'none';
    dragState.dx = e.pageX;
    dragState.dy = e.pageY;
    removeMouseMove = addEvent(document, 'mousemove', doMouseMove);
    removeMouseUp = addEvent(document, 'mouseup', doMouseUp);
  }
  onMounted(() => {
    el = unref(zoomRef);
    limit.value = limitSize();
    removeMouseDown = addEvent(el, 'mousedown', doMouseDown);
  });
  onBeforeUnmount(() => {
    removeMouseDown();
    removeMouseMove();
    removeMouseUp();
  });
  
  return dragState;
}