import { FOUND_WORDS_BACKGROUND_COLOR, FOUND_WORDS_BORDER_RADIUS_PX, FOUND_WORDS_PADDING } from "./constants";
import type { FoundWordsProps } from "./interfaces";

/**
 * Words with the searched text lit inside them, even mid-word («сесі» lights «сесії»); the accent is the background,
 * since colour already carries agent and state.
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
