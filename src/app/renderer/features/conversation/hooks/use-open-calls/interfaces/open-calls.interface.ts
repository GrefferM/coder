/**
 * Which call rows stand open. Nothing opens itself, and once opened a call stays open even when the working
 * card gives way to the finished turn — so the memory is about the **call** and not about the row.
 */
export interface OpenCalls {
  isOpen: (callId: string) => boolean;
  /** The press, and the only thing that ever changes what stands open — save for the one below. */
  toggle: (callId: string) => void;
  /**
   * «ПОКАЗАТИ ВИКЛИК» from the catalogue: the one place where a row opens without a hand on it — the hand was
   * there, in another room. Opening what is open changes nothing.
   */
  open: (callId: string) => void;
}
