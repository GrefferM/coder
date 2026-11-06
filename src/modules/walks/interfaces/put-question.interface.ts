import type { Agent, PackedAttachment, RecordedSound } from "../../../contracts";

export interface PutQuestion {
  agent: Agent;
  text: string;
  attached: PackedAttachment[];
  recordings: RecordedSound[];
}
