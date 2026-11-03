import type { ToolMessage } from "@langchain/core/messages";
import type { ChatCost, RouteChoice, ToolMemory, TurnCall } from "../../../contracts";

/** What one call hands back to its turn. */
export interface CallOutcome {
  message: ToolMessage;
  /** The row of the call; none for a call that never happened. */
  made: TurnCall | null;
  memories: ToolMemory[];
  cost: ChatCost | null;
  /** Where the call sent the answer; none unless it was a route call that went through. */
  route: RouteChoice | null;
}
