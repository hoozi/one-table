import { defineComponent, reactive, ref, unref, UnwrapRef, watch } from 'vue';
import StandardTable from '~/Table';
import Panel from '@hoozi/panel';
import { keys } from 'lodash';
import { ActionType } from '~/typings';
//import '../lib/layout.css'
//import Layout, { useCollapsed, MenuItemData } from '../lib/layout.common'
//import { LayoutType } from '~/typing';

const { Content, Split } = Panel
const columns = [
  /* {
    title: <span>1</span>,
    dataIndex: 'no',
    width: 32,
    align: 'center' as any,
    fixed: 'left' as any
  }, */
  {
    title: '名字',
    dataIndex: 'name',
    width: 150,
    key: 'name',
    //hideInTable: true,
    filters: true,
    onFilter: true,
    valueEnum: {
      '张三': {
        text: '张三',
        value: 'zs'
      }
    }
  },
  {
    title: '年龄',
    dataIndex: 'age',
    width: 150,
    key: 'age',
    defaultSortOrder: 'descend' as any,  
    sorter: (a:any, b: any) => a.age - b.age,
  },
  {
    title: '地址',
    dataIndex: 'address',
    key: 'address',
    with: 200,
    defaultSortOrder: 'descend' as any,  
    sorter: (a:any, b: any) => a.age - b.age
  },
];

const data = [...Array(20)].map((_, i) => ({
  key: i+1,
  name: `张${i+1}`,
  no: i+1,
  age: 10+i,
  address: `浙江宁波 江北区 ${i+1}号马路`
}));
async function request(params:any, s:any, f:any):Promise<any> {
  const rows = data.slice((params.current - 1) * params.pageSize, params.pageSize*params.current);
 
  return new Promise(res => {
    setTimeout(() => {
      res({
        data: {
          current: params.current,
          size: params.pageSize,
          records: rows,
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
      fixed: true,
      selectedKeys: selectedKeys.value,
      onChange:(keys:any, rows:any) => {
        selectedKeys.value = keys;
      }
    }

    return () => {
      return (
        <div style='box-sizing: border-box; padding-left: 200px; padding-top: 80px; background-color:#f0f3f4;height: 100%; width: 100%;display: flex;flex-direction: column;'>
          {/* <div>
            <Button type='primary' onClick={() => unref(actionRef)?.reload?.()}>reload</Button>
          </div> */}
          {/* <StandardTable 
            style='flex: 1 1 0'
            size='small'
            full
            rowSelection={rowSelection} 
            rowKey = 'key'
            pagination={{pageSize: 40}}
            
            columns={columns} 
            getAction={(action) => actionRef.value = action} 
            request={request} 
            bordered 
          />
          <div style='height: 12px'></div>
          <StandardTable 
            style='flex: 1 1 0'
            size='small'
            full
            rowSelection={rowSelection} 
            rowKey = 'key'
            pagination={{pageSize: 40}}
            
            columns={columns} 
            getAction={(action) => actionRef.value = action} 
            request={request} 
            bordered 
          /> */}
          <Panel>
            <Split position='left' w='200px' maxW='300px' minW='100px'>
              <div style='width: 100%;height:100%;background-color:#e4eaec'></div>
            </Split>
            <Content>
              <Panel direction='vertical'>
                <Content>
                  <StandardTable 
                    style='flex: 1 1 0'
                    size='small'
                    full
                    rowSelection={rowSelection} 
                    /* locale={{
                      emptyText: '暂无数据'
                    } as any} */
                    rowKey = 'key'
                    scroll={{x: 1000}}
                    columns={columns} 
                    getAction={(action) => actionRef.value = action} 
                    request={request} 
                    bordered
                  />
                </Content>
                <Split position='bottom' h='200px' maxH='300px'>
                  <div style='width: 100%;height:100%;background-color:#fff;display:flex;flex-direction: column'>
                      <div style='flex:1'>
                        <StandardTable 
                          style='flex: 1 1 0'
                          size='small'
                          full
                          rowSelection={rowSelection} 
                          rowKey = 'key'
                          pagination={false}
                          columns={columns} 
                          getAction={(action) => actionRef.value = action} 
                          request={request} 
                          bordered 
                        />
                      </div>
                  </div>
                </Split>
              </Panel>
            </Content>
            <Split position='right' w='320px'><div style='width: 100%;height:100%;background-color:#fff'></div></Split>
          </Panel>
        </div>
      )
    }
  }
})