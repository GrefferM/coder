/** Watches the open project's folder; `follow` moves it, `remember` notes it, `unfollow` puts it down. */
export interface ProjectWatch {
  follow(directory: string): Promise<void>;
  remember(directory: string): Promise<void>;
  unfollow(): void;
}
