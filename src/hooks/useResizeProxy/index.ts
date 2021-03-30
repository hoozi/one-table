import { getCurrentInstance, onMounted } from 'vue';
import { createDom } from '../../utils/dom';

export default function useResizeProxy() {
  const instance = getCurrentInstance();
  const proxy = createDom('div', {
    class: 'resize-proxy',
    style: 'display:none'
  });
  
  onMounted(() => {
    const antTable = instance?.vnode.el?.querySelector('.ant-table-content');
    antTable.appendChild(proxy);
  });
}