import type { ChatActs } from "./chat-acts.interface";
import type { ChatAimed } from "./chat-aimed.interface";
import type { ChatBand } from "./chat-band.interface";
import type { ChatField } from "./chat-field.interface";
import type { ChatSaid } from "./chat-said.interface";

/**
 * The chat in five parts, each named after what owns it, so a caller says which one it is handing over
 * instead of laying twenty-seven flat fields side by side and hoping the reader groups them the same way.
 */
export interface AgentChatProps {
  aimed: ChatAimed;
  said: ChatSaid;
  field: ChatField;
  band: ChatBand;
  acts: ChatActs;
}
