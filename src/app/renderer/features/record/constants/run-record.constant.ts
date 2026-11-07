import { RUN_DONE, RUN_FAILED, RUN_NOT_SENT, RUN_RUNNING, RUN_STOPPED } from "../../../../../contracts";

/** The word each state wears; the history row and the stream band both read it. */
export const RUN_STATE_LABELS: Record<string, string> = {
  [RUN_RUNNING]: "ІДЕ",
  [RUN_DONE]: "ГОТОВО",
  [RUN_FAILED]: "УПАВ",
  [RUN_STOPPED]: "ЗУПИНЕНО",
  [RUN_NOT_SENT]: "НЕ ПІШОВ",
};

/** Follows «УПАВ» where the failed step is known. */
export const RUN_STEP_PREFIX = " НА КРОЦІ ";

/** Under a row whose flow began on an earlier day. */
export const RUN_STARTED_PREFIX = "ПОЧАТО ";
/** A run a schedule put, at the end of its lower line (23y). */
export const RUN_BY_SCHEDULE_LABEL = "ЗА РОЗКЛАДОМ";

/** The days a list of runs spans, in the forget-all question. */
export const RUNS_SPAN_PREFIX = " — від ";
export const RUNS_SPAN_MIDDLE = " до ";
