import type { RecordedSound } from "../speech";
import type { ProjectConfig, TakenThings } from "../project";
import type { ProjectMcpServer } from "../project";
import type { PackedAttachment } from "../attachments";
import type { ChatMessage } from "../walks";

/** Every channel naming a folder names it by the project's directory. */
export interface OfProject {
  directory: string;
}

/** Every channel naming one row names it by id only. */
export interface OfOne {
  id: string;
}

export interface CreateProject extends OfProject {
  name: string;
}

export interface SaveProject extends OfProject {
  config: ProjectConfig;
  /** The print of the reading the config was made from. */
  basis: string;
}

/** The view is stored as text, so an unreadable one is not a view. */
export interface RememberProjectView extends OfProject {
  view: string;
}

export interface RememberDeletion extends OfProject {
  kind: string;
  name: string;
  taken: TakenThings;
}

export interface AskProvider {
  providerId: string;
}

/**
 * One server to reach. Its reach comes from the screen, which owns the project file; the main process does not re-read
 * the folder.
 */
export interface LookMcpServer extends OfProject {
  server: ProjectMcpServer;
}

/** One server whose run line is asked about or agreed to; the line is read off the server, not the folder. */
export interface OfMcpServer {
  server: ProjectMcpServer;
}

/** Shared by writing a key and writing an address; only the channel differs. */
export interface SaveProviderValue {
  providerId: string;
  value: string;
}

/** Whether a provider stands off on this machine. */
export interface SwitchProvider {
  providerId: string;
  isOff: boolean;
}

/** One word looked for through a project's whole record. */
export interface SearchRuns extends OfProject {
  query: string;
}

/** The folder of the project whose file changed under the app. */
export interface ProjectChanged {
  directory: string;
}

export interface OfServer {
  serverId: string;
}

/** The token typed into the field; an empty value removes it from this machine. */
export interface SaveMcpToken extends OfServer {
  value: string;
}

/** One variable's value, by the variable's name. */
export interface SaveMcpEnvValue extends SaveMcpToken {
  name: string;
}

/** The conversation of the open project begins, with its config as the screen holds it. */
export interface OpenWalks extends OfProject {
  config: ProjectConfig;
}

export interface ConfigureWalks {
  config: ProjectConfig;
}

/** The project open on screen, whose schedules the clock follows. */
export interface FollowSchedules extends OfProject {
  config: ProjectConfig;
}

/** The person's question, put to one agent with the files packed for it. */
export interface PutWalk {
  agentId: string;
  text: string;
  attached: PackedAttachment[];
  /** The recordings the question was said with; kept beside it in the record. */
  recordings: RecordedSound[];
}

/** The card a repeat was pressed under. */
export interface SayWalkAgain {
  said: ChatMessage;
}

/** The run the conversation goes on in; none for a conversation with no row yet. */
export interface GoOnInWalks {
  runId: string | null;
}

export interface LetGoWalks {
  runId: string;
}
