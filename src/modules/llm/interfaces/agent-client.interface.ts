import type { BaseChatModel } from "@langchain/core/language_models/chat_models";

/** How one provider is opened: `needs` says whether to ask for a key or an address, `open` turns it into a model. */
export interface AgentClient {
  needs: "key" | "address";
  open: (model: string, secret: string, temperature: number, answerTokens: number) => BaseChatModel;
}
