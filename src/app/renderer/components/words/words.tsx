import { SECOND_LEVEL_TEXT_COLOR } from "../../constants";
import { WORDS_COLOR, WORDS_FONT_SIZE_PX, WORDS_LINE_HEIGHT } from "./constants";
import type { WordsProps } from "./interfaces";

/** A sentence of the app's own: the note under a question, or what an empty section says. */
export function Words({ children, isQuiet = false, className }: WordsProps) {
  return (
    <span
      className={className}
      style={{
        color: isQuiet ? SECOND_LEVEL_TEXT_COLOR : WORDS_COLOR,
        fontSize: WORDS_FONT_SIZE_PX,
        lineHeight: WORDS_LINE_HEIGHT,
        // Names somebody typed have no spaces to break at.
        overflowWrap: "anywhere",
      }}
    >
      {children}
    </span>
  );
}
