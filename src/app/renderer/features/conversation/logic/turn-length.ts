import type { TurnLength } from "../interfaces";

/** How long a turn is, in characters — the system prompt and the question. */
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

/** Code points, not code units: one character the person sees counts as one. */
function counted(text: string): number {
  return [...text].length;
}
