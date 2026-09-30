import type { Dispatch, SetStateAction } from "react";
import type { OpenProject } from "../../../interfaces";

/** The opened project and the setter every change is written back through. */
export interface MainPageProps {
  project: OpenProject;
  setProject: Dispatch<SetStateAction<OpenProject | null>>;
}
