import type {
  ADD_RUN_STEP_CHANNEL,
  ASK_AGAIN_CHANNEL,
  ASK_AGENT_CHANNEL,
  ASK_PROVIDER_CHANNEL,
  CHOOSE_DIRECTORY_CHANNEL,
  CLOSE_MCP_SERVER_CHANNEL,
  CLOSE_RUN_CHANNEL,
  CREATE_PROJECT_CHANNEL,
  FORGET_DELETION_CHANNEL,
  FORGET_PROJECT_CHANNEL,
  FORGET_RUNS_CHANNEL,
  FORGET_RUN_CHANNEL,
  LIST_DELETIONS_CHANNEL,
  CLOSE_PROJECT_CHANNEL,
  LIST_PROVIDERS_CHANNEL,
  LIST_RECENT_PROJECTS_CHANNEL,
  LIST_RUNS_CHANNEL,
  LOOK_MCP_SERVER_CHANNEL,
  DROP_MCP_SERVER_CHANNEL,
  SEEN_MCP_SERVER_CHANNEL,
  SWEEP_MCP_KEYS_CHANNEL,
  MCP_SECRETS_HELD_CHANNEL,
  LOOK_PROJECT_CHANNEL,
  OPEN_OR_CREATE_PROJECT_CHANNEL,
  OPEN_PROJECT_CHANNEL,
  PACK_ATTACHMENTS_CHANNEL,
  PICK_ATTACHMENT_CHANNEL,
  OPEN_RUN_CHANNEL,
  PROJECT_VIEW_CHANNEL,
  CALL_PLACE_CHANNEL,
  READ_RUN_CHANNEL,
  SEARCH_RUNS_CHANNEL,
  REMEMBER_DELETION_CHANNEL,
  REMEMBER_PROJECT_VIEW_CHANNEL,
  REVEAL_PROJECT_CHANNEL,
  SAVE_TEXT_FILE_CHANNEL,
  SAVE_PROJECT_CHANNEL,
  SAVE_MCP_ENV_VALUE_CHANNEL,
  SAVE_MCP_TOKEN_CHANNEL,
  SAVE_PROVIDER_ADDRESS_CHANNEL,
  SAVE_PROVIDER_KEY_CHANNEL,
  STOP_AGENT_CHANNEL,
} from "../channels";
import type { Deletion, FolderContents, ProjectConfig, ProjectEntry } from "../project";
import type { ProviderReply, ProviderState } from "../providers";
import type { McpLook, McpSecretsHeld } from "../mcp";
import type { SaidTurn } from "../llm";
import type { CallPlace, OpenedRecord, RunHit, RunRow, WholeRun } from "../runs";
import type { AttachmentPick, PackAttachmentsAsk, PackedAttachment, PickAttachmentsAsk } from "../attachments";
import type { SaveTextAsk } from "../shell";
import type {
  AddRunStep,
  AskAgain,
  AskAgent,
  AskProvider,
  CloseRun,
  SearchRuns,
  CreateProject,
  LookMcpServer,
  OfServer,
  SaveMcpEnvValue,
  SaveMcpToken,
  OfOne,
  OfProject,
  OpenRun,
  RememberDeletion,
  RememberProjectView,
  SaveProject,
  SaveProviderValue,
  StopAgent,
} from "./payloads.interface";

/** What is sent over each channel and what comes back. `void` where nothing is handed over or nothing is answered. */
export interface ChannelMap {
  [CREATE_PROJECT_CHANNEL]: { payload: CreateProject; answer: ProjectConfig };
  [OPEN_PROJECT_CHANNEL]: { payload: OfProject; answer: ProjectConfig };
  [OPEN_OR_CREATE_PROJECT_CHANNEL]: { payload: OfProject; answer: ProjectConfig };
  [LOOK_PROJECT_CHANNEL]: { payload: OfProject; answer: FolderContents };
  [SAVE_PROJECT_CHANNEL]: { payload: SaveProject; answer: void };
  [FORGET_PROJECT_CHANNEL]: { payload: OfProject; answer: void };
  /** No payload: the main process watches one project at a time. */
  [CLOSE_PROJECT_CHANNEL]: { payload: void; answer: void };
  [LIST_RECENT_PROJECTS_CHANNEL]: { payload: void; answer: ProjectEntry[] };
  /** The view is stored as text, so the answer is text or null. */
  [PROJECT_VIEW_CHANNEL]: { payload: OfProject; answer: string | null };
  [REMEMBER_PROJECT_VIEW_CHANNEL]: { payload: RememberProjectView; answer: void };

