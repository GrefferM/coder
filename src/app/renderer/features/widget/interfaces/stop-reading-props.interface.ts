export interface StopReadingProps {
  /** An end of a walk is being read aloud now. */
  isReading: boolean;
  onStop: () => void;
}
