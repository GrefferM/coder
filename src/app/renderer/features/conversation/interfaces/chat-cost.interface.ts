/** Cost of one answer: tokens each way and money at the answering model's prices, fixed on arrival. */
export interface ChatCost {
  inputTokens: number;
  outputTokens: number;
  /** Null where the model carried no price; tokens are counted regardless. */
  money: number | null;
}
