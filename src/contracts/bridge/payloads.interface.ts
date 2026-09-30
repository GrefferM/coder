import type { ProjectConfig, TakenThings } from "../project";
import type { AgentTool, ChatTurn, ReachableAgent } from "../llm";
import type { ProjectMcpServer } from "../project";
import type { WrittenStep } from "../runs";

/** Every channel that names a folder names it the same way: the project's own directory. */
export interface OfProject {
  directory: string;
}

/** Every channel that names one row names it by its id, and by nothing else. */
export interface OfOne {
  id: string;
}

export interface CreateProject extends OfProject {
  name: string;
}

export interface SaveProject extends OfProject {
  config: ProjectConfig;
}

/** The view is kept as the text this machine wrote, so an unreadable note is simply not a view. */
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
 * One server to reach. Its reach travels from the screen, as a command's line does: the project file is the
 * screen's, and the main process starts what it is handed rather than reading the folder again.
 */
export interface LookMcpServer extends OfProject {
  server: ProjectMcpServer;
}

/** Both writing a key and writing an address take the same two things; only the channel differs. */
export interface SaveProviderValue {
  providerId: string;
  value: string;
}

/** One turn asked of the machine. The provider's key is looked up on the far side and never sent. */
export interface AskAgent {
  turnId: string;
  /** Whose turn this is; an agent-tool calling it back would close a ring. */
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
  /** The reach of every server whose function stands among the tools. */
  servers: ProjectMcpServer[];
  /** Every agent reachable as a tool from this one, by id. */
  agents: ReachableAgent[];
}

export interface StopAgent {
  turnId: string;
}

export interface OpenRun extends OfProject {
  questionId: string;
  startedByAgentId: string;
  /** What the agent was called and coloured then, so the row is named before its first step lands. */
  startedByAgentName: string;
  startedByAgentColor: string;
  asked: string;
  startedAt: number;
}

/** Another question in a flow already recorded. */
export interface AskAgain {
  runId: string;
  questionId: string;
  asked: string;
  /** Whom the question is put to, and what they are called now — both lie down with the question. */
  askedAgentId: string;
  askedAgentName: string;
  askedAt: number;
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

/** Which server this machine is being asked about, or written for. */
export interface OfServer {
  serverId: string;
}

/** The token typed into the one field; an empty value takes it off this machine. */
export interface SaveMcpToken extends OfServer {
  value: string;
}

/** One variable's value, named so the machine knows which of the server's values this is. */
export interface SaveMcpEnvValue extends SaveMcpToken {
  name: string;
}
