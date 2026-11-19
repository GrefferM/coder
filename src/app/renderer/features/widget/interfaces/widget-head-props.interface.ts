import type { ProjectEntry } from "../../../interfaces";
import type { WidgetAct } from "./project-list-props.interface";

export interface WidgetHeadProps {
  name: string;
  directory: string;
  recent: ProjectEntry[];
  onOpenList: () => void;
  onOpen: (directory: string) => void;
  onOpenFolder: () => void;
  quietActs: WidgetAct[];
}
