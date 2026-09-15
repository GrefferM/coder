/** The band over the stream, naming the conversation on screen — an opened run or the live chat. */
export interface ChatHead {
  at: Date;
  /** The words for how it ended, said here by the colour of one dot. */
  state: string;
  /** Whether this is a run read back; a live chat has no end to speak of and nothing to read wrong. */
  isOpened: boolean;
  isFailed: boolean;
}
