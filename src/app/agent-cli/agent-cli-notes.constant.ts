/** What a command line is told when it was not given what it needs. */
export const AGENT_CLI_USAGE = 'Використання: npm run agent -- <проєкт> <агент> "питання"';
export const AGENT_CLI_USAGE_HINT =
  "Проєкт — назва з тих, що відкривала ця програма, або тека проєкту; агент — назва чи id; питання — решта слів.";

/** What the command line exits with: the walk went whole, the walk fell, or the question never went. */
export const AGENT_CLI_EXIT_WHOLE = 0;
export const AGENT_CLI_EXIT_FELL = 1;
export const AGENT_CLI_EXIT_NOT_ASKED = 2;