  [REMEMBER_DELETION_CHANNEL]: { payload: RememberDeletion; answer: string };
  [LIST_DELETIONS_CHANNEL]: { payload: OfProject; answer: Deletion[] };
  [FORGET_DELETION_CHANNEL]: { payload: OfOne; answer: void };

  [LIST_PROVIDERS_CHANNEL]: { payload: void; answer: ProviderState[] };
  [ASK_PROVIDER_CHANNEL]: { payload: AskProvider; answer: ProviderReply };
  [SAVE_PROVIDER_KEY_CHANNEL]: { payload: SaveProviderValue; answer: void };
  [SAVE_PROVIDER_ADDRESS_CHANNEL]: { payload: SaveProviderValue; answer: void };

  [LOOK_MCP_SERVER_CHANNEL]: { payload: LookMcpServer; answer: McpLook };
  [SEEN_MCP_SERVER_CHANNEL]: { payload: { id: string }; answer: void };
  [DROP_MCP_SERVER_CHANNEL]: { payload: { id: string }; answer: void };
  [SWEEP_MCP_KEYS_CHANNEL]: { payload: { serverIds: string[] }; answer: void };
  /** Releases a server; it restarts on the next look. */
  [CLOSE_MCP_SERVER_CHANNEL]: { payload: OfOne; answer: void };
  /** Server secrets stay on this machine; these three never touch the project file. */
  [SAVE_MCP_TOKEN_CHANNEL]: { payload: SaveMcpToken; answer: void };
  [SAVE_MCP_ENV_VALUE_CHANNEL]: { payload: SaveMcpEnvValue; answer: void };
  [MCP_SECRETS_HELD_CHANNEL]: { payload: OfServer; answer: McpSecretsHeld };

  [ASK_AGENT_CHANNEL]: { payload: AskAgent; answer: SaidTurn };
  [STOP_AGENT_CHANNEL]: { payload: StopAgent; answer: void };

  [OPEN_RUN_CHANNEL]: { payload: OpenRun; answer: OpenedRecord };
  /** The id of the question the walk continues under, or null when the record is gone. */
  [ASK_AGAIN_CHANNEL]: { payload: AskAgain; answer: string | null };
  [ADD_RUN_STEP_CHANNEL]: { payload: AddRunStep; answer: string };
  [CLOSE_RUN_CHANNEL]: { payload: CloseRun; answer: void };
  [LIST_RUNS_CHANNEL]: { payload: OfProject; answer: RunRow[] };
  [READ_RUN_CHANNEL]: { payload: OfOne; answer: WholeRun | null };
  /** Where one call stands, by id; null when the record no longer holds it. */
  [CALL_PLACE_CHANNEL]: { payload: { callId: string }; answer: CallPlace | null };
  /** One hit per run containing the word: the found words and where a press lands. */
  [SEARCH_RUNS_CHANNEL]: { payload: SearchRuns; answer: RunHit[] };
  [FORGET_RUN_CHANNEL]: { payload: OfOne; answer: boolean };
  [FORGET_RUNS_CHANNEL]: { payload: OfProject; answer: number };

  /** Desktop calls: choose a folder, reveal a project's file, pick and pack files for a question. */
  [CHOOSE_DIRECTORY_CHANNEL]: { payload: void; answer: string | null };
  [REVEAL_PROJECT_CHANNEL]: { payload: string; answer: void };
  [PICK_ATTACHMENT_CHANNEL]: { payload: PickAttachmentsAsk; answer: AttachmentPick };
  [PACK_ATTACHMENTS_CHANNEL]: { payload: PackAttachmentsAsk; answer: PackedAttachment[] };
  /**
   * The person chooses where a text file goes and it is written there; returns the saved path, or null when dismissed.
   */
  [SAVE_TEXT_FILE_CHANNEL]: { payload: SaveTextAsk; answer: string | null };
}

/** Every channel; a name outside this is not one. */
export type Channel = keyof ChannelMap;

export type Payload<C extends Channel> = ChannelMap[C]["payload"];
export type Answer<C extends Channel> = ChannelMap[C]["answer"];
