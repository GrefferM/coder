import { COMPRESSED_MEMORY_ARROW, COMPRESSED_MEMORY_LABEL, COMPRESSED_MEMORY_SEPARATOR } from "../constants";
import type { CompressionSettings } from "../../../../../contracts";

/** The rule above a turn whose memory was compressed first: «ПАМ'ЯТЬ СТИСНУТО · 90 % → 10 %», the agent's own settings then. */
export function compressedMemoryWords(settings: CompressionSettings): string {
  return `${COMPRESSED_MEMORY_LABEL}${COMPRESSED_MEMORY_SEPARATOR}${settings.at} %${COMPRESSED_MEMORY_ARROW}${settings.to} %`;
}
