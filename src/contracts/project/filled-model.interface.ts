import type { ProjectModel } from "./project-model.interface";

/** A model with every number written, the only kind an agent can be asked on. */
export interface FilledModel extends ProjectModel {
  inputPrice: number;
  outputPrice: number;
  contextCeiling: number;
  answerCeiling: number;
}
