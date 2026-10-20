import type { CompressionSettings } from "./compression-settings.interface";
import type { MemoryFacts } from "../runs";

/** The settings a compression was made under, as the record holds them. */
export function compressionOf(facts: Pick<MemoryFacts, "compressAt" | "compressTo">): CompressionSettings {
  return {
    at: facts.compressAt,
    to: facts.compressTo,
  };
}
