import type { ProviderLister } from "./provider-lister.interface";
import type { RunRecord } from "./run-record.interface";
import type { ServerLooker } from "./server-looker.interface";
import type { TurnLlm } from "./turn-llm.interface";
import type { WalkVoice } from "./walk-voice.interface";

/** What the hub stands on, shared by every conversation it opens. */
export interface WalkHubParts {
  record: RunRecord;
  llm: TurnLlm;
  providers: ProviderLister;
  servers: ServerLooker;
  voice: WalkVoice;
}
