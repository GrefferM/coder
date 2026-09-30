export interface PassSwitchProps {
  /** The open pass's position in the flow, from one, and the number of passes. */
  place: number;
  count: number;
  onGo: (place: number) => void;
}
