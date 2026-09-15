import type { ProjectEntry } from "../../../../../interfaces";

/** The entry to show, and the open/forget handlers. */
export interface RecentProjectRowProps {
  entry: ProjectEntry;
  onOpen: (directory: string) => void;
  onForget: (directory: string) => void;
}
