/** Open call rows, keyed by call so a row stays open when the working card gives way to the finished turn. */
export interface OpenCalls {
  isOpen: (callId: string) => boolean;
  toggle: (callId: string) => void;
  /** «ПОКАЗАТИ ВИКЛИК» from the catalogue: opens a row without a press on it; opening an open call changes nothing. */
  open: (callId: string) => void;
}
