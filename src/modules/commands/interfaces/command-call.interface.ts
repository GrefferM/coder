export interface CommandCall {
  run: string;
  directory: string;
  arguments: Record<string, string>;
  /** Every declared name; braces naming anything else are text. */
  declared: string[];
  /** Aborts the process the moment the turn is stopped. */
  signal?: AbortSignal;
}
