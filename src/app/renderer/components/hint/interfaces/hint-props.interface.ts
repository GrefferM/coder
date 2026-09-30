export interface HintProps {
  /** The hint's words; nothing is shown when empty. */
  text: string;
  /** The reading kind wraps and grows down; the recognition kind is one line cut with «…». */
  isReading: boolean;
  /** Where the thing it is about stands, in window coordinates. */
  at: {
    left: number;
    top: number;
    bottom: number;
  };
}
