/** One run's outcome; the output and the failure go to the model, the line and the code to the record. */
export interface CommandResult {
  /** The line as it ran, with the values already in it. */
  line: string;
  output: string;
  isFailed: boolean;
  /** The exit code; `null` when there was no process to give one. */
  exitCode: number | null;
}
