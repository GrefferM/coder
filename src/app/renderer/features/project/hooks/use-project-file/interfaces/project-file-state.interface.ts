import type { OpenProject } from "../../../../../interfaces";

/** The file that arrived while a draft stood, and the two answers to the question it raises. */
export interface ProjectFileState {
  arrived: OpenProject | null;
  keepMine: () => void;
  takeArrived: () => void;
}
