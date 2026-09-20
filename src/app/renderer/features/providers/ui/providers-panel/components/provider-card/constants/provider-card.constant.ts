import {
  BORDER_AT_REST_COLOR,
  BROKEN_COLOR,
  CONTROL_AT_REST_COLOR,
  PANEL_GROUND_COLOR,
  QUIET_MARK_COLOR,
} from "../../../../../../../constants";

/** The opened provider — name, kind, its one field. */
export const PROVIDER_CARD_PADDING = "12px";
export const PROVIDER_CARD_GAP_PX = 11;
export const PROVIDER_CARD_BORDER_RADIUS_PX = 10;
export const PROVIDER_CARD_BACKGROUND_COLOR = "#171b26";
export const PROVIDER_CARD_BORDER_COLOR = "#2c3550";
export const PROVIDER_CARD_HEAD_GAP_PX = 9;
export const PROVIDER_CARD_NAME_COLOR = "#e6e9f2";
export const PROVIDER_CARD_NAME_FONT_SIZE_PX = 13;
export const PROVIDER_CARD_NAME_FONT_WEIGHT = 500;
export const PROVIDER_CARD_DOT_SIZE_PX = 8;
export const PROVIDER_CARD_DOT_COLOR = "#4ade80";
export const PROVIDER_CARD_DOT_GLOW_PX = 7;
export const PROVIDER_CARD_EMPTY_DOT_BORDER = `1.4px solid ${QUIET_MARK_COLOR}`;
export const PROVIDER_CARD_BADGE_PADDING = "1px 6px";
export const PROVIDER_CARD_BADGE_BORDER_RADIUS_PX = 5;
export const PROVIDER_CARD_BADGE_BACKGROUND_COLOR = PANEL_GROUND_COLOR;
export const PROVIDER_CARD_BADGE_BORDER_COLOR = BORDER_AT_REST_COLOR;
export const PROVIDER_CARD_BADGE_COLOR = CONTROL_AT_REST_COLOR;
export const PROVIDER_CARD_BADGE_FONT_SIZE_PX = 9;
export const PROVIDER_CARD_BADGE_LETTER_SPACING_PX = 1;

/** A field for each thing the provider asks for — a key, an address, or both — its hint in the placeholder. */
export const PROVIDER_CARD_KEY_LABEL = "КЛЮЧ";
export const PROVIDER_CARD_KEY_PLACEHOLDER = "sk-…";
export const PROVIDER_CARD_ADDRESS_LABEL = "АДРЕСА";
export const PROVIDER_CARD_KEY_NOTE = "Порожнє поле прибирає ключ із цієї машини.";
export const PROVIDER_CARD_ADDRESS_NOTE = "Порожнє поле означає звичну адресу.";
/** A provider with no customary address of its own: the person's own endpoint, written as its page gives it. */
export const PROVIDER_CARD_ADDRESS_PLACEHOLDER = "https://api.runpod.ai/v2/…";
export const PROVIDER_CARD_OWN_ADDRESS_NOTE =
  "Корінь точки зі сторінки провайдера; решту шляху застосунок дописує сам.";
export const PROVIDER_CARD_CANCEL_LABEL = "Скасувати";
export const PROVIDER_CARD_SAVE_LABEL = "Зберегти";

/** A local provider's line once asked; «Не відповідає» means not running, not a wrong key. */
export const PROVIDER_CARD_ASKING_LABEL = "ПИТАЄМО…";
export const PROVIDER_CARD_ANSWERED_LABEL = "Відповів";
export const PROVIDER_CARD_SILENT_LABEL = "Не відповідає";
export const PROVIDER_CARD_INSTALLED_SUFFIX = " встановлено";
/** Prefix for the time a silent provider was last checked. */
export const PROVIDER_CARD_CHECKED_PREFIX = "перевірено ";
/** Plural forms for the model count. */
export const PROVIDER_CARD_MODEL_FORMS = ["модель", "моделі", "моделей"];
export const PROVIDER_CARD_REPLY_SEPARATOR = " · ";
export const PROVIDER_CARD_ANSWERED_COLOR = "#5fd39a";
export const PROVIDER_CARD_SILENT_COLOR = BROKEN_COLOR;
export const PROVIDER_CARD_REPLY_FONT_SIZE_PX = 10;
export const PROVIDER_CARD_REPLY_LETTER_SPACING_PX = 1;
