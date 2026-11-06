import { SPOKEN_WORD_BACKGROUND_COLOR, SPOKEN_WORD_BORDER_RADIUS_PX, SPOKEN_WORD_SHADOW } from "./constants";
import type { SpokenWordsProps } from "./interfaces";

/** An answer's words with the one being read lit on the accent's ground. */
export function SpokenWords({ words, spoken }: SpokenWordsProps) {
  return (
    <>
      {words.slice(0, spoken.start)}
      <span
        style={{
          background: SPOKEN_WORD_BACKGROUND_COLOR,
          borderRadius: SPOKEN_WORD_BORDER_RADIUS_PX,
          boxShadow: SPOKEN_WORD_SHADOW,
        }}
      >
        {words.slice(spoken.start, spoken.end)}
      </span>
      {words.slice(spoken.end)}
    </>
  );
}
