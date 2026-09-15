export interface StartingLinesProps {
  /** Whole seconds since this server's ask began — the second line waits on the twentieth of them. */
  waited: number;
  /** «СКАСУВАТИ»: gives the place back at once and asks nothing. */
  onCancel: () => void;
}
