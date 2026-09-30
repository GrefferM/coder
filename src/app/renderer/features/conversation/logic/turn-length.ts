import type { TurnLength } from "../interfaces";

/** A turn's length in characters: the system prompt and the question. */
export function turnLength(systemPrompt: string | null, asked: string, ceiling: number): TurnLength {
  const prompt = counted(systemPrompt ?? "");
  const question = counted(asked);

  return {
    prompt,
    asked: question,
    total: prompt + question,
    ceiling,
  };
}

/** Code points, not code units. */
function counted(text: string): number {
  return [...text].length;
}
