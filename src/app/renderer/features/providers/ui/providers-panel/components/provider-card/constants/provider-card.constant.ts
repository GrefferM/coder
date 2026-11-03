import {
  BORDER_AT_REST_COLOR,
  BROKEN_COLOR,
  CONTROL_AT_REST_COLOR,
  PANEL_GROUND_COLOR,
  QUIET_MARK_COLOR,
} from "../../../../../../../constants";

/** The opened provider — name, kind, its fields. */
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

/** A field per thing the provider asks for, a key, an address or both, with its hint as placeholder. */
export const PROVIDER_CARD_KEY_LABEL = "КЛЮЧ";
export const PROVIDER_CARD_KEY_PLACEHOLDER = "sk-…";
export const PROVIDER_CARD_ADDRESS_LABEL = "АДРЕСА";
export const PROVIDER_CARD_KEY_NOTE = "Порожнє поле прибирає ключ із цієї машини.";
export const PROVIDER_CARD_ADDRESS_NOTE = "Порожнє поле означає звичну адресу.";
/** For a provider with no customary address: the person's own endpoint, in the shape its page gives. */
export const PROVIDER_CARD_ADDRESS_PLACEHOLDER = "https://api.runpod.ai/v2/…";
export const PROVIDER_CARD_OWN_ADDRESS_NOTE =
  "Корінь точки зі сторінки провайдера; решту шляху застосунок дописує сам.";
/**
 * What a provider needs set up on its own side before an agent with functions can run on it, said in the card where its
 * address is written, by provider id. Prose, not a quiet line: the values are copied as written, case and all.
 */
export const PROVIDER_CARD_SETUP_NOTES: Record<string, string> = {
  "runpod-openai":
    "Щоб агент міг викликати функції, на endpoint потрібні змінні ENABLE_AUTO_TOOL_CHOICE=true і TOOL_CALL_PARSER під модель — для Qwen це hermes. Перша без другої не дає endpoint стартувати.",
};
export const PROVIDER_CARD_SETUP_NOTE_COLOR = CONTROL_AT_REST_COLOR;
export const PROVIDER_CARD_SETUP_NOTE_FONT_SIZE_PX = 11;
export const PROVIDER_CARD_SETUP_NOTE_LINE_HEIGHT = 1.55;
export const PROVIDER_CARD_CANCEL_LABEL = "Скасувати";
export const PROVIDER_CARD_SAVE_LABEL = "Зберегти";
/** Left of the pair: turns the provider off on this machine, or back on. */
export const PROVIDER_CARD_OFF_LABEL = "Вимкнути";
export const PROVIDER_CARD_ON_LABEL = "Увімкнути";

/** A local provider's line once asked; «Не відповідає» means not running, not a wrong key. */
export const PROVIDER_CARD_ASKING_LABEL = "ПИТАЄМО…";
export const PROVIDER_CARD_ANSWERED_LABEL = "Відповів";
export const PROVIDER_CARD_SILENT_LABEL = "Не відповідає";
export const PROVIDER_CARD_INSTALLED_SUFFIX = " встановлено";
/** Prefix for the time a silent provider was last checked. */
export const PROVIDER_CARD_CHECKED_PREFIX = "перевірено ";
export const PROVIDER_CARD_MODEL_FORMS = ["модель", "моделі", "моделей"];
export const PROVIDER_CARD_REPLY_SEPARATOR = " · ";
export const PROVIDER_CARD_ANSWERED_COLOR = "#5fd39a";
export const PROVIDER_CARD_SILENT_COLOR = BROKEN_COLOR;
export const PROVIDER_CARD_REPLY_FONT_SIZE_PX = 10;
export const PROVIDER_CARD_REPLY_LETTER_SPACING_PX = 1;
