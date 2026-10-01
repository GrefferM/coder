import type { WalkAct } from "./walk-act.interface";

/**
 * The world's hands the effects reach for, held by the adapter; each answers to an effect's kind and takes the act
 * itself, so no effect reaches the wrong hand.
 */
export interface WalkHands {
  askAgent: (act: WalkAct<"askAgent">) => void;
  askMachine: (act: WalkAct<"askMachine">) => void;
  stopMachine: (act: WalkAct<"stopMachine">) => void;
  letDown: (act: WalkAct<"letDown">) => void;
  sayHandoff: (act: WalkAct<"sayHandoff">) => void;
  sayAsked: (act: WalkAct<"sayAsked">) => void;
  sayAnswer: (act: WalkAct<"sayAnswer">) => void;
  writeTurn: (act: WalkAct<"writeTurn">) => void;
  turnBack: (act: WalkAct<"turnBack">) => void;
  openWalk: (act: WalkAct<"openWalk">) => void;
  takeWalk: (act: WalkAct<"takeWalk">) => void;
  askAgain: (act: WalkAct<"askAgain">) => void;
  dropWalk: (act: WalkAct<"dropWalk">) => void;
  closeAgain: (act: WalkAct<"closeAgain">) => void;
}
