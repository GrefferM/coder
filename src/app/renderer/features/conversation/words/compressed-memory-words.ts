import { COMPRESSED_MEMORY_ARROW, COMPRESSED_MEMORY_LABEL, COMPRESSED_MEMORY_SEPARATOR } from "../constants";
import type { CompressionSettings } from "../../../../../contracts";

/** «ПАМ'ЯТЬ СТИСНУТО · 90 % → 10 %»: the rule above a compressed turn, with the agent's settings at the time. */
export function compressedMemoryWords(settings: CompressionSettings): string {
  return `${COMPRESSED_MEMORY_LABEL}${COMPRESSED_MEMORY_SEPARATOR}${settings.at} %${COMPRESSED_MEMORY_ARROW}${settings.to} %`;
}
