import {
  SHARED_MEMORY_BLOCK_SEPARATOR,
  SHARED_MEMORY_COMPOSED,
  SHARED_MEMORY_HEADING_SEPARATOR,
  SHARED_MEMORY_OPENING,
  SHARED_MEMORY_TASK,
} from "./shared-memory.constant";

/** One block of the shared memory: its heading, then its words. */
export function sharedMemoryBlock(heading: string, words: string): string {
  return `${heading}${SHARED_MEMORY_HEADING_SEPARATOR}${words}`;
}

/** The shared memory of a question that has only the composer's message in it, nothing after. */
export function composedSharedMemory(text: string): string {
  return [SHARED_MEMORY_OPENING, sharedMemoryBlock(SHARED_MEMORY_COMPOSED, text), SHARED_MEMORY_TASK].join(
    SHARED_MEMORY_BLOCK_SEPARATOR,
  );
}
