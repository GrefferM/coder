/** One call of a declared command: the line, the arguments its braces stand for, and the folder to run it in. */
export interface CommandCall {
  run: string;
  directory: string;
  arguments: Record<string, string>;
  /** Every name this command declared; braces naming anything else are text. */
  declared: string[];
}
