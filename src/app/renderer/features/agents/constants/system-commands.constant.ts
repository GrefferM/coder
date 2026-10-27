import type { SystemCommandId } from "../../../interfaces";

/** What the panel says of each system command: its name is the id, the model's name for it too. */
export const SYSTEM_COMMAND_DESCRIPTIONS: Record<SystemCommandId, string> = {
  pass_to: "Передає обраним агентам текст, який агент пише сам; після виклику далі йде лише передане.",
  finish_here: "Завершує гілку й хід агента: далі нічого не йде.",
};
