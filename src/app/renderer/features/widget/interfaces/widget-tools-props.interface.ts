export interface WidgetToolsProps {
  /** «НОВА РОЗМОВА» stands while nothing is out and the sphere has a conversation. */
  canBeginAgain: boolean;
  onBeginAgain: () => void;
  /** The history stands in the output's place. */
  isHistoryOpen: boolean;
  onToggleHistory: () => void;
  /** An end of a walk is being read aloud now. */
  isReading: boolean;
  onStopReading: () => void;
  onOpenMain: () => void;
}
