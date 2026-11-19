export interface WidgetToolsProps {
  /** An end of a walk is being read aloud now. */
  isReading: boolean;
  onStopReading: () => void;
  onOpenMain: () => void;
}
