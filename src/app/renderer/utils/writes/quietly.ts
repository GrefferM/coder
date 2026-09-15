/** Runs a write and swallows a failure; the note line is what names what stopped it. */
export function quietly(write: () => Promise<unknown>): void {
  void write().catch(() => undefined);
}
