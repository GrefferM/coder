import type { AgentCommandTool, ToolRunner } from "../interfaces";
import type { CallResult, CallStanding, ToolWay } from "../interfaces";
import type { ToolArguments } from "./tool-arguments.service";

/** One call of a declared command: the check, the line, and what it printed. */
export class CommandWay implements ToolWay {
  /** Pinned values override the model's arguments. */
  private readonly given: Record<string, string>;

  constructor(
    private readonly tool: AgentCommandTool,
    said: Record<string, unknown>,
    private readonly runner: ToolRunner,
    private readonly arguments_: ToolArguments,
  ) {
    const given: Record<string, string> = {};

    for (const [name, value] of Object.entries(said)) {
      given[name] = String(value);
    }

    Object.assign(given, tool.pinned);

    this.given = given;
  }

  standing(): CallStanding {
    return {
      source: this.tool.source,
      name: this.tool.name,
      arguments: this.given,
      pinned: Object.keys(this.tool.pinned),
      serverId: null,
      serverName: "",
    };
  }

  refusal(): string | null {
    const complaints = this.arguments_.complaints(this.tool, this.given);

    return complaints.length === 0 ? null : this.arguments_.notRunNote(this.tool.name, complaints);
  }

  async make(callId: string, directory: string, signal: AbortSignal): Promise<CallResult> {
    const result = await this.runner.call({
      run: this.tool.run,
      directory,
      arguments: this.given,
      signal,
      // Braces are read against these names alone; other braces are the line's own text.
      declared: [...this.tool.parameters.map((parameter) => parameter.name), ...Object.keys(this.tool.pinned)],
    });

    return {
      line: result.line,
      output: result.output,
      exitCode: result.exitCode,
      // A command reports failure by exit code, which the card reads; «ні» is a server's word.
      isFailed: false,
    };
  }
}
