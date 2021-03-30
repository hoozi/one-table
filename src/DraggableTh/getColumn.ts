import { getCurrentInstance, inject } from 'vue';
import { tableKey } from '../token';

function getColumn() {
  const instance = getCurrentInstance();
  const { columns } = inject(tableKey) || {}
  const key = instance?.vnode.key;
  return columns?.find(column => {
    return (column.key || column.dataIndex) === key
  });
}

export default getColumn