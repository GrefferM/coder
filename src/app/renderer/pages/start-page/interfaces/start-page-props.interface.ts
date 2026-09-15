import type { OpenProject } from "../../../interfaces";

/** What `StartPage` hands back once a project is open: the folder and the config read from it. */
export interface StartPageProps {
  onProjectOpened: (project: OpenProject) => void;
}
