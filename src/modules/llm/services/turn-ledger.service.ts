import { addedCost } from "../../../contracts/runs/added-cost";
import type { ChatCost } from "../../../contracts/walks/chat-cost.interface";
import type { AgentAnswer, RouteChoice, ToolMemory, TurnCall } from "../interfaces";

/**
 * What a turn has said, spent and run so far; every end of the turn is counted from it. A turn cut by the ceiling or
 * stopped by hand keeps what it had said and done.
 */
export class TurnLedger {
  private said = "";
  private readonly made: TurnCall[] = [];
  private readonly compressed: ToolMemory[] = [];
  private billed: ChatCost | null = null;
  private route: RouteChoice | null = null;
  private ended = false;
  private inputTokens = 0;
  private outputTokens = 0;
  private calls = 0;

  /** Whether the turn has spent the calls allowed; a ceiling of nought is never spent. */
  isSpent(maxCalls: number): boolean {
    return maxCalls !== 0 && this.calls >= maxCalls;
  }

  /** Whether this many more calls would pass the allowance; nought allows any number. */
  wouldOverspend(more: number, maxCalls: number): boolean {
    return maxCalls !== 0 && this.calls + more > maxCalls;
  }

  /** One call spent; a model round and a tool run count the same. */
  spend(): void {
    this.calls += 1;
  }

  heard(words: string, inputTokens: number, outputTokens: number): void {
    this.said += words;
    this.inputTokens += inputTokens;
    this.outputTokens += outputTokens;
  }

  ran(call: TurnCall): void {
    this.made.push(call);
  }

  /** What an agent called cost, its own turn and the agents it called in turn, added to the turn's. */
  billedFor(cost: ChatCost | null): void {
    this.billed = addedCost(this.billed, cost);
  }

  /** The compressions the agents called made of their memories on the way, spent whether the call came to an answer or not. */
  composed(memories: ToolMemory[]): void {
    this.compressed.push(...memories);
  }

  /** Where the agent has sent its answer so far: whom it named, and whether it ended the branch; what one call decides adds to the rest. */
  routed(choice: RouteChoice | null): void {
    if (choice === null) {
      return;
    }

    const named = this.route?.toAgentIds ?? [];
    const toAgentIds = [...named, ...choice.toAgentIds.filter((id) => !named.includes(id))];

    this.route = {
      toAgentIds,
      // Naming beats ending: where the agent did both, the answer goes to those named.
      isFinished: toAgentIds.length === 0 && ((this.route?.isFinished ?? false) || choice.isFinished),
    };
    this.ended = true;
  }

  /** Whether a system command went through, which is the agent's last word of the turn. */
  isEnded(): boolean {
    return this.ended;
  }

  /** The answer as the turn stands; each end names itself, an ordinary answer names none. */
  answer(end: { isCallsExhausted?: boolean; isCeilingHit?: boolean; isStopped?: boolean } = {}): AgentAnswer {
    return {
      text: this.said,
      isStopped: end.isStopped ?? false,
      isCallsExhausted: end.isCallsExhausted ?? false,
      isCeilingHit: end.isCeilingHit ?? false,
      inputTokens: this.inputTokens,
      outputTokens: this.outputTokens,
      calls: this.made,
      called: this.billed,
      memories: this.compressed,
      route: this.route,
    };
  }
}
