import type { SaidTurn } from "../../../contracts";
import type { ModelAsk, ModelCompose, TurnLlm } from "../interfaces";

/** A model layer that answers from a script, by the agent asked, and remembers what it was asked. */
export class ScriptedLlm implements TurnLlm {
  readonly asked: ModelAsk[] = [];
  readonly composed: ModelCompose[] = [];
  readonly stopped: string[] = [];

  /** Each agent answers with a reply, or with a refusal where the script holds an error. */
  constructor(
    private readonly script: Record<string, string | Error>,
    /** What the composer writes, or the refusal it comes back with. */
    private readonly composer: string | Error = "Зміст пам'яті",
  ) {}

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

  async compose(payload: ModelCompose): Promise<SaidTurn> {
    this.composed.push(payload);

    if (this.composer instanceof Error) {
      throw this.composer;
    }

    return {
      text: this.composer,
      isStopped: false,
      isCallsExhausted: false,
      isCeilingHit: false,
      inputTokens: 20,
      outputTokens: 4,
      calls: [],
    };
  }

  stop(payload: { turnId: string }): void {
    this.stopped.push(payload.turnId);
  }
}
