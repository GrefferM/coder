import { CYRILLIC_LETTER, LATIN_LETTER, SENTENCE } from "./constants";
import type { LanguageSpan } from "../interfaces";

/**
 * The spoken text cut into runs of one language, sentence by sentence: a sentence with at least as many Ukrainian
 * letters as Latin is Ukrainian, so an English phrase inside a Ukrainian sentence stays in it and the voice does not
 * change for one word. Runs of the same language are joined.
 */
export function languageSpans(spoken: string): LanguageSpan[] {
  const spans: LanguageSpan[] = [];

  for (const sentence of spoken.matchAll(SENTENCE)) {
    const start = sentence.index;
    const end = start + sentence[0].length;
    const ukrainian = count(sentence[0], CYRILLIC_LETTER);
    const isUkrainian = ukrainian > 0 && ukrainian >= count(sentence[0], LATIN_LETTER);
    const last = spans.at(-1);

    if (last !== undefined && last.isUkrainian === isUkrainian) {
      last.end = end;

      continue;
    }

    spans.push({
      start,
      end,
      isUkrainian,
    });
  }

  return spans;
}

function count(text: string, letter: RegExp): number {
  return text.match(letter)?.length ?? 0;
}
