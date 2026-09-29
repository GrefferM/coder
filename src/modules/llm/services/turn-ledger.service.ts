import type { AgentAnswer, TurnCall } from "../interfaces";

/**
 * What a turn has said, spent and run so far — the one thing every end of it is counted from.
 *
 * The five move together and are read together: a turn that hit the ceiling keeps the words it had already said
 * and the calls it had already made, and so does one a hand stopped. Kept as five loose counters they were
 * threaded through the loop, the round and the calls by hand, and every end had to name all five in order.
 */
export class TurnLedger {
  private said = "";
  private readonly made: TurnCall[] = [];
  private inputTokens = 0;
  private outputTokens = 0;
  private calls = 0;

  /** Whether the turn has spent the calls the person allowed it; a ceiling of nought is no ceiling, never spent. */
  isSpent(maxCalls: number): boolean {
    return maxCalls !== 0 && this.calls >= maxCalls;
  }

  /** Whether this many more calls would take the turn past what the person allowed it; nought allows any number. */
  wouldOverspend(more: number, maxCalls: number): boolean {
    return maxCalls !== 0 && this.calls + more > maxCalls;
  }

  /** One call spent: a round of the model and a tool run count the same. */
  spend(): void {
    this.calls += 1;
  }

  /** A piece of the answer as it arrives, and what the provider counted for it. */
  heard(words: string, inputTokens: number, outputTokens: number): void {
    this.said += words;
    this.inputTokens += inputTokens;
    this.outputTokens += outputTokens;
  }

  /** One call this turn made, in the order it made it. */
  ran(call: TurnCall): void {
    this.made.push(call);
  }

  /**
   * The answer as the turn stands. Each end names itself and nothing else — a turn that answered names none of
   * them, which is what an ordinary answer is.
   */
  answer(end: { isCallsExhausted?: boolean; isCeilingHit?: boolean; isStopped?: boolean } = {}): AgentAnswer {
    return {
      text: this.said,
      isStopped: end.isStopped ?? false,
      isCallsExhausted: end.isCallsExhausted ?? false,
      isCeilingHit: end.isCeilingHit ?? false,
      inputTokens: this.inputTokens,
      outputTokens: this.outputTokens,
      calls: this.made,
    };
  }
}
