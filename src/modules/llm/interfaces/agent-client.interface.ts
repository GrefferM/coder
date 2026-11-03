import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import type { AgentOpening } from "./agent-opening.interface";
import type { ProviderNeed } from "../../../contracts/providers";

export interface AgentClient {
  needs: ProviderNeed[];
  open: (opening: AgentOpening) => BaseChatModel;
  /** One sentence said after the provider's own words when it refuses a turn; null where its words say enough. */
  failureHint: string | null;
}
