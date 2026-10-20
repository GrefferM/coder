/**
 * The words the shared memory is told in. It opens with what it is, gives the person's question and then every answer
 * in the order it landed, each with whom its work came from, and closes on the turn's own task, which follows it.
 */
export const SHARED_MEMORY_OPENING = "ЗАГАЛЬНА ПАМ'ЯТЬ — що вже сталося з цим питанням до тебе: хто кому що передав.";
/** The slots the headings below fill: an agent's name, and whom its work came from. */
export const SHARED_MEMORY_NAME_SLOT = "{name}";
export const SHARED_MEMORY_FROM_SLOT = "{from}";
export const SHARED_MEMORY_QUESTION = "ПИТАННЯ ЛЮДИНИ → {name}:";
export const SHARED_MEMORY_ANSWER = "ВІДПОВІДЬ {name} (отримав від: {from}):";
/** The block that stands for the question and the answers a compression covers; the answers after it follow as they were. */
export const SHARED_MEMORY_COMPOSED = "ПОПЕРЕДНЄ, СТИСЛО (питання людини і відповіді до цього моменту):";
/** Whom a turn nobody fed got its work from. */
export const SHARED_MEMORY_PERSON = "ЛЮДИНА";
/** Between names of several suppliers. */
export const SHARED_MEMORY_NAMES_SEPARATOR = ", ";
/** Between the blocks, and between a heading and its words. */
export const SHARED_MEMORY_BLOCK_SEPARATOR = "\n\n";
export const SHARED_MEMORY_HEADING_SEPARATOR = "\n";
/** The last line; the turn's own words follow it. */
export const SHARED_MEMORY_TASK = "ТВОЄ ЗАВДАННЯ:\n";
