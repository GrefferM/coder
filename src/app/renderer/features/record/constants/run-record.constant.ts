import { RUN_DONE, RUN_FAILED, RUN_NOT_SENT, RUN_RUNNING, RUN_STOPPED } from "../../../../../contracts";

/**
 * The word each state wears, written once. The row of the history and the band over the stream
 * both read it here, so one flow cannot be named two ways depending on which of them the person is looking at.
 */
export const RUN_STATE_LABELS: Record<string, string> = {
  [RUN_RUNNING]: "ІДЕ",
  [RUN_DONE]: "ГОТОВО",
  [RUN_FAILED]: "УПАВ",
  [RUN_STOPPED]: "ЗУПИНЕНО",
  [RUN_NOT_SENT]: "НЕ ПІШОВ",
};

/** What comes after «УПАВ» where the screen knows which step it fell on. */
export const RUN_STEP_PREFIX = " НА КРОЦІ ";

/** What a row says under itself when its flow began on an earlier day than the one it stands in. */
export const RUN_STARTED_PREFIX = "ПОЧАТО ";

/** The days a list of runs spans, said in the question about forgetting them all. */
export const RUNS_SPAN_PREFIX = " — від ";
export const RUNS_SPAN_MIDDLE = " до ";
