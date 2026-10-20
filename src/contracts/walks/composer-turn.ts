import { composedMemory } from "./composed-memory";
import { composerLength, composerMessage } from "./composer-words";
import { COMPOSER_SAID_NOTHING_NOTE } from "./composer-words.constant";
import { codePoints } from "./code-points";
import { cutComposed } from "./cut-composed";
import { memoryText } from "./memory-text";
import { newestText } from "./newest-text";
import { composedSharedMemory } from "./shared-memory";
import type { TurnMemory } from "./turn-memory.interface";
import type { ChatTurn } from "../llm";
import type { AgentMemory } from "../project";

/** What the composer wrote, held to its budget, and the memory a turn goes with in place of the one it read. */
export interface ComposedOutcome {
  text: string;
  memory: TurnMemory;
}

/**
 * What the composer may write, in characters: the compression's budget less what the memory is told in around it,
 * since the ceiling counts that too.
 */
export function composerBudget(memory: AgentMemory, budget: number): number {
  const told = memory === "shared" ? composedSharedMemory("") : composedMemory("");

  return Math.max(1, budget - codePoints(told));
}

/**
 * What the composer is asked, for a memory and the model's ceiling: one message, the memory fenced in and then the
 * instruction. A memory too long to be read with its instruction is read from its newest end.
 */
export function composerAsk(memory: TurnMemory, ceiling: number, budget: number): ChatTurn[] {
  return [
    {
      from: "person",
      text: composerMessage(newestText(memoryText(memory), ceiling - composerLength(ceiling)), budget),
    },
  ];
}

/**
 * What the composer wrote, held to its budget by cutting the end off, and the memory a turn then goes with, told the way
 * the agent's memory is told; nothing written is an error, since the memory it read cannot be dropped for it.
 */
export function composedOutcome(said: string, budget: number, kept: AgentMemory, covers: number): ComposedOutcome {
  const text = cutComposed(said, budget);

  if (text === "") {
    throw new Error(COMPOSER_SAID_NOTHING_NOTE);
  }

  const isShared = kept === "shared";

  return {
    text,
    memory: {
      thread: [],
      composed: isShared ? "" : composedMemory(text),
      shared: isShared ? composedSharedMemory(text) : "",
      covers,
    },
  };
}
