import { codePoints } from "./code-points";
import type { TurnLength, TurnParts } from "../interfaces";

/** A turn's length in characters: the system prompt, the question and the memory ahead of it. */
export function turnLength(parts: TurnParts): TurnLength {
  const prompt = codePoints(parts.systemPrompt ?? "");
  const asked = codePoints(parts.asked);

  return {
    prompt,
    asked,
    memory: parts.memoryLength,
    total: prompt + asked + parts.memoryLength,
    ceiling: parts.ceiling,
  };
}
