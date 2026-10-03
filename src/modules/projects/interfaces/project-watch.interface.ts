/**
 * Watches the open project's folder; `follow` moves it, `remember` notes it, `unfollow` stops it. A print is what the
 * folder holds, in one short string.
 */
export interface ProjectWatch {
  /** Follows the folder and gives the print it starts from. */
  follow(directory: string): Promise<string>;
  /** Takes the folder as it stands as the app's own, silently, and gives its print. */
  remember(directory: string): Promise<string>;
  /** The folder's print at this moment; nothing is noted. */
  print(directory: string): Promise<string>;
  /** Reads the followed folder once more and tells of a change the watch has not heard. */
  look(): Promise<void>;
  unfollow(): void;
}
