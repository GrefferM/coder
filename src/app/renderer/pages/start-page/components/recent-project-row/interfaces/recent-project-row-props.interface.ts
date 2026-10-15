import type { ProjectEntry } from "../../../../../interfaces";

export interface RecentProjectRowProps {
  entry: ProjectEntry;
  onOpen: (directory: string) => void;
  onForget: (directory: string) => void;
}
