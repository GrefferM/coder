import type { ModelKind } from "../../../interfaces";

/** Under the kind's track (49d): why it stands dim. */
export const KIND_LOCK_AGENTS_PREFIX = "На ній стоять ";
export const KIND_LOCK_AGENTS_SUFFIX = " — вид не змінити, поки вони на ній.";
export const KIND_LOCK_AGENT_FORMS = ["агент", "агенти", "агентів"];
export const KIND_LOCK_HEARD_NOTE = "Нею розпізнає «Мовлення» — вид не змінити, поки її там обрано.";

/** The kind after a catalogue row's name, and what a listening model says in its facts. */
export const MODEL_KIND_NAMES: Record<ModelKind, string> = {
  text: "текстова",
  listen: "розпізнавання",
};
export const MODEL_HEARD_LABEL = "Обрана в «Мовленні»";
export const MODEL_NOT_HEARD_LABEL = "Не обрана";
