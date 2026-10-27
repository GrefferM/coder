import { mixWithTransparent } from "../../../../../utils/colors";
import { Dot } from "../../../../../components";
import {
  WAIT_PILL_ANSWERED_LABEL,
  WAIT_PILL_BACKGROUND_COLOR,
  WAIT_PILL_BORDER_COLOR,
  WAIT_PILL_BORDER_RADIUS_PX,
  WAIT_PILL_COLOR,
  WAIT_PILL_DOT_GAP_PX,
  WAIT_PILL_DOT_PERCENTS,
  WAIT_PILL_DOT_SIZE_PX,
  WAIT_PILL_FONT_SIZE_PX,
  WAIT_PILL_GAP_PX,
  WAIT_PILL_LABEL,
  WAIT_PILL_LETTER_SPACING_PX,
  WAIT_PILL_NAME_SEPARATOR,
  WAIT_PILL_OF_WORD,
  WAIT_PILL_PADDING,
  WAIT_PILL_REPEAT_WORD,
  WAIT_PILL_SEPARATOR,
  WAIT_PILL_SILENT_LABEL,
} from "./constants";
import type { WaitPillProps } from "./interfaces";

/** «●●● ЧЕКАЄ LINTER · ВІДПОВІВ 1 З 3 · НЕ ПЕРЕДАВ 1» under the sphere's labels; catches no pointer. */
export function WaitPill({ awaitedNames, isAwaitingRepeat, answered, silent, ofSuppliers, color }: WaitPillProps) {
  // When the walk is broken no supplier is coming; the pill names the repeat.
  const awaited = isAwaitingRepeat ? WAIT_PILL_REPEAT_WORD : awaitedNames.join(WAIT_PILL_NAME_SEPARATOR);

  // Those who passed nothing on are counted only when there are some.
  const passedNothing = silent > 0 ? `${WAIT_PILL_SEPARATOR}${WAIT_PILL_SILENT_LABEL} ${silent}` : "";

  return (
    <div
      className="d-flex align-items-center font-monospace text-uppercase"
      style={{
        gap: WAIT_PILL_GAP_PX,
        padding: WAIT_PILL_PADDING,
        borderRadius: WAIT_PILL_BORDER_RADIUS_PX,
        border: `1px solid ${WAIT_PILL_BORDER_COLOR}`,
        background: WAIT_PILL_BACKGROUND_COLOR,
        color: WAIT_PILL_COLOR,
        fontSize: WAIT_PILL_FONT_SIZE_PX,
        letterSpacing: WAIT_PILL_LETTER_SPACING_PX,
        whiteSpace: "nowrap",
        pointerEvents: "none",
      }}
    >
      <span
        className="d-flex"
        style={{
          gap: WAIT_PILL_DOT_GAP_PX,
        }}
      >
        {WAIT_PILL_DOT_PERCENTS.map((percent) => (
          <Dot key={percent} color={mixWithTransparent(color, percent)} size={WAIT_PILL_DOT_SIZE_PX} />
        ))}
      </span>
      {`${WAIT_PILL_LABEL} ${awaited}${WAIT_PILL_SEPARATOR}${WAIT_PILL_ANSWERED_LABEL} ${answered} ${WAIT_PILL_OF_WORD} ${ofSuppliers}${passedNothing}`}
    </div>
  );
}
