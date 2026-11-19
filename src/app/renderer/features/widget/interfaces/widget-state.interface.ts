import type { PackedAttachment, WalkSnapshot } from "../../../../../contracts";
import type { ProjectConfig } from "../../../interfaces";

/** The widget as it stands: its project, its chosen sphere, every sphere's walks, and what it can be asked to do. */
export interface WidgetState {
  /** `undefined` until the machine's settings are read. */
  directory: string | null | undefined;
  /** The widget's project as read; `null` while none is open or it is being read. */
  config: ProjectConfig | null;
  /** Why the widget's project could not be read; `null` where nothing went wrong. */
  trouble: string | null;
  /** The sphere walks begin at, by its agent's id; `null` while none is chosen. */
  chosenAgentId: string | null;
  /** Each sphere's walks, by its agent's id. */
  walks: Record<string, WalkSnapshot>;
  open: (directory: string) => Promise<void>;
  close: () => Promise<void>;
  choose: (agentId: string) => Promise<void>;
  /** Puts the words and files to the chosen sphere; false where they did not go. */
  ask: (text: string, attached: PackedAttachment[]) => Promise<boolean>;
  stop: () => void;
  fresh: () => void;
}
