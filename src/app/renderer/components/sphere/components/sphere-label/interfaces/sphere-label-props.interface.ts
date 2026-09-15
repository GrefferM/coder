export interface SphereLabelProps {
  name: string;
  subtext?: string;
  accentColor: string;
  isActive?: boolean;
  isLit?: boolean;
  /** Table 11: at small canvas scale the model line takes its full tone. */
  isDrawnSmall?: boolean;
  /** State colour of the dot beside the name — the same colour the panel writes. */
  stateColor?: string;
}
