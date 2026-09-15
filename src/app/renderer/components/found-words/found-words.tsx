import { FOUND_WORDS_BACKGROUND_COLOR, FOUND_WORDS_BORDER_RADIUS_PX, FOUND_WORDS_PADDING } from "./constants";
import type { FoundWordsProps } from "./interfaces";

/**
 * The words with the searched one lit inside them — the same lighting over the record's rows and
 * inside the stream's cards, because it is one search and one mark. The accent lies behind the word and not in its
 * colour: colour already says whose the words are and how the run stands, and a third meaning on the same paint
 * would be one too many. What is lit is exactly what was typed, inside a word too, so «сесії» lights on «сесі».
 */
export function FoundWords({ words, looked }: FoundWordsProps) {
  const at = looked === "" ? -1 : words.toLocaleLowerCase().indexOf(looked.toLocaleLowerCase());

  if (at < 0) {
    return <>{words}</>;
  }

  return (
    <>
      {words.slice(0, at)}
      <span
        style={{
          background: FOUND_WORDS_BACKGROUND_COLOR,
          borderRadius: FOUND_WORDS_BORDER_RADIUS_PX,
          padding: FOUND_WORDS_PADDING,
        }}
      >
        {words.slice(at, at + looked.length)}
      </span>
      <FoundWords words={words.slice(at + looked.length)} looked={looked} />
    </>
  );
}
