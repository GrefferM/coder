export interface StreamSearchProps {
  query: string;
  /** Whether the caret belongs in the field. */
  isTyping: boolean;
  /** The match the stream stands on and how many it holds: «3 З 8». */
  at: number;
  found: number;
  onQuery: (query: string) => void;
  /** The caret entered the field (⌘F or pointer). */
  onOpen: () => void;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
}
