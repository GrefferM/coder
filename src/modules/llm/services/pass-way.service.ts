import { ROUTE_LABEL_SLOT, ROUTE_PASSED_NOTE, ROUTE_TEXT_NAME, ROUTE_TO_NAME } from "../../../contracts";
import type { AgentSystemTool, RouteOption } from "../../../contracts";
import type { CallResult, CallStanding, ToolWay } from "../interfaces";
import type { ToolArguments } from "./tool-arguments.service";

/** What separates the names of a `pass_to`, as the row says them and as the model is told them back. */
const NAMES_SEPARATOR = ", ";

/**
 * One call of `pass_to`: the agent names whom it hands a text of its own. Nothing runs; the call is the hand-over, which
 * the turn gathers and gives out once it ends.
 */
export class PassWay implements ToolWay {
  /** The words the model named, in its order. */
  private readonly named: string[];
  /** What those named get, as the model wrote it. */
  private readonly text: string;

  constructor(
    private readonly tool: AgentSystemTool,
    said: Record<string, unknown>,
    private readonly arguments_: ToolArguments,
  ) {
    this.named = this.namesOf(said[ROUTE_TO_NAME]);
    this.text = typeof said[ROUTE_TEXT_NAME] === "string" ? said[ROUTE_TEXT_NAME].trim() : "";
  }

  standing(): CallStanding {
    return {
      source: this.tool.source,
      name: this.tool.name,
      arguments: {
        [ROUTE_TO_NAME]: this.named.join(NAMES_SEPARATOR),
        [ROUTE_TEXT_NAME]: this.text,
      },
      pinned: [],
      serverId: null,
      serverName: "",
    };
  }

  /** Naming nobody is as wrong as naming one that is not there, and an empty text passes nothing either. */
  refusal(): string | null {
    const unknown = this.named.filter((word) => !this.tool.options.some((option) => option.label === word));

    if (this.named.length === 0 || unknown.length > 0) {
      return this.arguments_.choiceNote(
        this.tool.name,
        ROUTE_TO_NAME,
        this.tool.options.map((option) => option.label),
        unknown.join(NAMES_SEPARATOR),
      );
    }

    if (this.text === "") {
      return this.arguments_.missingNote(this.tool.name, ROUTE_TEXT_NAME);
    }

    return null;
  }

  async make(): Promise<CallResult> {
    return {
      // No process ran, so there is no line and no code.
      line: "",
      output: ROUTE_PASSED_NOTE.replace(ROUTE_LABEL_SLOT, this.named.join(NAMES_SEPARATOR)),
      exitCode: null,
      isFailed: false,
      cost: null,
      memories: [],
      route: {
        passes: this.chosen().map((option) => ({
          agentId: option.agentId,
          text: this.text,
        })),
        isFinished: false,
      },
    };
  }

  /** The names the model gave for `to`: a list, or a lone word where it did not make one. */
  private namesOf(given: unknown): string[] {
    if (Array.isArray(given)) {
      return given.map((word) => String(word).trim()).filter((word) => word !== "");
    }

    const word = typeof given === "string" ? given.trim() : "";

    return word === "" ? [] : [word];
  }

  /** The options the model named, once each, in the order it named them. */
  private chosen(): RouteOption[] {
    const options: RouteOption[] = [];

    for (const word of this.named) {
      const option = this.tool.options.find((held) => held.label === word) ?? null;

      if (option !== null && !options.includes(option)) {
        options.push(option);
      }
    }

    return options;
  }
}
