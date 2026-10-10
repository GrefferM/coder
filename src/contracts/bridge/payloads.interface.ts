import type { ProjectConfig, TakenThings } from "../project";
import type { AgentTool, ChatTurn, ReachableAgent } from "../llm";
import type { ProjectMcpServer } from "../project";
import type { WrittenStep } from "../runs";
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

/** Shared by writing a key and writing an address; only the channel differs. */
export interface SaveProviderValue {
  providerId: string;
  value: string;
}

/** One turn asked of the machine. The provider's key is looked up in the main process and never sent. */
export interface AskAgent {
  turnId: string;
  /** The agent whose turn it is; excluded from its own tools, which would close a cycle. */
  agentId: string;
  providerId: string;
  model: string;
  directory: string;
  maxCalls: number;
  temperature: number;
  answerCeiling: number;
  systemPrompt: string | null;
  messages: ChatTurn[];
  tools: AgentTool[];
  /** The reach of every server whose functions are among the tools. */
  servers: ProjectMcpServer[];
  /** Every agent reachable as a tool from this one, by id. */
  agents: ReachableAgent[];
  /** The row and the question the turn works under; an agent it calls with the shared memory reads that question. */
  runId: string | null;
  questionId: string;
}

export interface StopAgent {
  turnId: string;
}

export interface OpenRun extends OfProject {
  questionId: string;
  startedByAgentId: string;
  /** The agent's name and colour at start, so the row is named before its first step lands. */
  startedByAgentName: string;
  startedByAgentColor: string;
  asked: string;
  /** The files and folders sent with the question, packed as they went. */
  attached: PackedAttachment[];
  startedAt: number;
}

/** Another question in a flow already recorded. */
export interface AskAgain {
  runId: string;
  questionId: string;
  asked: string;
  /** The agent asked and its current name, stored with the question. */
  askedAgentId: string;
  askedAgentName: string;
  /** The files and folders sent with the question, packed as they went. */
  attached: PackedAttachment[];
  askedAt: number;
}

/** One question of a flow, by the run it stands in and its own id. */
export interface SharedMemoryAsk {
  runId: string;
  questionId: string;
}

export interface CloseRun {
  runId: string;
  endedAt: number;
}

/** One word looked for through a project's whole record. */
export interface SearchRuns extends OfProject {
  query: string;
}

export type AddRunStep = WrittenStep;

/** The folder of the project whose file changed under the app. */
export interface ProjectChanged {
  directory: string;
}

/** The server this machine is asked about or written for. */
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

/** The config as it stands now. */
export interface ConfigureWalks {
  config: ProjectConfig;
}

/** The person's question, put to one agent with the files packed for it. */
export interface PutWalk {
  agentId: string;
  text: string;
  attached: PackedAttachment[];
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
