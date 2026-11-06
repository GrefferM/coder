import type { SegmentedOption } from "../../../../../components";
import type { ModelKind } from "../../../../../interfaces";
import { BORDER_AT_REST_COLOR, FIRST_LEVEL_TEXT_COLOR, SECOND_LEVEL_TEXT_COLOR } from "../../../../../constants";
import { groupedNumber } from "../../../../../utils/numbers";
import {
  MODEL_ANSWER_CEILING_LEAST,
  MODEL_ANSWER_CEILING_MOST,
  MODEL_CONTEXT_CEILING_LEAST,
  MODEL_CONTEXT_CEILING_MOST,
} from "../../../../../../../contracts";

/** Catalogue layout: full-height list, one action in the footer. */
export const MODELS_PANEL_PADDING_PX = 14;
export const MODELS_PANEL_GAP_PX = 10;
export const MODELS_PANEL_FOOTER_BORDER_COLOR = "#1c202c";

export const MODELS_PANEL_SEARCH_PLACEHOLDER = "Пошук";
export const MODELS_PANEL_SEARCH_BACKGROUND_COLOR = "#171b26";
export const MODELS_PANEL_SEARCH_BORDER_COLOR = BORDER_AT_REST_COLOR;
export const MODELS_PANEL_SEARCH_BORDER_RADIUS_PX = 9;
export const MODELS_PANEL_SEARCH_PADDING = "8px 10px";
export const MODELS_PANEL_SEARCH_GAP_PX = 8;
export const MODELS_PANEL_SEARCH_COLOR = FIRST_LEVEL_TEXT_COLOR;
export const MODELS_PANEL_SEARCH_ICON_COLOR = "#5c6478";
export const MODELS_PANEL_SEARCH_ICON_SIZE_PX = 13;
export const MODELS_PANEL_SEARCH_FONT_SIZE_PX = 11;

/** Footer action; also centred in an empty section. */
export const MODELS_PANEL_NEW_LABEL = "Нова модель";

/** Empty state: glyph, note, spacing. */
export const MODELS_PANEL_EMPTY_LABEL = "Моделей ще немає. Агентам нема на чому працювати.";
export const MODELS_PANEL_EMPTY_COLOR = SECOND_LEVEL_TEXT_COLOR;
export const MODELS_PANEL_EMPTY_FONT_SIZE_PX = 12.5;
export const MODELS_PANEL_EMPTY_GAP_PX = 14;
export const MODELS_PANEL_EMPTY_PADDING_PX = 22;
export const MODELS_PANEL_EMPTY_ICON_SIZE_PX = 30;
export const MODELS_PANEL_EMPTY_ICON_COLOR = "#3a4258";
export const MODELS_PANEL_SEARCH_EMPTY_LABEL = "Нічого не знайшлося";

/** Model form field labels and the two exits. */
export const MODELS_PANEL_TITLE_FIELD_LABEL = "НАЗВА";

/** The kind right after the name (49d): what the model does, and a sentence on what that means. */
export const MODEL_KIND_FIELD_LABEL = "ВИД";
export const MODEL_KIND_OPTIONS: SegmentedOption<ModelKind>[] = [
  {
    value: "text",
    label: "Текстова",
  },
  {
    value: "listen",
    label: "Розпізнавання",
  },
];
export const MODEL_KIND_HINTS: Record<ModelKind, string> = {
  text: "",
  listen: "Слухає запис і повертає слова. Агентові її не поставити — її обирають у розділі «Мовлення».",
};
export const MODELS_PANEL_PROVIDER_FIELD_LABEL = "ПРОВАЙДЕР";
export const MODELS_PANEL_CEILING_FIELD_LABEL = "СТЕЛЯ КОНТЕКСТУ";
export const MODELS_PANEL_ANSWER_CEILING_FIELD_LABEL = "СТЕЛЯ ВІДПОВІДІ";
export const MODELS_PANEL_CEILING_UNIT = "символів";
export const MODELS_PANEL_ANSWER_CEILING_UNIT = "токенів";

/** What the number is — the length of one turn, in characters. */
export const MODELS_PANEL_CEILING_NOTE =
  "Довжина тексту, що йде в модель за раз, у символах. Рахуємо ми й до ходу: що не влазить, те не починається.";
export const MODELS_PANEL_CEILING_NOTE_NEW = MODELS_PANEL_CEILING_NOTE;

/** The other end of the same model, in the unit the provider counts. */
export const MODELS_PANEL_ANSWER_CEILING_NOTE =
  "Максимум токенів, які модель згенерує за один хід. Це число йде провайдерові як є — рахує й обриває він.";
/**
 * Replaces the field's note while the number cannot stand; the bounds are read from the contract so the sentence matches
 * what the file refuses.
 */
export const MODELS_PANEL_CEILING_WRONG_NOTE = `Від ${groupedNumber(MODEL_CONTEXT_CEILING_LEAST)} до ${groupedNumber(MODEL_CONTEXT_CEILING_MOST)} символів: менше — нічого не надіслати, більше — зайвий нуль.`;
export const MODELS_PANEL_ANSWER_CEILING_WRONG_NOTE = `Від ${groupedNumber(MODEL_ANSWER_CEILING_LEAST)} до ${groupedNumber(MODEL_ANSWER_CEILING_MOST)} токенів: менше — майже нічого не сказати, більше — зайвий нуль.`;

export const MODELS_PANEL_CEILING_STEP = 1000;

export const MODELS_PANEL_INPUT_PRICE_FIELD_LABEL = "ВХІДНА · $/1M";
export const MODELS_PANEL_OUTPUT_PRICE_FIELD_LABEL = "ВИХІДНА · $/1M";
export const MODELS_PANEL_CREATE_LABEL = "Створити";
export const MODELS_PANEL_SAVE_LABEL = "Зберегти";
export const MODELS_PANEL_CANCEL_LABEL = "Скасувати";

/** The provider is known but does not hold the model. */
export const NOT_INSTALLED_SUFFIX = " · немає на машині";

/** The name is sent verbatim; each provider spells it differently. */
export const MODEL_NAME_EXAMPLES: Record<string, string> = {
  anthropic: "claude-sonnet-4-5",
  openai: "gpt-5.1-codex",
  openrouter: "anthropic/claude-sonnet-4.5",
  google: "gemini-2.5-pro",
  opencode: "kimi-k3",
};

/**
 * Notes for providers whose name is read otherwise: RunPod's queue never names the model, so the title is for the eye
 * alone; its OpenAI door matches the name against the list the endpoint gives.
 */
export const MODEL_NAME_NOTES: Record<string, string> = {
  runpod: "Ім'я для ока: точка обслуговує одну модель, і запит її не називає",
  "runpod-openai": "Так, як його віддає endpoint у /openai/v1/models",
};
export const MODEL_NAME_NOTE_PREFIX = "Так, як його пише провайдер: ";
export const MODEL_NAME_NOTE_UNCHOSEN = "Так, як його пише провайдер — оберіть провайдера нижче";
export const MODEL_NAME_NOTE_LOCAL = "Так, як його називає сам провайдер на цій машині";
