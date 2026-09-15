export interface HintProps {
  /** The words themselves; a hint with nothing to say is not shown at all. */
  text: string;
  /** The reading kind wraps and grows down; the recognition kind stays one line and cuts with «…». */
  isReading: boolean;
  /** Where the thing it is about stands, in the window's own coordinates. */
  at: {
    left: number;
    top: number;
    bottom: number;
  };
}
