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

/** The shared memory told in words: what it is, then its blocks in order. The turn's task is not part of it. */
export function sharedMemoryText(blocks: string[]): string {
  return [SHARED_MEMORY_OPENING, ...blocks].join(SHARED_MEMORY_BLOCK_SEPARATOR);
}

/** The shared memory of a question that has only the composer's message in it, nothing after. */
export function composedSharedMemory(text: string): string {
  return sharedMemoryText([sharedMemoryBlock(SHARED_MEMORY_COMPOSED, text)]);
}

/** The shared memory as a turn opens with it: closed on the task, after which the turn's own words follow. */
export function sharedMemoryWithTask(shared: string): string {
  return `${shared}${SHARED_MEMORY_BLOCK_SEPARATOR}${SHARED_MEMORY_TASK}`;
}
