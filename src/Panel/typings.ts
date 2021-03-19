export type PanelProps = {
  direction: 'horizontal' | 'vertical'
}

export type Position = 'right' | 'left' | 'bottom' | 'top';

export type PanelSplitProps = {
  splitable: boolean;
  collapsible: boolean;
  w: string | false;
  h: string | false;
  maxW: string | false;
  maxH: string | false;
  minW: string | false;
  minH: string | false;
  position: Position;
}

export type PanelKey = PanelProps;

export type SplitSize = Record<string, string>