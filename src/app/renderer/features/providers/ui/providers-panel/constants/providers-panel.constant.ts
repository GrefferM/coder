import { BORDER_AT_REST_COLOR, CONTROL_AT_REST_COLOR, QUIET_MARK_COLOR } from "../../../../../constants";

/**
 * The one sentence over the list — the same providers everywhere, and keys that stay on this machine.
 * What is not said here is said by the screen itself: a model belongs to its provider, so the model form is where
 * one is chosen; and there is no act to add a provider, so nothing has to explain the absence of one.
 */
export const PROVIDERS_NOTE_BEFORE =
  "Список однаковий у кожній інсталяції. Ключі й адреси лишаються в сховищі цієї машини й у ";

export const PROVIDERS_NOTE_AFTER = " не потрапляють — колега, що відкриє цю папку, вписує свої.";
export const PROVIDERS_NOTE_PADDING = "14px 16px 10px";
export const PROVIDERS_NOTE_GAP_PX = 9;
export const PROVIDERS_NOTE_CARD_PADDING = "10px 11px";
export const PROVIDERS_NOTE_BORDER_RADIUS_PX = 9;
export const PROVIDERS_NOTE_BACKGROUND_COLOR = "#171b26";
export const PROVIDERS_NOTE_BORDER_COLOR = BORDER_AT_REST_COLOR;
export const PROVIDERS_NOTE_ICON_SIZE_PX = 13;
export const PROVIDERS_NOTE_COLOR = CONTROL_AT_REST_COLOR;
export const PROVIDERS_NOTE_FILE_COLOR = "#aab3cc";
export const PROVIDERS_NOTE_FONT_SIZE_PX = 12;
export const PROVIDERS_NOTE_LINE_HEIGHT = 1.55;

/** One row per provider; the set is fixed. */
export const PROVIDERS_LIST_PADDING = "0 16px";
export const PROVIDERS_LIST_GAP_PX = 10;

/** Filled providers first, unfilled below under a rule and word shown only when both groups exist. */
export const PROVIDERS_UNSET_LABEL = "НЕ НАЛАШТОВАНІ";
export const PROVIDERS_RULE_MARGIN = "2px 0";

/** A local provider's row says whether anybody answers. */
export const PROVIDER_ANSWERING_LABEL = "ВІДПОВІДАЄ";
export const PROVIDER_SILENT_LABEL = "НЕ ВІДПОВІДАЄ";
export const PROVIDER_ASKING_LABEL = "ПИТАЄМО…";
export const PROVIDER_FACTS_SEPARATOR = " · ";

export const PROVIDERS_HINT_COLOR = QUIET_MARK_COLOR;
