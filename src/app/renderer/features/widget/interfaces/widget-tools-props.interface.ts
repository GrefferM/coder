export interface WidgetToolsProps {
  /** «НОВА РОЗМОВА» stands while nothing is out and the sphere has a conversation. */
  canBeginAgain: boolean;
  onBeginAgain: () => void;
  /** The history stands in the output's place. */
  isHistoryOpen: boolean;
  onToggleHistory: () => void;
  /** The ends of the walks are left unread; the speaker shows it crossed. */
  isSilent: boolean;
  onToggleSilent: () => void;
  onOpenMain: () => void;
}
