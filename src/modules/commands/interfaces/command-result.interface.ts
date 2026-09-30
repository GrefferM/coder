/** One run's outcome; output and failure go to the model, line and code to the record. */
export interface CommandResult {
  /** The line as it ran, with the values already in it. */
  line: string;
  output: string;
  isFailed: boolean;
  /** The exit code; `null` when there was no process to give one. */
  exitCode: number | null;
}
