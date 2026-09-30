import {
  BORDER_AT_REST_COLOR,
  FIRST_LEVEL_TEXT_COLOR,
  PANEL_GROUND_COLOR,
  QUIET_MARK_COLOR,
} from "../../../../../constants";

/** Editor across the whole working area, over the canvas. */
export const PROMPT_EDITOR_INSET_PX = 6;
export const PROMPT_EDITOR_BACKGROUND_COLOR = PANEL_GROUND_COLOR;
export const PROMPT_EDITOR_BORDER_RADIUS_PX = 10;

/** Top bar: origin, text length, way back. */
export const PROMPT_EDITOR_SECTION_LABEL = "Промпти";
export const PROMPT_EDITOR_SEPARATOR = " · ";

/** Right side of the bar: text meta and the close chip. */
export const PROMPT_EDITOR_META_COLOR = QUIET_MARK_COLOR;
export const PROMPT_EDITOR_MONO_FONT_SIZE_PX = 9;
export const PROMPT_EDITOR_MONO_LETTER_SPACING_PX = 1.5;
export const PROMPT_EDITOR_WORD_FORMS = ["слово", "слова", "слів"];
export const PROMPT_EDITOR_COLLAPSE_LABEL = "Згорнути · ESC";
export const PROMPT_EDITOR_COLLAPSE_BORDER_COLOR = BORDER_AT_REST_COLOR;
export const PROMPT_EDITOR_COLLAPSE_BORDER_RADIUS_PX = 7;
export const PROMPT_EDITOR_COLLAPSE_PADDING = "4px 9px";
export const PROMPT_EDITOR_COLLAPSE_GAP_PX = 6;
export const PROMPT_EDITOR_COLLAPSE_ICON_SIZE_PX = 10;

/** Body: name over the text. */
export const PROMPT_EDITOR_BODY_PADDING = "26px 34px";
export const PROMPT_EDITOR_BODY_GAP_PX = 16;
export const PROMPT_EDITOR_NAME_GAP_PX = 12;
/** Width of the name's slot, shared by the word and its field so nothing beside it jumps on press. */
export const PROMPT_EDITOR_NAME_WIDTH_PX = 200;
export const PROMPT_EDITOR_NAME_COLOR = "#e6e9f2";
export const PROMPT_EDITOR_NAME_FONT_SIZE_PX = 19;
export const PROMPT_EDITOR_NAME_WEIGHT = 600;
export const PROMPT_EDITOR_NAME_LABEL = "Назва · клік щоб змінити";
export const PROMPT_EDITOR_NAME_PLACEHOLDER = "Назва промпта";
export const PROMPT_EDITOR_TEXT_BACKGROUND_COLOR = "#0d0f16";
export const PROMPT_EDITOR_TEXT_BORDER_COLOR = BORDER_AT_REST_COLOR;
export const PROMPT_EDITOR_TEXT_BORDER_RADIUS_PX = 10;
export const PROMPT_EDITOR_TEXT_PADDING = "20px 24px";
export const PROMPT_EDITOR_TEXT_COLOR = FIRST_LEVEL_TEXT_COLOR;
export const PROMPT_EDITOR_TEXT_FONT_SIZE_PX = 13.5;
export const PROMPT_EDITOR_TEXT_LINE_HEIGHT = 1.75;
export const PROMPT_EDITOR_TEXT_PLACEHOLDER = "Текст системного промпта";

/** Footer: who the change reaches, and the two answers. */
export const PROMPT_EDITOR_FOOTER_PADDING = "14px 34px";
export const PROMPT_EDITOR_FOOTER_BORDER_COLOR = "#1c202c";
export const PROMPT_EDITOR_FOOTER_GAP_PX = 10;
export const PROMPT_EDITOR_ACTIONS_WIDTH_PX = 300;
export const PROMPT_EDITOR_AGENTS_PREFIX = "Зміни торкнуться";
export const PROMPT_EDITOR_AGENT_FORMS = ["агента", "агентів", "агентів"];
export const PROMPT_EDITOR_AGENTS_SEPARATOR = " · ";
export const PROMPT_EDITOR_NO_AGENTS_LABEL = "Поки що цей промпт нікому не призначений";
export const PROMPT_EDITOR_CANCEL_LABEL = "Скасувати";
export const PROMPT_EDITOR_SAVE_LABEL = "Зберегти";
