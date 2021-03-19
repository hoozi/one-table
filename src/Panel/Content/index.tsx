import './index.less';
import { defineComponent } from 'vue';
import usePrefix from '../hooks/usePrefix';

const Content = defineComponent({
  setup(props, { slots }) {
    const baseCls = usePrefix('panel-content');
    return () => {
      return (
        <div class={baseCls}>
          { slots.default?.() }
        </div>
      )
    }
  }
});

Content.displayName = 'OnePanelContent';

export default Content;