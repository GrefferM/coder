import type { SaidTurn } from "../../../contracts";
import type { ModelAsk, TurnLlm } from "../interfaces";

/** A model layer that answers from a script, by the agent asked, and remembers what it was asked. */
export class ScriptedLlm implements TurnLlm {
  readonly asked: ModelAsk[] = [];
  readonly stopped: string[] = [];

  /** Each agent answers with a reply, or with a refusal where the script holds an error. */
  constructor(private readonly script: Record<string, string | Error>) {}

  async ask(payload: ModelAsk): Promise<SaidTurn> {
    this.asked.push(payload);

    const reply = this.script[payload.agentId] ?? "";

    if (reply instanceof Error) {
      throw reply;
    }

    return {
      text: reply,
      isStopped: false,
      isCallsExhausted: false,
      isCeilingHit: false,
      inputTokens: 10,
      outputTokens: 5,
      calls: [],
    };
  }

  stop(payload: { turnId: string }): void {
    this.stopped.push(payload.turnId);
  }
}
