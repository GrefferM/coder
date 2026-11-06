import { CODE_BLOCK, CODE_PAUSE, PAUSE_ORIGIN, WORD_END } from "./constants";
import type { SpokenParts, SpokenWord } from "../interfaces";

/** The words of an answer as they are read aloud: every fenced block of code left out, a pause in its place. */
export function spokenText(text: string): string {
  return spokenParts(text).spoken;
}

/** The spoken words with the card's place of every character, so a word the voice reaches can be found in the card. */
export function spokenParts(text: string): SpokenParts {
  let spoken = "";
  const origins: number[] = [];
  let at = 0;

  for (const block of text.matchAll(CODE_BLOCK)) {
    const start = block.index;

    spoken += text.slice(at, start) + CODE_PAUSE;
    origins.push(...range(at, start), ...Array<number>(CODE_PAUSE.length).fill(PAUSE_ORIGIN));
    at = start + block[0].length;
  }

  spoken += text.slice(at);
  origins.push(...range(at, text.length));

  const lead = spoken.length - spoken.trimStart().length;
  const kept = spoken.trim();

  return {
    spoken: kept,
    origins: origins.slice(lead, lead + kept.length),
  };
}

/** The word the voice reached at this spoken index, as a range of the card's text; `null` inside a pause for code. */
export function spokenWord(parts: SpokenParts, charIndex: number): SpokenWord | null {
  const { spoken, origins } = parts;
  const rest = spoken.slice(charIndex).match(WORD_END);
  const last = charIndex + (rest === null ? 0 : rest[0].length) - 1;
  const start = origins[charIndex];
  const end = origins[last];

  if (start === undefined || end === undefined || start === PAUSE_ORIGIN || end < start) {
    return null;
  }

  return {
    start,
    end: end + 1,
    ratio: spoken.length === 0 ? 1 : charIndex / spoken.length,
  };
}

function range(from: number, to: number): number[] {
  return Array.from(
    {
      length: to - from,
    },
    (_, offset) => from + offset,
  );
}
