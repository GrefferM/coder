import type { SystemCommandId } from "../../../interfaces";

/** What the panel says of each system command: its name is the id, the model's name for it too. */
export const SYSTEM_COMMAND_DESCRIPTIONS: Record<SystemCommandId, string> = {
  pass_to: "Передає результат далі обраним агентам — агент нічого не пише, лише викликає.",
  finish_here: "Завершує гілку: далі нічого не йде — агент нічого не пише, лише викликає.",
};
