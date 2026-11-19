import type { ProjectEntry } from "../../../interfaces";

export interface ProjectListProps {
  /** The head over the projects: «НЕЩОДАВНІ» before one is open, «ПРОЄКТИ» after. */
  label: string;
  recent: ProjectEntry[];
  /** The widget's project, ticked in the list; `null` while none is open. */
  directory: string | null;
  onOpen: (directory: string) => void;
  onOpenFolder: () => void;
  /** The quiet acts under a rule (52a); none where the list stands under «Відкрити проєкт». */
  quietActs: WidgetAct[];
}

/** One act of the list, by its words. */
export interface WidgetAct {
  label: string;
  onPress: () => void;
}
