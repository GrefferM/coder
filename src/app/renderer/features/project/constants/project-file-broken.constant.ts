import type { BrokenPlaceKind } from "../../../../../contracts";

/**
 * What the screen says in place of that code, with the broken thing named after it — a broken file cannot be
 * opened at all, so the person's only way on is to go to that thing and mend it themselves.
 */
export const PROJECT_FILE_BROKEN_NOTE = "Файл проєкту не читається — ось що в ньому не так: ";

/** Said where the refusal named no place, so the sentence is not left hanging on a colon. */
export const PROJECT_FILE_BROKEN_NOWHERE_NOTE = "Файл проєкту не читається";

/** How the broken line reads before the named things, and between them. */
export const BROKEN_PLACE_PROJECT_WORD = "Проєкт";
export const BROKEN_PLACE_STEP_SEPARATOR = " → ";
export const BROKEN_PLACE_NAME_OPEN = " «";
export const BROKEN_PLACE_NAME_CLOSE = "»";
export const BROKEN_PLACE_FIELD_PREFIX = ": поле «";
export const BROKEN_PLACE_FIELD_SUFFIX = "» — ";

/** Each kind of thing in its own word. */
export const BROKEN_PLACE_KIND_WORDS: Record<BrokenPlaceKind, string> = {
  model: "модель",
  prompt: "промпт",
  command: "команда",
  parameter: "параметр",
  server: "сервер",
  agent: "агент",
  grant: "видача",
  link: "звʼязок",
};

/** The fields the screen has a human word for; anything else is said by its own key. */
export const BROKEN_PLACE_FIELD_WORDS: Record<string, string> = {
  id: "ідентифікатор",
  title: "назва",
  name: "імʼя",
  modelId: "модель",
  promptId: "промпт",
  provider: "провайдер",
  run: "рядок запуску",
  value: "значення",
  color: "колір",
  temperature: "температура",
  maxCalls: "стеля викликів",
  contextCeiling: "стеля контексту",
  answerCeiling: "стеля відповіді",
  inputPrice: "ціна входу",
  outputPrice: "ціна виходу",
};

/** What each broken rule means, in words; a rule with no word of its own is said plainly. */
export const BROKEN_PLACE_RULE_PHRASES: Record<string, string> = {
  isUuid: "має бути коректним ідентифікатором",
  isNotEmpty: "не заповнено",
  isString: "має бути текстом",
  isNumber: "має бути числом",
  isInt: "має бути цілим числом",
  isBoolean: "має бути так або ні",
  isIn: "недопустиме значення",
  isDefined: "відсутнє",
};
export const BROKEN_PLACE_RULE_DEFAULT = "некоректне значення";
