import type {
  ASK_PROVIDER_CHANNEL,
  CHOOSE_DIRECTORY_CHANNEL,
  CLOSE_MCP_SERVER_CHANNEL,
  CREATE_PROJECT_CHANNEL,
  FORGET_DELETION_CHANNEL,
  FORGET_PROJECT_CHANNEL,
  FORGET_RUNS_CHANNEL,
  RECORDING_SOUND_CHANNEL,
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
  MCP_CONSENTED_CHANNEL,
  MCP_CONSENT_CHANNEL,
  LOOK_PROJECT_CHANNEL,
  OPEN_OR_CREATE_PROJECT_CHANNEL,
  OPEN_PROJECT_CHANNEL,
  PACK_ATTACHMENTS_CHANNEL,
  PICK_ATTACHMENT_CHANNEL,
  PROJECT_VIEW_CHANNEL,
  CALL_PLACE_CHANNEL,
  READ_RUN_CHANNEL,
  SEARCH_RUNS_CHANNEL,
  REMEMBER_DELETION_CHANNEL,
  REMEMBER_PROJECT_VIEW_CHANNEL,
  REVEAL_PROJECT_CHANNEL,
  SAVE_TEXT_FILE_CHANNEL,
  OPEN_MICROPHONE_SETTINGS_CHANNEL,
  SPEECH_SETTINGS_CHANNEL,
  SAVE_SPEECH_CHANNEL,
  HEAR_SPEECH_CHANNEL,
  SAVE_PROJECT_CHANNEL,
  SAVE_MCP_ENV_VALUE_CHANNEL,
  SAVE_MCP_TOKEN_CHANNEL,
  SAVE_PROVIDER_ADDRESS_CHANNEL,
  SAVE_PROVIDER_KEY_CHANNEL,
  SWITCH_PROVIDER_CHANNEL,
  CONFIGURE_WALKS_CHANNEL,
  FRESH_WALKS_CHANNEL,
  GO_ON_IN_WALKS_CHANNEL,
  LET_GO_WALKS_CHANNEL,
  OPEN_WALKS_CHANNEL,
  PUT_WALK_CHANNEL,
  SAY_WALK_AGAIN_CHANNEL,
  STOP_WALKS_CHANNEL,
  WALKS_STATE_CHANNEL,
  FOLLOW_SCHEDULES_CHANNEL,
  SCHEDULE_STANDINGS_CHANNEL,
} from "../channels";
import type { Deletion, FolderContents, ProjectEntry, ProjectOnDisk } from "../project";
import type { ProviderReply, ProviderState } from "../providers";
import type { McpLook, McpSecretsHeld } from "../mcp";
import type { CallPlace, RunHit, RunRow, WholeRun } from "../runs";
import type { AttachmentPick, PackAttachmentsAsk, PackedAttachment, PickAttachmentsAsk } from "../attachments";
import type { SaveTextAsk } from "../shell";
import type { HeardSound, SpeechSettings } from "../speech";
import type { PutWalkAnswer, WalkSnapshot } from "../walks";
import type { ScheduleStanding } from "../schedules";
import type {
  AskProvider,
  SearchRuns,
  CreateProject,
  LookMcpServer,
  OfMcpServer,
  OfServer,
  SaveMcpEnvValue,
  SaveMcpToken,
  OfOne,
  OfProject,
  RememberDeletion,
  RememberProjectView,
  SaveProject,
  SaveProviderValue,
  SwitchProvider,
  ConfigureWalks,
  GoOnInWalks,
  LetGoWalks,
  OpenWalks,
  PutWalk,
  SayWalkAgain,
  FollowSchedules,
} from "./payloads.interface";

/** What is sent over each channel and what comes back. `void` where nothing is handed over or nothing is answered. */
export interface ChannelMap {
  [CREATE_PROJECT_CHANNEL]: { payload: CreateProject; answer: ProjectOnDisk };
  [OPEN_PROJECT_CHANNEL]: { payload: OfProject; answer: ProjectOnDisk };
  [OPEN_OR_CREATE_PROJECT_CHANNEL]: { payload: OfProject; answer: ProjectOnDisk };
  [LOOK_PROJECT_CHANNEL]: { payload: OfProject; answer: FolderContents };
  /** The print of what the save left in the folder. */
  [SAVE_PROJECT_CHANNEL]: { payload: SaveProject; answer: string };
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
  [SWITCH_PROVIDER_CHANNEL]: { payload: SwitchProvider; answer: void };

  [SPEECH_SETTINGS_CHANNEL]: { payload: void; answer: SpeechSettings };
  [SAVE_SPEECH_CHANNEL]: { payload: SpeechSettings; answer: void };
  /** The words heard in the recording; empty where none were. */
  [HEAR_SPEECH_CHANNEL]: { payload: HeardSound; answer: string };

