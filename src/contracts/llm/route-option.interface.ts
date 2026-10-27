/** One agent an answer may be handed to: the word the model names it by, and who that is. */
export interface RouteOption {
  agentId: string;
  /** Unique among the options of one agent, so the model's word names one of them. */
  label: string;
}
