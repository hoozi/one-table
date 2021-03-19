import { InjectionKey,CSSProperties } from 'vue';
import { PanelKey, Position } from './typings';

export const panelKey: InjectionKey<PanelKey> = Symbol();

export const cssMap:Record<Position, Record<string, CSSProperties>> = {
  'bottom': {
    'split': {
      marginTop: '8px'
    },
    'zoom': {
      top: '-8px',
      bottom: 'auto'
    }
  },
  'top':  {
    'split': {
      marginBottom: '8px'
    },
    'zoom': {
      bottom: '-8px',
      top: 'auto'
    }
  },
  'left': {
    'split': {
      marginRight: '8px'
    },
    'zoom': {
      right: '-8px',
      left: 'auto'
    }
  },
  'right': {
    'split': {
      marginLeft: '8px'
    },
    'zoom': {
      left: '-8px',
      right: 'auto'
    }
  }
}

export const reverseCSSKey: Record<Position, string> = {
  'top': 'bottom',
  'bottom': 'top',
  'left': 'right',
  'right': 'left'
}