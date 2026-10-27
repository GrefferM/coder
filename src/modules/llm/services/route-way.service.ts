import { ROUTE_FINISHED_NOTE, ROUTE_LABEL_SLOT, ROUTE_PASSED_NOTE, ROUTE_TO_NAME } from "../../../contracts";
import type { AgentRouteTool } from "../../../contracts";
import type { CallResult, CallStanding, ToolWay } from "../interfaces";
import type { ToolArguments } from "./tool-arguments.service";

/**
 * One call of the app's own route: the agent names whom its answer goes to, or ends the branch. Nothing runs; the call is
 * the decision, which the turn carries up with its answer.
 */
export class RouteWay implements ToolWay {
  /** The word the model named, or empty where it named none; only `pass_to` names one. */
  private readonly named: string;

  constructor(
    private readonly tool: AgentRouteTool,
    said: Record<string, unknown>,
    private readonly arguments_: ToolArguments,
  ) {
    this.named = this.tool.action === "passTo" ? String(said[ROUTE_TO_NAME] ?? "") : "";
  }

  standing(): CallStanding {
    return {
      source: this.tool.source,
      name: this.tool.name,
      arguments:
        this.tool.action === "passTo"
          ? {
              [ROUTE_TO_NAME]: this.named,
            }
          : {},
      pinned: [],
      serverId: null,
      serverName: "",
    };
  }

  refusal(): string | null {
    if (this.tool.action === "finishHere" || this.chosen() !== null) {
      return null;
    }

    return this.arguments_.choiceNote(
      this.tool.name,
      ROUTE_TO_NAME,
      this.tool.options.map((option) => option.label),
      this.named,
    );
  }

  async make(): Promise<CallResult> {
    const chosen = this.chosen();
    const passed = chosen === null ? [] : [chosen.agentId];

    return {
      // No process ran, so there is no line and no code.
      line: "",
      output:
        this.tool.action === "passTo" ? ROUTE_PASSED_NOTE.replace(ROUTE_LABEL_SLOT, this.named) : ROUTE_FINISHED_NOTE,
      exitCode: null,
      isFailed: false,
      cost: null,
      memories: [],
      route: {
        toAgentIds: passed,
        isFinished: this.tool.action === "finishHere",
      },
    };
  }

  /** The option the model named, or `null` where it named none of those it was given. */
  private chosen(): AgentRouteTool["options"][number] | null {
    return this.tool.options.find((option) => option.label === this.named) ?? null;
  }
}
