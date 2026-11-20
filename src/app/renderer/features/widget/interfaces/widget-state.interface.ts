import type { WalkSnapshot } from "../../../../../contracts";
import type { ProjectConfig } from "../../../interfaces";
import type { HeardClip } from "../../speech";
import type { WidgetQuestion } from "./widget-question.interface";

/**
 * The widget as it stands: the project and sphere it shares with the main window, the one conversation both show,
 * and what it can be asked to do.
 */
export interface WidgetState {
  /** `undefined` until the machine's settings are read. */
  directory: string | null | undefined;
  /** The widget's project as read; `null` while none is open or it is being read. */
  config: ProjectConfig | null;
  /** Why the widget's project could not be read; `null` where nothing went wrong. */
  trouble: string | null;
  /** Whether the ends of the walks are left unread. */
  isSilent: boolean;
  /** Turns the reading of the ends off or back on, on this machine. */
  silence: (isSilent: boolean) => Promise<void>;
  /** The sphere walks begin at, by its agent's id; `null` while none is chosen. */
  chosenAgentId: string | null;
  /** The project's one conversation, the chat's; `null` until it is open. */
  walks: WalkSnapshot | null;
  open: (directory: string) => Promise<void>;
  close: () => Promise<void>;
  choose: (agentId: string) => Promise<void>;
  /** Puts the question to its sphere; false where it did not go. */
  ask: (question: WidgetQuestion) => Promise<boolean>;
  /** The recordings said in this widget, by the id of the question each went with. */
  heardBy: Record<string, HeardClip[]>;
  stop: () => void;
  fresh: () => void;
}
