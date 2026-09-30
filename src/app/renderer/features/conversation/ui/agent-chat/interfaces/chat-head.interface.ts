/** The band naming the conversation on screen: an opened run or the live chat. */
export interface ChatHead {
  at: Date;
  /** The words for how it ended, shown by one dot's colour. */
  state: string;
  /** Whether this is a run read back; a live chat has no end. */
  isOpened: boolean;
  isFailed: boolean;
}
