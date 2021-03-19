import './index.less';
import { defineComponent, provide, readonly, inject, PropType, computed, toRefs, unref } from 'vue';
import PropTypes from 'ant-design-vue/es/_util/vue-types';
import usePrefix from './hooks/usePrefix';
import Content from './Content';
import Split from './Split';
import { PanelProps } from './typings';
import { panelKey } from './token';

const Panel = defineComponent<PanelProps>({
  setup(props, { slots }) {
    const baseCls = usePrefix('panel');
    provide(panelKey, readonly({
      direction: props.direction
    }));
    const panelCls =  computed(() => ({
      [`${baseCls}`]: true,
      [`${baseCls}-${props.direction}`]: true
    }))
    const flexDirection = computed(() => props.direction === 'horizontal' ? 'row' : 'column');
    return () => {
      return (
        <div class={panelCls.value} style={{flexDirection:flexDirection.value}}>
          { slots.default?.() }
        </div>
      )
    }
  }
});

Panel.displayName = 'OnePanel';
Panel.props = {
  direction: {
    type: String as PropType<'horizontal' | 'vertical'>,
    default: 'horizontal'
  }
}

Panel.Content = Content;
Panel.Split = Split;

export default Panel as typeof Panel & {
  readonly Content: typeof Content;
  readonly Split: typeof Split;
};