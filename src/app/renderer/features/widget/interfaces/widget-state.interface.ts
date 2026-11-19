import type { PackedAttachment, RunRow, WalkSnapshot, WholeRun } from "../../../../../contracts";
import type { ProjectConfig } from "../../../interfaces";

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
  /** A run opened from the history, which the conversation goes on in; `null` while none is. */
  opened: WholeRun | null;
  /** The project's runs, newest first, as last listed. */
  runs: RunRow[];
  /** Lists the project's runs again. */
  listRuns: () => void;
  /** Opens a run from the history: the output shows it, and the next question goes on in it. */
  openRun: (runId: string) => Promise<void>;
  /** Deletes these runs from the record with their conversations; the opened one gone, the conversation opens fresh. */
  forgetRuns: (runIds: string[]) => Promise<void>;
  open: (directory: string) => Promise<void>;
  close: () => Promise<void>;
  choose: (agentId: string) => Promise<void>;
  /** Puts the words and files to a sphere, by its agent's id; false where they did not go. */
  ask: (agentId: string, text: string, attached: PackedAttachment[]) => Promise<boolean>;
  stop: () => void;
  fresh: () => void;
}
