import type { SaidTurn } from "../../../contracts";
import type { ModelAsk } from "./model-ask.interface";

/** What a walk asks of the model layer: a turn put, and a turn still out ended. */
export interface TurnLlm {
  ask(payload: ModelAsk): Promise<SaidTurn>;
  stop(payload: { turnId: string }): void;
}
