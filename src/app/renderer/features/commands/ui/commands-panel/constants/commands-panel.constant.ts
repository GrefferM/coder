/** Commands catalogue — list, footer, empty state. */
export const COMMANDS_PANEL_PADDING_PX = 12;
export const COMMANDS_PANEL_GAP_PX = 8;
export const COMMANDS_PANEL_NEW_LABEL = "Оголосити команду";
export const COMMANDS_PANEL_FOOTER_BORDER_COLOR = "#1c202c";

/** Note under the list on commands vs the MCP section. */
export const COMMANDS_PANEL_NOTE =
  "Команда — рядок запуску й опис для моделі. З'єднання, стану й оновлень у неї немає — тому вона й не з MCP.";
export const COMMANDS_PANEL_NOTE_COLOR = "#5c6478";
export const COMMANDS_PANEL_NOTE_FONT_SIZE_PX = 11;
export const COMMANDS_PANEL_NOTE_LINE_HEIGHT = 1.55;

/** Empty state — the one action centred, with a note. */
export const COMMANDS_PANEL_EMPTY_LABEL = "Команд ще немає. Агентам нічого запускати.";
export const COMMANDS_PANEL_EMPTY_GAP_PX = 14;
export const COMMANDS_PANEL_EMPTY_PADDING_PX = 22;
export const COMMANDS_PANEL_EMPTY_ICON_SIZE_PX = 30;
export const COMMANDS_PANEL_EMPTY_ICON_COLOR = "#3a4258";

/** Declare form labels. */
export const COMMANDS_PANEL_NAME_FIELD_LABEL = "ІМ'Я ФУНКЦІЇ";
export const COMMANDS_PANEL_DESCRIPTION_FIELD_LABEL = "ОПИС ДЛЯ МОДЕЛІ";
export const COMMANDS_PANEL_RUN_FIELD_LABEL = "КОМАНДА";
export const COMMANDS_PANEL_NAME_PLACEHOLDER = "run_tests";
/** The rule under the name field. */
export const COMMANDS_PANEL_NAME_FIELD_NOTE = "Тільки латинські літери, цифри й підкреслення";
export const COMMANDS_PANEL_DESCRIPTION_PLACEHOLDER = "Прогнати тести проєкту й повернути звіт";
export const COMMANDS_PANEL_RUN_PLACEHOLDER = "npm test -- {pattern}";
/** The run line is joined with nothing quoted or escaped, so quoting is the person's. */
export const COMMANDS_PANEL_RUN_FIELD_NOTE =
  "Лапки ставите ви: застосунок нічого не екранує — беріть слот у лапки: '{mask}'";
export const COMMANDS_PANEL_CANCEL_LABEL = "Скасувати";
export const COMMANDS_PANEL_DECLARE_LABEL = "Оголосити";
export const COMMANDS_PANEL_SAVE_LABEL = "Зберегти";
