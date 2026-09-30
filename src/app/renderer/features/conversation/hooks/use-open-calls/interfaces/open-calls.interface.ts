/**
 * Which call rows stand open; keyed by the **call**, so a row stays open when the working card gives way to the
 * finished turn.
 */
export interface OpenCalls {
  isOpen: (callId: string) => boolean;
  /** The press; changes what stands open, apart from `open`. */
  toggle: (callId: string) => void;
  /** «ПОКАЗАТИ ВИКЛИК» from the catalogue: opens a row without a press on it; opening an open call changes nothing. */
  open: (callId: string) => void;
}
