import {
  BORDER_AT_REST_COLOR,
  BROKEN_COLOR,
  CONTROL_AT_REST_COLOR,
  INTERACTION_REST_BACKGROUND_COLOR,
  PANEL_GROUND_COLOR,
  SECOND_LEVEL_TEXT_COLOR,
  WORDS_COLOR,
} from "../../../../../../../constants";

/** The parameters a declared command takes. */
export const COMMAND_FORM_PARAMETERS_LABEL = "ПАРАМЕТРИ";
export const COMMAND_FORM_PARAMETERS_GAP_PX = 7;
export const COMMAND_FORM_ADD_PARAMETER_LABEL = "Параметр";

/** One added parameter row: name, type chip, required flag. */
export const PARAMETER_ROW_PADDING = "8px 10px";
export const PARAMETER_ROW_BORDER_RADIUS_PX = 9;
export const PARAMETER_ROW_BORDER_COLOR = BORDER_AT_REST_COLOR;
export const PARAMETER_ROW_BACKGROUND_COLOR = "#171b26";
export const PARAMETER_ROW_GAP_PX = 9;
export const PARAMETER_ROW_NAME_COLOR = "#e6e9f2";
export const PARAMETER_ROW_NAME_FONT_SIZE_PX = 11.5;
export const PARAMETER_ROW_TYPE_BACKGROUND_COLOR = "#1b1f2c";
export const PARAMETER_ROW_TYPE_COLOR = CONTROL_AT_REST_COLOR;
export const PARAMETER_ROW_META_COLOR = "#5c6478";
export const PARAMETER_ROW_META_LETTER_SPACING_PX = 1;
/** A parameter the run line never mentions — declared, and never substituted. */
export const PARAMETER_ROW_UNUSED_LABEL = "НЕ В РЯДКУ КОМАНДИ";
export const PARAMETER_ROW_UNUSED_COLOR = SECOND_LEVEL_TEXT_COLOR;
export const PARAMETER_ROW_UNUSED_BORDER_COLOR = "#2c3550";
export const PARAMETER_ROW_OPEN_LABEL = "Відкрити параметр";

export const PARAMETER_ROW_REQUIRED_LABEL = "ОБОВ'ЯЗКОВИЙ";
export const PARAMETER_ROW_OPTIONAL_LABEL = "НЕОБОВ'ЯЗКОВИЙ";
export const PARAMETER_ROW_REMOVE_LABEL = "Прибрати параметр";
export const PARAMETER_ROW_REMOVE_SIZE_PX = 12;

/** The card that adds one, accent-bordered. */
export const PARAMETER_FORM_NEW_TITLE = "Новий параметр";
export const PARAMETER_FORM_TITLE_PREFIX = "Параметр ";
export const PARAMETER_FORM_ENUM_TYPE = "enum";

export const PARAMETER_FORM_OPEN_ANIMATION = "nested-open 0.16s cubic-bezier(0.2, 0, 0, 1)";
export const PARAMETER_FORM_BACKGROUND_COLOR = PANEL_GROUND_COLOR;
export const PARAMETER_FORM_BORDER_COLOR = "#38a3ff";
export const PARAMETER_FORM_BORDER_RADIUS_PX = 10;
export const PARAMETER_FORM_PADDING_PX = 16;
export const PARAMETER_FORM_GAP_PX = 13;

export const PARAMETER_FORM_TITLE_COLOR = "#e6e9f2";
export const PARAMETER_FORM_TITLE_FONT_SIZE_PX = 13;
export const PARAMETER_FORM_NAME_LABEL = "ІМ'Я";
export const PARAMETER_FORM_NAME_PLACEHOLDER = "pattern";
/**
 * The rule stands under the name **always**, and not only once it has been broken — «межу видно до
 * того, як у неї впертись». Any alphabet is allowed here: `{шлях}` is a lawful slot, because this name never
 * leaves the project, unlike a function's, which a provider has to take.
 */
export const PARAMETER_FORM_NAME_NOTE = "Літери, цифри й «_», і не з цифри · літери будь-якої абетки";
/**
 * What a broken rule is answered with — the refusal itself, and not the rule said over again. The
 * rule is already on the screen; repeating it says nothing new, and naming what failed does.
 */
