import {
  BORDER_AT_REST_COLOR,
  CONTROL_AT_REST_COLOR,
  FIRST_LEVEL_TEXT_COLOR,
  PANEL_GROUND_COLOR,
  QUIET_MARK_COLOR,
  SECOND_LEVEL_TEXT_COLOR,
} from "../../../../../../../../../constants";

/** Heading for the models a local provider reports, in its order. */
export const PROVIDER_MODELS_LABEL = "МОДЕЛІ ПРОВАЙДЕРА";
export const PROVIDER_MODELS_REFRESH_LABEL = "ОНОВИТИ СПИСОК";
/** Retry label for a provider that said nothing. */
export const PROVIDER_MODELS_RETRY_LABEL = "СПРОБУВАТИ ЩЕ";
export const PROVIDER_MODELS_EMPTY_NOTE = "Провайдер відповів, але не має жодної моделі.";
export const PROVIDER_MODELS_LAST_KNOWN_NOTE =
  "Список останній відомий, тому тьмяний. Він не оновиться, доки провайдер не озветься.";
export const PROVIDER_MODELS_NAME_SEPARATOR = " · ";
/** Rows shown before the rest go behind one action. */
export const PROVIDER_MODELS_SHOWN_LIMIT = 8;
export const PROVIDER_MODELS_SHOW_ALL_LABEL = "ПОКАЗАТИ ВСІ";
export const PROVIDER_MODELS_MORE_PREFIX = " · ще ";
/** Takes an installed but undeclared model into the catalogue. */
export const PROVIDER_MODELS_TAKE_UP_LABEL = "ДОДАТИ В КАТАЛОГ";
export const PROVIDER_MODELS_CATALOGUE_NOTE =
  "Це те, що лежить на машині. Працюють лише моделі, оголошені в каталозі проєкту.";

export const PROVIDER_MODELS_GAP_PX = 8;
export const PROVIDER_MODELS_HEAD_GAP_PX = 8;
export const PROVIDER_MODELS_LIST_GAP_PX = 8;
export const PROVIDER_MODELS_LABEL_COLOR = SECOND_LEVEL_TEXT_COLOR;
export const PROVIDER_MODELS_LABEL_FONT_SIZE_PX = 11;
export const PROVIDER_MODELS_LABEL_LETTER_SPACING_PX = 1.15;

export const PROVIDER_MODELS_ROW_PADDING = "10px 12px";
export const PROVIDER_MODELS_ROW_GAP_PX = 9;
export const PROVIDER_MODELS_ROW_BORDER_RADIUS_PX = 10;
export const PROVIDER_MODELS_ROW_BACKGROUND_COLOR = "#171b26";
export const PROVIDER_MODELS_ROW_BORDER_COLOR = BORDER_AT_REST_COLOR;
export const PROVIDER_MODELS_ROW_NAME_COLOR = FIRST_LEVEL_TEXT_COLOR;
export const PROVIDER_MODELS_ROW_NAME_FONT_SIZE_PX = 12;
export const PROVIDER_MODELS_ROW_SIZE_COLOR = "#5c6478";
export const PROVIDER_MODELS_ROW_SIZE_BACKGROUND_COLOR = PANEL_GROUND_COLOR;
export const PROVIDER_MODELS_ROW_PRICE_COLOR = CONTROL_AT_REST_COLOR;
export const PROVIDER_MODELS_ROW_PRICE_FONT_SIZE_PX = 10;

export const PROVIDER_MODELS_LAST_KNOWN_PADDING = "11px 12px";
export const PROVIDER_MODELS_LAST_KNOWN_GAP_PX = 7;
export const PROVIDER_MODELS_LAST_KNOWN_COLOR = "#5c6478";
export const PROVIDER_MODELS_LAST_KNOWN_FONT_SIZE_PX = 11.5;
export const PROVIDER_MODELS_LAST_KNOWN_LINE_HEIGHT = 1.6;
export const PROVIDER_MODELS_NOTE_COLOR = QUIET_MARK_COLOR;
export const PROVIDER_MODELS_NOTE_LINE_HEIGHT = 1.7;
