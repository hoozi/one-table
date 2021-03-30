import { getCurrentInstance, ref, unref, onMounted, VNode } from 'vue';
import { addEvent } from '~/utils/dom';
import { OneTableColumnProps, OneTableProps } from '../../typings';

type DragState = {
  dx: number;
  startLeft: number;
  startColLeft: number;
}

function getTable(vd:any, name: string) {
  let parent = vd;
  while(parent.vnode.type.name!==name) {
    parent = parent.parent;
  }
  return parent;
}

function getParentIsTH(target: any) {
  let _target = target;
  while(_target && _target.tagName !=='TH') {
    _target = _target.parentNode;
  }
  return _target
}

function useEvent(
  props: OneTableProps
) {
  const instance = getCurrentInstance();
  const parent = getTable(instance?.parent, 'OneTable');
  const dragState = ref<DragState | null>(null);
  const draggingColumn = ref<any>(null);
  const dragging = ref<boolean>(false);
  
  //console.log(getTableVNode(parent));
  const handleMouseDown = (evt: MouseEvent, column: OneTableColumnProps) => {
    let removeMouseMove:any = null;
    let removeMouseUp:any = null;

    if(!column || !!!column.resizable) return;
    
    //对于有group的表头 不做收缩
    if(column.children && column.children.length > 0) return;
    
    if(!draggingColumn.value && !!!props.bordered) return;
    
    dragging.value = true;
    const resizeProxy = parent?.vnode.el.querySelector('.resize-proxy');
    const bodyStyle = document.body.style;
    const tableEl = parent?.vnode.el.querySelector('.ant-table-content') as HTMLElement;
    const tableLeft = tableEl.getBoundingClientRect().left;
    const colEl = tableEl.querySelector(`th.ant-table-${column.key || column.dataIndex}`);
    const colRect = colEl!.getBoundingClientRect();
    const minLeft = colRect.left - tableLeft + 30;
    tableEl.style.pointerEvents = 'none';
    bodyStyle.cursor = 'col-resize';
    
    // @ts-ignore
    dragState.value = {
      dx: evt.clientX,
      startLeft: colRect.right - tableLeft,
      startColLeft: colRect.left - tableLeft
    }

    resizeProxy.style.display = 'block';
    resizeProxy.style.left = unref(dragState)!.startLeft + 'px';

    const handleMouseMove = (evt: MouseEvent) => {
      const deltaLeft = evt.clientX - (dragState.value as any).dx
      const proxyLeft = (dragState.value as any).startLeft + deltaLeft
      resizeProxy.style.left = Math.max(minLeft, proxyLeft) + 'px'
    }

    const handleMouseUp = (evt: MouseEvent) => {
      if(!dragging.value) return;
      dragging.value = false;

      const resizeProxyLeft = parseInt(resizeProxy.style.left, 10);
      const columnWidth = resizeProxyLeft - dragState.value!.startColLeft;
      
      bodyStyle.cursor = '';
      tableEl.style.pointerEvents = 'auto';
      resizeProxy.style.display = 'none';

      column.width = columnWidth;
     
      removeMouseMove();
      removeMouseUp();
    }
    removeMouseMove = addEvent(document, 'mousemove', handleMouseMove);
    removeMouseUp = addEvent(document, 'mouseup', handleMouseUp);
  }
  const handleMouseMove = (evt: MouseEvent, column: OneTableColumnProps) => {
    if(!column || !!!column.resizable) return;
    if(column.children && column.children.length > 0) return;
    if(dragging.value && !!!props.bordered) return;
    
    const target = evt.target;
    const thEl = getParentIsTH(target) as HTMLElement;
    const thRect = thEl.getBoundingClientRect();
    const bodyStyle = document.body.style;
    
    if(thRect.right - evt.clientX < 8 && thRect.width > 12) {
      bodyStyle.cursor = 'col-resize';
      if(thEl.className.indexOf('has-filters') > -1) {
        thEl.style.cursor = 'col-resize';
      }
      draggingColumn.value = column;
    } else if(!dragging.value) {
      bodyStyle.cursor = '';
      if(thEl.className.indexOf('has-filters') > -1) {
        thEl.style.cursor = '';
      }
      draggingColumn.value = null;
    }
  }
  const handleMouseUp = () => {

  }
  const handleMouseOut = () => {
    document.body.style.cursor = '';
  }

  return {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseOut
  }
}

export default useEvent;