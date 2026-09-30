import type { ChatActs } from "./chat-acts.interface";
import type { ChatAimed } from "./chat-aimed.interface";
import type { ChatBand } from "./chat-band.interface";
import type { ChatField } from "./chat-field.interface";
import type { ChatSaid } from "./chat-said.interface";

/** The chat in five parts, each named after what owns it. */
export interface AgentChatProps {
  aimed: ChatAimed;
  said: ChatSaid;
  field: ChatField;
  band: ChatBand;
  acts: ChatActs;
}
