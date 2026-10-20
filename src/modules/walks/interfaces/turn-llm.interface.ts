import type { SaidTurn } from "../../../contracts";
import type { ModelAsk } from "./model-ask.interface";
import type { ModelCompose } from "./model-compose.interface";

export interface TurnLlm {
  ask(payload: ModelAsk): Promise<SaidTurn>;
  /** The composer's one call; its words are the memory's message, and none of them is said onward. */
  compose(payload: ModelCompose): Promise<SaidTurn>;
  stop(payload: { turnId: string }): void;
}
