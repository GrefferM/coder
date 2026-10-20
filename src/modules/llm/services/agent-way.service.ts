import { AGENT_TOOL_INPUT_NAME } from "../constants";
import type { AgentCall, CallResult, CallStanding, ToolWay } from "../interfaces";

/** One call of another agent as a tool: a whole turn of that agent, whose answer is the call's output. */
export class AgentWay implements ToolWay {
  constructor(private readonly call: AgentCall) {}

  standing(): CallStanding {
    return {
      source: this.call.tool.source,
      name: this.call.tool.name,
      arguments: {
        [AGENT_TOOL_INPUT_NAME]: this.call.request,
      },
      pinned: [],
      serverId: null,
      serverName: "",
    };
  }

  refusal(): string | null {
    return this.call.refusal;
  }

  async make(callId: string, directory: string, signal: AbortSignal): Promise<CallResult> {
    const outcome = await this.call.run(signal);

    return {
      // No process ran, so there is no line and no code.
      line: "",
      output: outcome.text,
      exitCode: null,
      isFailed: outcome.isFailed,
      cost: outcome.cost,
      memories: outcome.memories,
    };
  }
}
