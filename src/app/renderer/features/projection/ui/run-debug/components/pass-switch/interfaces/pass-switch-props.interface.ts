export interface PassSwitchProps {
  /** Which pass of the flow stands open, counted from one, and how many passes there are. */
  place: number;
  count: number;
  onGo: (place: number) => void;
}
