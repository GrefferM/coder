/** The slot of the instruction the budget, in words, fills. */
export const COMPOSER_BUDGET_SLOT = "{budget}";

/**
 * How many characters a word is told to be worth. The ceiling counts characters but a model keeps count of words
 * better, so it is told words; a word of Ukrainian runs six or seven characters with the space after it, and the
 * larger number leaves the sum under the budget. What still runs over is cut off the end.
 */
export const COMPOSER_CHARACTERS_PER_WORD = 7;

/** What fences the memory in the composer's one message, so it reads as text to compress and not as a conversation. */
export const COMPOSER_MEMORY_OPENING = "<пам'ять>\n";
export const COMPOSER_MEMORY_CLOSING = "\n</пам'ять>\n\n";
/** What the memory's turns are told by in that text. */
export const COMPOSER_MEMORY_PERSON = "ЛЮДИНА:";
export const COMPOSER_MEMORY_AGENT = "АГЕНТ:";

/**
 * What the composer is told, after the memory in the same message: it writes the main of it in no more than so many
 * words, with no word of its own around it. It is told to put the most important first, which is what a summary does
 * anyway, so that what runs over the budget is cut off the end, where the least important stands.
 */
export const COMPOSER_INSTRUCTION = [
  `Ти — суворий модуль стиснення тексту (контекстний компресор). Твоє єдине завдання — стиснути пам'ять агента, наведену вище в тегах <пам'ять>, до максимум ${COMPOSER_BUDGET_SLOT} слів.`,
  "СУВОРІ ПРАВИЛА:",
  "1. ЖОДНИХ ВІДПОВІДЕЙ НА ПИТАННЯ: Не намагайся відповідати на запитання, вирішувати завдання, давати поради чи продовжувати думку, які звучали в пам'яті. Твоя роль — лише пасивний архіватор контексту.",
  "2. ЖОДНИХ ВСТУПНИХ ФРАЗ: Заборонено писати «Ось короткий зміст:», «Ось резюме:» тощо. Видавай одразу чистий текст стиснення.",
  "3. ЗБЕРЕЖЕННЯ ГОЛОВНОГО: Збережи ключові факти, ухвалені рішення, імена, числа й терміни. Пиши від найважливішого до другорядного.",
  `4. СУВОРІСТЬ ЛІМІТУ: Максимальна довжина результату — не більше ${COMPOSER_BUDGET_SLOT} слів. Що не вміститься, буде відрізано з кінця.`,
].join("\n");

/** Said as the turn's own sentence when the composer came back with nothing, since the memory cannot be dropped. */
export const COMPOSER_SAID_NOTHING_NOTE = "Композер повернув порожній зміст пам'яті — стискати нічим.";
