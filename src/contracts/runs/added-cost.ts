import { addedMoney } from "./added-money";
import type { ChatCost } from "../walks/chat-cost.interface";

/** Two bills as one: tokens added, money added where either is known; a missing bill adds nothing. */
export function addedCost(one: ChatCost | null, other: ChatCost | null): ChatCost | null {
  if (one === null || other === null) {
    return one ?? other;
  }

  return {
    inputTokens: one.inputTokens + other.inputTokens,
    outputTokens: one.outputTokens + other.outputTokens,
    money: addedMoney([one.money, other.money]),
  };
}
