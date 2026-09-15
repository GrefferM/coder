import { PANEL_GROUND_COLOR } from "../../../../../../../../../constants";
/**
 * The block of the last call that failed. It wears one of two grounds and nothing else differs: the
 * trouble one, where the row itself is whole and this is the only bad news on it, and the quiet one, where the row
 * already says «ЖОДНА ФУНКЦІЯ НЕ ВІДПОВІЛА» and a second red thing would only shout the same word twice.
 */
export const LAST_CALL_PADDING = "8px 9px";
export const LAST_CALL_BORDER_RADIUS_PX = 9;
export const LAST_CALL_GAP_PX = 8;
export const LAST_CALL_TEXT_GAP_PX = 4;
export const LAST_CALL_TROUBLE_BACKGROUND_COLOR = "#1f1a20";
export const LAST_CALL_TROUBLE_BORDER_COLOR = "#4a2530";
export const LAST_CALL_QUIET_BACKGROUND_COLOR = PANEL_GROUND_COLOR;
export const LAST_CALL_QUIET_BORDER_COLOR = "#262b3a";
export const LAST_CALL_LABEL_FONT_SIZE_PX = 9;
export const LAST_CALL_LABEL_LETTER_SPACING_PX = 1;
export const LAST_CALL_SAID_COLOR = "#aab3cc";
export const LAST_CALL_SAID_FONT_SIZE_PX = 11.5;
export const LAST_CALL_SAID_LINE_HEIGHT = 1.5;
/** «рядок сервера — два рядки максимум, далі різ із «…»» — one loses the address, three make a paragraph. */
export const LAST_CALL_SAID_LINES = 2;
export const LAST_CALL_SIGN_SIZE_PX = 11;
export const LAST_CALL_SIGN_WIDTH = 1.8;
export const LAST_CALL_SIGN_TOP_PX = 2;
