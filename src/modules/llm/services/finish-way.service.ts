import { ROUTE_FINISHED_NOTE } from "../../../contracts";
import type { AgentSystemTool } from "../../../contracts";
import type { CallResult, CallStanding, ToolWay } from "../interfaces";

/** One call of `finish_here`: the agent ends its branch. Nothing runs, and it takes no arguments to refuse. */
export class FinishWay implements ToolWay {
  constructor(private readonly tool: AgentSystemTool) {}

  standing(): CallStanding {
    return {
      source: this.tool.source,
      name: this.tool.name,
      arguments: {},
      pinned: [],
      serverId: null,
      serverName: "",
    };
  }

  refusal(): string | null {
    return null;
  }

  async make(): Promise<CallResult> {
    return {
      // No process ran, so there is no line and no code.
      line: "",
      output: ROUTE_FINISHED_NOTE,
      exitCode: null,
      isFailed: false,
      cost: null,
      memories: [],
      route: {
        toAgentIds: [],
        isFinished: true,
      },
    };
  }
}
