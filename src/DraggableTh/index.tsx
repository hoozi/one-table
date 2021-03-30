import { CSSProperties, defineComponent, getCurrentInstance, inject } from 'vue';
import PropTypes from 'ant-design-vue/es/_util/vue-types';
import useEvent from '../hooks/useEvent';
import { OneTableColumnProps, OneTableProps } from '../typings';
import getColumn from './getColumn';
import { tableKey } from '../token';

type Props = {
  style: CSSProperties;
  class: string;
  key: string;
}

const DraggableTh = defineComponent<Props>({
  name: 'draggableTh',
  setup(props, { slots }) {
    const column = getColumn();
    let table = getCurrentInstance();
    while(table && table.type.name !== 'Table') {
      table = table.parent;
    }
    const { 
      handleMouseDown,
      handleMouseMove,
      handleMouseOut
    } = useEvent(table?.vnode.props as OneTableProps);
    return () => (
      <th 
        {...props} 
        onMousedown={evt => handleMouseDown(evt, column as OneTableColumnProps)}
        onMousemove={evt => handleMouseMove(evt, column as OneTableColumnProps)}
        onMouseout={handleMouseOut}
      >{ slots.default?.() }</th>
    )
  }
});

DraggableTh.props = {
  style: PropTypes.style,
  class: PropTypes.string,
  key: PropTypes.string
}

export default DraggableTh;