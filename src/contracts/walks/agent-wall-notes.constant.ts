/** Names the model and which of its fields is empty. */
export const NOT_FILLED_NOTE_PREFIX = "У моделі ";
export const NOT_FILLED_AGENT_NOTE_PREFIX = "В агента ";

/** The sentence for a granted function the project has lost. */
export const LOST_FUNCTION_NOTE_PREFIX = "В агента ";
export const LOST_FUNCTION_NOTE_SUFFIX =
  " лишилась видача на функцію, якої в проєкті немає. Приберіть видачу або оголосіть команду наново, і агент піде.";

/** For a granted local server whose run line this machine has not agreed to (36k). */
export const NO_CONSENT_NOTE_SUFFIX = " ще не запускали на цій машині — його рядок запуску чекає вашої згоди.";

/** For a prompt the agent names and the project has lost. */
export const LOST_PROMPT_NOTE_PREFIX = "В агента ";

/** For a provider protocol without functions while the agent holds grants. */
export const NO_TOOLS_NOTE_PREFIX = "Провайдер ";
export const NO_TOOLS_NOTE_MIDDLE = " не вміє викликати функції, а в агента ";
export const NO_TOOLS_NOTE_SUFFIX = " є видачі. Зніміть їх або оберіть модель іншого провайдера, і агент піде.";
export const LOST_PROMPT_NOTE_SUFFIX =
  " зник промпт, на який він посилається. Оберіть промпт наново або зніміть його, і агент піде.";
export const NOT_FILLED_NOTE_MIDDLE = " не заповнено поле «";
export const NOT_FILLED_NOTE_SUFFIX = "». Заповніть його, і агент піде.";
