import type { ProviderLister } from "./provider-lister.interface";
import type { RunRecord } from "./run-record.interface";
import type { ServerLooker } from "./server-looker.interface";
import type { TurnLlm } from "./turn-llm.interface";
import type { WalkListener } from "./walk-listener.interface";
import type { WalkProject } from "./walk-project.interface";

export interface WalkRunnerParts {
  project: WalkProject;
  record: RunRecord;
  llm: TurnLlm;
  providers: ProviderLister;
  servers: ServerLooker;
  listener: WalkListener;
}
