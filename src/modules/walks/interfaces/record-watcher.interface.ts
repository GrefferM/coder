/** Who the writer tells of a row opened, a row gone and a record written, and who tells it of a walk put away. */
export interface RecordWatcher {
  learnRow(runKey: string, runId: string): void;
  forgetRow(runId: string): void;
  isPutAway(runKey: string): boolean;
  written(): void;
}
