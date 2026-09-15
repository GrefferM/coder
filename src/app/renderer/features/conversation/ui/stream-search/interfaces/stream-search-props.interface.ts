export interface StreamSearchProps {
  query: string;
  /** The caret belongs in the field — the hand asked for it, and Enter is to have somewhere to go. */
  isTyping: boolean;
  /** Which match the stream stands on, and how many it holds — «3 З 8». */
  at: number;
  found: number;
  onQuery: (query: string) => void;
  /** The caret came into the field — by ⌘F or by the hand — so Enter has somewhere to go. */
  onOpen: () => void;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
}
