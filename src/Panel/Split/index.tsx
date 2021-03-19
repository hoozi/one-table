import './index.less';
import { defineComponent, inject, computed, toRefs, unref, ref, CSSProperties, onMounted, watch } from 'vue';
import PropTypes from 'ant-design-vue/es/_util/vue-types';
import usePrefix from '../hooks/usePrefix';
import { PanelSplitProps, Position } from '../typings';
import { panelKey, cssMap, reverseCSSKey } from '../token';
import useZoomDrag from '../hooks/useZoomDrag';


const Split = defineComponent<PanelSplitProps>({
  setup(props, { slots }) {
    const {
      position,
      splitable,
      collapsible,
      maxW,
      w,
      h,
      maxH,
      minW,
      minH
    } = props;
    const zoomRef = ref<HTMLElement | null>(null);
    const baseCls = usePrefix('panel-split');
    const { direction } = inject(panelKey) || {};
    const splitCls = computed(() => ({
      [`${baseCls}`]: true,
      [`${baseCls}-${direction}`]: true
    }));
    const splitZoomCls = computed(() => ({
      [`${baseCls}-zoom`]: true,
      [`${baseCls}-zoom-${direction}`]: true
    }));
    const dragState = useZoomDrag(zoomRef, {
      direction,
      w,
      h,
      maxW: unref(maxW),
      minW: unref(minW) || ( position === 'right' ? '24px' : false) || undefined,
      maxH: unref(maxH),
      minH: unref(minH) || ( position === 'bottom' ? '24px' : false) || undefined,
      splitable: unref(splitable),
      position: unref(position)
    });
    return () => {
      return (
        <div 
          class={splitCls.value} 
          style={
            Object.assign(
              {
                width: dragState.width, 
                height: dragState.height
              },
              cssMap[unref(position)].split
            )
          }
        >
          <div 
            class={splitZoomCls.value} 
            style={{
              ...cssMap[unref(position)].zoom,
              [`${reverseCSSKey[unref(position)]}`]: `${-dragState[unref(position)]}px`
            }} 
            ref={zoomRef}
          >
            {
              unref(collapsible) && <div class={`${baseCls}-arrow-${unref(position)}`}></div>
            }
          </div>
          <div style='flex: 1;'>{ slots.default?.() }</div>
        </div>
      )
    }
  }
})
Split.displayName = 'OnePanelSplit'
Split.props = {
  splitable: PropTypes.bool.def(true),
  collapsible: PropTypes.bool.def(true),
  w: PropTypes.oneOfType([String, Boolean]).def(false),
  h: PropTypes.oneOfType([String, Boolean]).def(false),
  maxW: PropTypes.oneOfType([String, Boolean]).def(false),
  maxH: PropTypes.oneOfType([String, Boolean]).def(false),
  minW: PropTypes.oneOfType([String, Boolean]).def(false),
  minH: PropTypes.oneOfType([String, Boolean]).def(false),
  position: PropTypes.oneOf(['top','bottom','left','right']).def('left')
}

export default Split;