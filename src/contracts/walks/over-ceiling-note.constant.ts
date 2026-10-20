/** What would have gone, against the number written on the model. */
export const OVER_CEILING_NOTE_PREFIX = "У модель пішло б ";
export const OVER_CEILING_NOTE_MIDDLE = ", а стеля ";
export const OVER_CEILING_NOTE_DASH = " — ";
export const OVER_CEILING_NOTE_SUFFIX = ". Хід не почався: нічого не обрізали й нічого не викинули.";
export const OVER_CEILING_CHARACTER_FORMS = ["символ", "символи", "символів"];
/**
 * Said when the words and the memory's reserve reach the threshold: a memory just compressed would be compressed again
 * by the next turn. The person can shorten the words.
 */
export const RESERVED_NOTE_PREFIX = "Промпт і питання — ";
export const RESERVED_NOTE_RESERVE = ", і ще ";
export const RESERVED_NOTE_LIMIT = " зарезервовано під пам'ять агента, а поріг стиснення — ";
export const RESERVED_NOTE_MODEL = " (стеля ";
export const RESERVED_NOTE_DASH = " — ";
export const RESERVED_NOTE_SUFFIX =
  "). Разом вони мають лишатися нижче порогу, інакше щойно стиснута пам'ять стискалась би знову на наступному ході. Хід не почався: нічого не обрізали й нічого не викинули.";