  [LOOK_MCP_SERVER_CHANNEL]: { payload: LookMcpServer; answer: McpLook };
  [SEEN_MCP_SERVER_CHANNEL]: { payload: { id: string }; answer: void };
  [MCP_CONSENTED_CHANNEL]: { payload: OfMcpServer; answer: boolean };
  [MCP_CONSENT_CHANNEL]: { payload: OfMcpServer; answer: void };
  [DROP_MCP_SERVER_CHANNEL]: { payload: { id: string }; answer: void };
  [SWEEP_MCP_KEYS_CHANNEL]: { payload: { serverIds: string[] }; answer: void };
  /** Releases a server; it restarts on the next look. */
  [CLOSE_MCP_SERVER_CHANNEL]: { payload: OfOne; answer: void };
  /** Server secrets stay on this machine; these three never touch the project file. */
  [SAVE_MCP_TOKEN_CHANNEL]: { payload: SaveMcpToken; answer: void };
  [SAVE_MCP_ENV_VALUE_CHANNEL]: { payload: SaveMcpEnvValue; answer: void };
  [MCP_SECRETS_HELD_CHANNEL]: { payload: OfServer; answer: McpSecretsHeld };

  [LIST_RUNS_CHANNEL]: { payload: OfProject; answer: RunRow[] };
  [READ_RUN_CHANNEL]: { payload: OfOne; answer: WholeRun | null };
  /** Where one call stands, by id; null when the record no longer holds it. */
  [CALL_PLACE_CHANNEL]: { payload: { callId: string }; answer: CallPlace | null };
  /** Every place the word stands, newest first, at most `RUN_HITS_LIMIT`: the found words and where a press lands. */
  [SEARCH_RUNS_CHANNEL]: { payload: SearchRuns; answer: RunHit[] };
  [FORGET_RUN_CHANNEL]: { payload: OfOne; answer: boolean };
  [FORGET_RUNS_CHANNEL]: { payload: OfProject; answer: number };
  /** One kept recording's sound, by the recording's id; null when the record no longer holds it. */
  [RECORDING_SOUND_CHANNEL]: { payload: OfOne; answer: Uint8Array | null };

  /** The conversation of the open project; its walks are said back by push. */
  [OPEN_WALKS_CHANNEL]: { payload: OpenWalks; answer: WalkSnapshot };
  [CONFIGURE_WALKS_CHANNEL]: { payload: ConfigureWalks; answer: void };
  [WALKS_STATE_CHANNEL]: { payload: void; answer: WalkSnapshot | null };
  /** The walk and the question it began, or null when the conversation took none: no such agent, no words, or a walk is out. */
  [PUT_WALK_CHANNEL]: { payload: PutWalk; answer: PutWalkAnswer | null };
  [STOP_WALKS_CHANNEL]: { payload: void; answer: void };
  [SAY_WALK_AGAIN_CHANNEL]: { payload: SayWalkAgain; answer: void };
  [FRESH_WALKS_CHANNEL]: { payload: void; answer: void };
  [GO_ON_IN_WALKS_CHANNEL]: { payload: GoOnInWalks; answer: void };
  [LET_GO_WALKS_CHANNEL]: { payload: LetGoWalks; answer: void };

  /** The open project's schedules run while it is followed. */
  [FOLLOW_SCHEDULES_CHANNEL]: { payload: FollowSchedules; answer: void };
  [SCHEDULE_STANDINGS_CHANNEL]: { payload: void; answer: ScheduleStanding[] };

  /** Desktop calls: choose a folder, reveal a project's file, pick and pack files for a question. */
  [CHOOSE_DIRECTORY_CHANNEL]: { payload: void; answer: string | null };
  [REVEAL_PROJECT_CHANNEL]: { payload: string; answer: void };
  [PICK_ATTACHMENT_CHANNEL]: { payload: PickAttachmentsAsk; answer: AttachmentPick };
  [PACK_ATTACHMENTS_CHANNEL]: { payload: PackAttachmentsAsk; answer: PackedAttachment[] };
  /**
   * The person chooses where a text file goes and it is written there; returns the saved path, or null when dismissed.
   */
  [SAVE_TEXT_FILE_CHANNEL]: { payload: SaveTextAsk; answer: string | null };
  [OPEN_MICROPHONE_SETTINGS_CHANNEL]: { payload: void; answer: void };
}

/** Every channel; a name outside this is not one. */
export type Channel = keyof ChannelMap;

export type Payload<C extends Channel> = ChannelMap[C]["payload"];
export type Answer<C extends Channel> = ChannelMap[C]["answer"];
