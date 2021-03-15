import { defineComponent, reactive, ref, unref, UnwrapRef, watch } from 'vue';
import { Button } from 'ant-design-vue';
import StandardTable from '~/Table'
import { keys } from 'lodash';
import { ActionType } from '~/typings';
//import '../lib/layout.css'
//import Layout, { useCollapsed, MenuItemData } from '../lib/layout.common'
//import { LayoutType } from '~/typing';
const columns = [
  {
    title: 'Name',
    dataIndex: 'name',
    width: 150,
    key: 'name',
  },
  {
    title: 'Age',
    dataIndex: 'age',
    width: 150,
    key: 'age'
  },
  {
    title: 'Address',
    dataIndex: 'address',
    key: 'address'
  },
];

const data = [...Array(100)].map((_, i) => ({
  key: i,
  name: `Edward King ${i}`,
  age: 32,
  address: `London, Park Lane no. ${i}`,
}));
async function request(params:any, s:any, f:any):Promise<any> {
  return new Promise(res => {
    setTimeout(() => {
      res({
        data: {
          current: 1,
          size: 20,
          records: data,
          total: data.length
        },
        msg: null,
        code: 0
      });
    },1000)
  }) 
}
export default defineComponent({
  setup(props) {
    const selectedKeys = ref([]);
    const actionRef = ref<ActionType & {fullScreen?:() => void}>();
    const rowSelection = {
      type: 'checkbox',
      selectedKeys: selectedKeys.value,
      onChange:(keys:any, rows:any) => {
        selectedKeys.value = keys;
      }
    }

    return () => {
      return (
        <div>
          <Button type='primary' onClick={() => unref(actionRef)?.reload?.()}>reload</Button>
          <StandardTable 
            rowSelection={rowSelection} 
            manualRequest={false} 
            search={true}
            columns={columns} 
            getAction={(action) => actionRef.value = action} 
            request={request} 
            bordered 
          />
        </div>
      )
    }
  }
})