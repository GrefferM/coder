import { IPC_WRAPPER_PATTERN, THROWN_PREFIX } from "../constants";

/**
 * What the provider actually said, out of what the bridge handed over. A fault crossing from the main process
 * arrives wrapped in the transport's own words — «Error invoking remote method 'llm:ask': Error: …» — and that
 * wrapper is about our own plumbing, not about the provider: the person reading a fallen turn needs the sentence
 * and nothing in front of it.
 */
export function providerWords(failure: string): string {
  return failure.replace(IPC_WRAPPER_PATTERN, "").replace(THROWN_PREFIX, "").trim();
}
