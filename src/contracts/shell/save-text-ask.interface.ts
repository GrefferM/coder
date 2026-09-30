/** What the renderer hands the desktop to save: the whole text and the name to offer. */
export interface SaveTextAsk {
  text: string;
  /** The file name the save dialog opens on. */
  suggestedName: string;
}
