/** Output goes to the model, line and exit code to the record. */
export interface CommandResult {
  /** The line as it ran, with the values already in it. */
  line: string;
  output: string;
  isFailed: boolean;
  /** `null` when there was no process to give one. */
  exitCode: number | null;
}
