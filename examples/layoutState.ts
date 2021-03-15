// @ts-nocheck
import { reactive, UnwrapRef } from 'vue';
import { MenuItemData, PureSettings } from '~/index'

const menuData = [
  {
    path: '/welcome/home',
    name: 'home',
    meta: { title: '菜单1111' }
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    meta: { icon: 'dashboard-outlined', title: '菜单二' },
    children: [
      {
        path: 'analysis',
        name: 'analysis',
        meta: { icon: 'SmileOutlined', title: '菜单二-1' },
      },
      {
        path: 'monitor',
        name: 'monitor',
        meta: { icon: 'SmileOutlined', title: '菜单二-2' },
      },
      {
        path: 'workplace',
        name: 'workplace',
        meta: { icon: 'SmileOutlined', title: '菜单二-3' },
      },
    ],
  },
  {
    path: '/form',
    name: 'form',
    meta: { title: '菜单三', icon: 'SmileOutlined' },
    children: [
      {
        path: 'basic-form',
        name: 'basic-form',
        meta: { icon: 'SmileOutlined', title: '菜单三-1' },
      },
      {
        path: 'step-form',
        name: 'step-form',
        children: [
          {
            path: 'test',
            name: 'test',
            meta: {  title: '菜单三-2-1222222312蛋蛋' }
          }
        ],
        meta: { icon: 'SmileOutlined', title: '菜单三-2' },
      },
      {
        path: 'advanced-form',
        name: 'advance-form',
        meta: { icon: 'SmileOutlined', title: '菜单三-3' },
      },
    ],
  }
]
type State = Partial<PureSettings> & 
{
  menuData?: MenuItemData[], 
  openKeys:string[], 
  selectedKeys:string[]
}
/* navTheme='dark'
          headerTheme='dark'
          fixedHeader
          layout='mix' */
export default reactive<State>({
  menuData,
  openKeys: [],
  selectedKeys: [],
  fixedHeader: true,
  fixedSidebar: true,
  primaryColor: '#1890ff',
  layout: 'mix',
  navTheme: 'dark',
  headerHeight: 42,
  sidebarWidth: 208,
  hasTab: true,
  collapsedWidth: 48
})