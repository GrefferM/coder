import { IPC_WRAPPER_PATTERN, THROWN_PREFIX } from "./constants";

/**
 * What was actually said, without the transport's wrapper («Error invoking remote method 'llm:ask': Error: …») that a
 * fault from the main process arrives in.
 */
export function providerWords(failure: string): string {
  return failure.replace(IPC_WRAPPER_PATTERN, "").replace(THROWN_PREFIX, "").trim();
}
