import type { ProjectEntry } from "../../../interfaces";

export interface OpenProjectProps {
  recent: ProjectEntry[];
  /** Why the last project could not be opened; `null` where nothing went wrong. */
  trouble: string | null;
  isListOpen: boolean;
  onToggleList: () => void;
  onOpen: (directory: string) => void;
  onOpenFolder: () => void;
  onForget: (directory: string) => void;
}
