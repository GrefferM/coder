/** Cost of one answer: tokens each way and the money at the answering model's prices, fixed on arrival. */
export interface ChatCost {
  inputTokens: number;
  outputTokens: number;
  /** Nothing where the model carried no price, since the tokens are counted all the same. */
  money: number | null;
}
