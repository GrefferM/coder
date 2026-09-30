import { CONTROL_AT_REST_COLOR } from "../../../../../../../../../constants";
/** What the agent may call: one list of the project's functions; the tick grants and revokes. */

/**
 * Section labels by kind: the word and glyph are the raised group head. Commands take «КОМАНДИ»; servers take the
 * raised kind word, keeping their own names on the heads inside the list.
 */
export const TOOLS_SECTION_COMMANDS_LABEL = "КОМАНДИ";
export const TOOLS_SECTION_COUNT_SEPARATOR = " · ";
export const TOOLS_SECTION_GAP_PX = 8;

/** Closed field: granted count of total; names listed under it. */
export const TOOLS_SECTION_CHOSEN_JOIN = " з ";
export const TOOLS_SECTION_CHOSEN_TAIL = " функцій";
export const TOOLS_SECTION_CHOOSE_LABEL = "Обрати функції";

/** Open list shows four rows plus head; the rest scrolls. */
export const TOOLS_SECTION_LIST_MAX_HEIGHT_PX = 150;

/** Empty-section note. */
export const TOOLS_SECTION_EMPTY_NOTE = "Інструментів у проєкті ще немає. Оголосіть команду або підключіть MCP-сервер.";
export const TOOLS_SECTION_EMPTY_PADDING = "16px 10px";
export const TOOLS_SECTION_EMPTY_GAP_PX = 11;
export const TOOLS_SECTION_EMPTY_ICON_SIZE_PX = 26;
export const TOOLS_SECTION_EMPTY_ICON_COLOR = "#3a4258";

/** Row name when the source command is gone. */
export const TOOLS_SECTION_LOST_NAME = "функції немає";
/** The same for an agent the project has let go. */
export const TOOLS_SECTION_LOST_AGENT_NAME = "агента немає";

/** The head over one source's functions in the picker: glyph, name, count on the right. */
export const TOOLS_GROUP_ICON_SIZE_PX = 10;
export const TOOLS_GROUP_LABEL_COLOR = CONTROL_AT_REST_COLOR;

/** Shown instead of the picker when the model's provider has no function calls; existing grants stay listed. */
export const TOOLS_SECTION_LOCKED_NOTE = "Провайдер цієї моделі не вміє викликати функції";
