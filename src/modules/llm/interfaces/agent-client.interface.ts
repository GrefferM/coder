import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import type { AgentOpening } from "./agent-opening.interface";
import type { ProviderNeed } from "../../../contracts/providers";

export interface AgentClient {
  needs: ProviderNeed[];
  open: (opening: AgentOpening) => BaseChatModel;
}
