import {
  BROKEN_COLOR,
  INTERACTION_ACCENT_COLOR,
  QUIET_MARK_COLOR,
  SECOND_LEVEL_TEXT_COLOR,
} from "../../../../../../../constants";
import { PICKER_BORDER_COLOR } from "../../../../../../../components/picker-shell/constants";
import type { IconTone } from "../../../../../../../components";

/** The hearing model's field (38c), and what stands under it when the catalogue has nothing to offer. */
export const LISTEN_MODEL_GAP_PX = 6;
export const LISTEN_MODEL_NONE_COLOR = SECOND_LEVEL_TEXT_COLOR;
export const LISTEN_MODEL_NONE_ACT_TONE: IconTone = {
  rest: INTERACTION_ACCENT_COLOR,
  lit: "#7cc4ff",
};

/** macOS's row above the catalogue's (38c), and what stands under its field (38d, 38e). */
export const MAC_ROW_DIVIDER_COLOR = PICKER_BORDER_COLOR;
export const MAC_QUIET_COLOR = QUIET_MARK_COLOR;
export const MAC_DENIED_COLOR = BROKEN_COLOR;
export const MAC_DENIED_FONT_SIZE_PX = 11;
export const MAC_DENIED_LINE_HEIGHT = 1.6;
