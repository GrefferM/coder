import type { ProjectModel, TurnAnswer } from "../../../contracts";

/** A turn back from the model layer, with what it carried and whether the model was asked at all. */
export interface ArrivedTurn {
  answered: TurnAnswer;
  /** Characters of memory the turn carried. */
  carried: number;
  isAsked: boolean;
  model: ProjectModel | null;
}
