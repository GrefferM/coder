import type { Dispatch, SetStateAction } from "react";
import type { OpenProject } from "../../../interfaces";

/** What `App` hands `MainPage`: the project it opened, and the setter every change is written back through. */
export interface MainPageProps {
  project: OpenProject;
  setProject: Dispatch<SetStateAction<OpenProject | null>>;
}