export const PARAMETER_FORM_NAME_REFUSAL = "Таке ім'я не може стати в дужки";
export const PARAMETER_FORM_TYPE_LABEL = "ТИП";
export const PARAMETER_FORM_DESCRIPTION_LABEL = "ОПИС ДЛЯ МОДЕЛІ";
export const PARAMETER_FORM_DESCRIPTION_PLACEHOLDER = "Маска файлів тестів, напр. auth/*.spec.ts";
export const PARAMETER_FORM_REQUIRED_LABEL = "Обов'язковий";
/**
 * The one trap the app can see coming, named only where it is really set. An optional slot written in
 * quotes of its own leaves those quotes behind when it goes empty, and `''` is an argument — an empty one, but the
 * shell counts it. Nothing is said where the slot stands bare, because then it simply disappears with its place.
 */
export const PARAMETER_FORM_QUOTED_NOTE = "У рядку цей слот у лапках — без значення лишиться ''";
export const PARAMETER_FORM_QUOTED_COLOR = BROKEN_COLOR;
export const PARAMETER_FORM_QUOTED_GAP_PX = 6;
export const PARAMETER_FORM_QUOTED_FONT_SIZE_PX = 9;
export const PARAMETER_FORM_QUOTED_LETTER_SPACING_PX = 1.5;
export const PARAMETER_FORM_QUOTED_LINE_HEIGHT = 1.6;
export const PARAMETER_FORM_QUOTED_ICON_SIZE_PX = 9;
export const PARAMETER_FORM_QUOTED_ICON_RISE_PX = 2;
export const PARAMETER_FORM_CANCEL_LABEL = "СКАСУВАТИ";
export const PARAMETER_FORM_CONFIRM_LABEL = "ГОТОВО";

/** Parameter types, in the order the form offers them. */
export const PARAMETER_TYPE_OPTIONS = [
  {
    value: "text" as const,
    label: "text",
  },
  {
    value: "number" as const,
    label: "number",
  },
  {
    value: "bool" as const,
    label: "bool",
  },
  {
    value: "enum" as const,
    label: "enum",
  },
];

/** Placeholder id while a parameter is being declared. */
export const COMMAND_FORM_NEW_PARAMETER_ID = "new";

/** Plain-words facts in the declare form: start dir, no sandbox, and the model paying for the output. */
export const COMMAND_RUN_FACTS_LABEL = "ЩО СТАНЕТЬСЯ, КОЛИ АГЕНТ ЇЇ ПОКЛИЧЕ";
export const COMMAND_RUN_FACTS = [
  "Запуститься в теці проєкту — так само, як ви запускаєте її у своєму терміналі",
  "Пісочниці немає: вона може все, що можете ви, і в тому самому оточенні",
  "Модель побачить увесь вивід і заплатить за нього на кожному колі ходу",
];
export const COMMAND_RUN_FACTS_GAP_PX = 7;
export const COMMAND_RUN_FACTS_PADDING = "11px 12px";
/** The block wears a field's own skin — it is part of the form, not a footnote sunk into its floor. */
export const COMMAND_RUN_FACTS_BACKGROUND_COLOR = INTERACTION_REST_BACKGROUND_COLOR;
export const COMMAND_RUN_FACTS_BORDER_COLOR = BORDER_AT_REST_COLOR;
export const COMMAND_RUN_FACTS_BORDER_RADIUS_PX = 10;
/**
 * The heading is a caption and the three lines are words — the same tone every sentence the app says
 * carries. Told the other way round, the block reads a step quieter than everything around it, which is the last
 * thing this text should do.
 */
export const COMMAND_RUN_FACTS_LABEL_COLOR = SECOND_LEVEL_TEXT_COLOR;
export const COMMAND_RUN_FACTS_COLOR = WORDS_COLOR;
export const COMMAND_RUN_FACTS_FONT_SIZE_PX = 11.5;
export const COMMAND_RUN_FACTS_LINE_HEIGHT = 1.5;
export const COMMAND_RUN_FACTS_LINE_GAP_PX = 5;
