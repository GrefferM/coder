import { codePoints } from "./code-points";
import type { TurnLength } from "../interfaces";

/** A turn's length in characters: the system prompt and the question. */
export function turnLength(systemPrompt: string | null, asked: string, ceiling: number): TurnLength {
  const prompt = codePoints(systemPrompt ?? "");
  const question = codePoints(asked);

  return {
    prompt,
    asked: question,
    total: prompt + question,
    ceiling,
  };
}
