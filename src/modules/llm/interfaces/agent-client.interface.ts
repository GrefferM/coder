import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import type { AgentOpening } from "./agent-opening.interface";
import type { ProviderNeed } from "../../../contracts/providers";

/** How one provider is opened: `needs` says what to ask for, `open` turns what came back into a model. */
export interface AgentClient {
  needs: ProviderNeed[];
  open: (opening: AgentOpening) => BaseChatModel;
}
