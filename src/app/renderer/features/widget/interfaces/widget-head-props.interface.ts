import type { ProjectEntry } from "../../../interfaces";
import type { WidgetAct } from "./project-list-props.interface";

export interface WidgetHeadProps {
  name: string;
  directory: string;
  recent: ProjectEntry[];
  /** «НОВА РОЗМОВА» stands while nothing is out and the sphere has a conversation. */
  canBeginAgain: boolean;
  onBeginAgain: () => void;
  onOpenList: () => void;
  onOpen: (directory: string) => void;
  onOpenFolder: () => void;
  quietActs: WidgetAct[];
}
