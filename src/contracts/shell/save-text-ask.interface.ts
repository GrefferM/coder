/** What the renderer hands the desktop to save: the whole text, and the name to offer in the chooser. */
export interface SaveTextAsk {
  text: string;
  /** The file name the save dialog opens on; the person may change it and where it goes. */
  suggestedName: string;
}
