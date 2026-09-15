import { RUN_DEBUG_WHEN_COLOR } from "../../constants";
import {
  PASS_SWITCH_BACK_ICON_PATH,
  PASS_SWITCH_BACK_LABEL,
  PASS_SWITCH_DIVIDER_COLOR,
  PASS_SWITCH_DIVIDER_HEIGHT_PX,
  PASS_SWITCH_FONT_SIZE_PX,
  PASS_SWITCH_GAP_PX,
  PASS_SWITCH_LETTER_SPACING_PX,
  PASS_SWITCH_OF,
  PASS_SWITCH_ON_ICON_PATH,
  PASS_SWITCH_ON_LABEL,
  PASS_SWITCH_WORD,
} from "./constants";
import type { PassSwitchProps } from "./interfaces";
import { Arrow } from "./components";

/**
 * «‹ ПИТАННЯ 2 З 2 ›» in the head of the projection. It walks the passes of this flow and no further:
 * another flow is another row of the history. A question that never went is no pass of it.
 */
export function PassSwitch({ place, count, onGo }: PassSwitchProps) {
  return (
    <>
      <span
        className="d-flex align-items-center font-monospace text-uppercase flex-shrink-0"
        style={{
          gap: PASS_SWITCH_GAP_PX,
          color: RUN_DEBUG_WHEN_COLOR,
          fontSize: PASS_SWITCH_FONT_SIZE_PX,
          letterSpacing: PASS_SWITCH_LETTER_SPACING_PX,
        }}
      >
        <Arrow
          label={PASS_SWITCH_BACK_LABEL}
          path={PASS_SWITCH_BACK_ICON_PATH}
          isDead={place <= 1}
          onGo={() => onGo(place - 1)}
        />
        {`${PASS_SWITCH_WORD} ${place}${PASS_SWITCH_OF}${count}`}
        <Arrow
          label={PASS_SWITCH_ON_LABEL}
          path={PASS_SWITCH_ON_ICON_PATH}
          isDead={place >= count}
          onGo={() => onGo(place + 1)}
        />
      </span>
      <span
        className="flex-shrink-0"
        style={{
          width: 1,
          height: PASS_SWITCH_DIVIDER_HEIGHT_PX,
          background: PASS_SWITCH_DIVIDER_COLOR,
        }}
      />
    </>
  );
}
