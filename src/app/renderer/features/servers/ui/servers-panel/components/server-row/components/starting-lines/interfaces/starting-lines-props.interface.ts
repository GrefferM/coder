export interface StartingLinesProps {
  /** Whole seconds since this server's ask began. */
  waited: number;
  /** «СКАСУВАТИ»: gives the place back at once and asks nothing. */
  onCancel: () => void;
}
