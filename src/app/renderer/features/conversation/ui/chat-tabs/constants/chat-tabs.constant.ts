import {
  FALLEN_COLOR,
  FIRST_LEVEL_TEXT_COLOR,
  HAIRLINE_COLOR,
  INTERACTION_ACCENT_COLOR,
  SECOND_LEVEL_TEXT_COLOR,
} from "../../../../../constants";

/** The two faces of the chat section — what is going on, and what has been. */
export const CHAT_TABS_STREAM_LABEL = "Потік";
export const CHAT_TABS_HISTORY_LABEL = "Історія";
export const CHAT_TABS_PADDING = "0 16px";
export const CHAT_TABS_GAP_PX = 20;
export const CHAT_TABS_ITEM_PADDING = "9px 0";
export const CHAT_TABS_FONT_SIZE_PX = 10;
export const CHAT_TABS_LETTER_SPACING_PX = 2;
export const CHAT_TABS_COLOR = SECOND_LEVEL_TEXT_COLOR;
export const CHAT_TABS_ACTIVE_COLOR = FIRST_LEVEL_TEXT_COLOR;
export const CHAT_TABS_RULE_COLOR = HAIRLINE_COLOR;
export const CHAT_TABS_MARK = "inset 0 -2px 0 #38a3ff";

/** The stream's own act, at the far end of the tabs; the accent comes with the mouse. */
export const CHAT_TABS_FRESH_LABEL = "+ Новий чат";
export const CHAT_TABS_FRESH_COLOR = SECOND_LEVEL_TEXT_COLOR;
export const CHAT_TABS_FRESH_LIT_COLOR = INTERACTION_ACCENT_COLOR;
export const CHAT_TABS_FRESH_FONT_SIZE_PX = 9.5;
export const CHAT_TABS_FRESH_LETTER_SPACING_PX = 1.5;

/** The history's own act, in the tabs' one place for it. The number is in the name, «запусків» is not. */
export const CHAT_TABS_FORGET_PREFIX = "× Видалити ";
export const CHAT_TABS_FORGET_LIT_COLOR = FALLEN_COLOR;
/** Nothing left to take — the act dims to unpressable and keeps its place. */
export const CHAT_TABS_FORGET_SPENT_COLOR = "#333a4d";

/**
 * The quiet sign that a conversation not on screen holds a turn waiting for the hand. The colour of a
 * break, the size of a state dot, no number and no word beside it — it says «there is another list, look at it».
 */
export const CHAT_TABS_NEWS_COLOR = FALLEN_COLOR;
export const CHAT_TABS_NEWS_SIZE_PX = 5;
export const CHAT_TABS_NEWS_GAP_PX = 6;
export const CHAT_TABS_NEWS_LABEL = "У іншій розмові щось чекає руки";
