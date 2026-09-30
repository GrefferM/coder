export interface SphereLabelProps {
  name: string;
  subtext?: string;
  accentColor: string;
  isActive?: boolean;
  isLit?: boolean;
  /** At small canvas scale the model line takes its full tone. */
  isDrawnSmall?: boolean;
  /** Colour of the state dot beside the name, the same the panel writes. */
  stateColor?: string;
}
