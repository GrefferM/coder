import { NO_MEMORY, codePoints, memoryLength } from "../../../contracts";
import type { ChatCost, ComposedOutcome, MemoryFacts, TurnMemory } from "../../../contracts";
import type { ToolThread } from "../interfaces";

/** A tool agent's own memory within the caller's turn, as a turn is given it; none before its first call. */
export function toolThreadMemory(kept: ToolThread | null): TurnMemory {
  return kept === null
    ? NO_MEMORY
    : {
        ...NO_MEMORY,
        thread: kept.thread,
        composed: kept.composed,
      };
}

/** The thread an agent that keeps its own has after one more call: what it was asked, then what it said. */
export function threadAfterCall(kept: ToolThread, request: string, said: string): ToolThread {
  return {
    composed: kept.composed,
    thread: [
      ...kept.thread,
      {
        from: "person",
        text: request,
      },
      {
        from: "agent",
        text: said,
      },
    ],
  };
}

/**
 * A compression of the question's shared memory made under a call, as the record keeps it: whose memory, the question,
 * the place it covers, the lengths, the threshold and target it was made under, and what the composer's call cost.
 */
export function toolMemoryFacts(payload: {
  agentId: string;
  questionId: string;
  read: TurnMemory;
  composed: ComposedOutcome;
  compression: { at: number; to: number };
  cost: ChatCost | null;
}): MemoryFacts {
  const { read, composed, compression, cost } = payload;

  return {
    agentId: payload.agentId,
    questionId: payload.questionId,
    coversPlace: read.covers,
    text: composed.text,
    lengthBefore: memoryLength(read),
    lengthAfter: codePoints(composed.text),
    compressAt: compression.at,
    compressTo: compression.to,
    inputTokens: cost?.inputTokens ?? 0,
    outputTokens: cost?.outputTokens ?? 0,
    money: cost?.money ?? null,
  };
}
