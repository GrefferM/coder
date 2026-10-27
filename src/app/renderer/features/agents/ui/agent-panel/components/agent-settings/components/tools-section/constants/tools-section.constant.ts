import { CONTROL_AT_REST_COLOR } from "../../../../../../../../../constants";

export const TOOLS_SECTION_COMMANDS_LABEL = "КОМАНДИ";
export const TOOLS_SECTION_COUNT_SEPARATOR = " · ";
export const TOOLS_SECTION_GAP_PX = 8;

/** The closed field's words: «N з M» and this after it, or the label while nothing is granted. */
export const TOOLS_SECTION_CHOSEN_TAIL = " функцій";
export const TOOLS_SECTION_CHOOSE_LABEL = "Обрати функції";

export const TOOLS_SECTION_EMPTY_NOTE = "Інструментів у проєкті ще немає. Оголосіть команду або підключіть MCP-сервер.";
export const TOOLS_SECTION_EMPTY_PADDING = "16px 10px";
export const TOOLS_SECTION_EMPTY_GAP_PX = 11;
export const TOOLS_SECTION_EMPTY_ICON_SIZE_PX = 26;
export const TOOLS_SECTION_EMPTY_ICON_COLOR = "#3a4258";

/** Row name when the source command is gone. */
export const TOOLS_SECTION_LOST_NAME = "функції немає";
/** The same for an agent the project has let go. */
export const TOOLS_SECTION_LOST_AGENT_NAME = "агента немає";

/** `SourceGlyph`'s size and tone, beside a tools field's head. */
export const TOOLS_GROUP_ICON_SIZE_PX = 10;
export const TOOLS_GROUP_LABEL_COLOR = CONTROL_AT_REST_COLOR;

/** Shown instead of the picker when the model's provider has no function calls; existing grants stay listed. */
export const TOOLS_SECTION_LOCKED_NOTE = "Провайдер цієї моделі не вміє викликати функції";
