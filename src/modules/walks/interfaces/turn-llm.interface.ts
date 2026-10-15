import type { SaidTurn } from "../../../contracts";
import type { ModelAsk } from "./model-ask.interface";

export interface TurnLlm {
  ask(payload: ModelAsk): Promise<SaidTurn>;
  stop(payload: { turnId: string }): void;
}
