/** What this module needs of whoever runs a declared command: the line, the folder, the arguments, and the outcome. */
export interface ToolRunner {
  call(payload: {
    run: string;
    directory: string;
    arguments: Record<string, string>;
    declared: string[];
  }): Promise<{ line: string; output: string; isFailed: boolean; exitCode: number | null }>;
}
