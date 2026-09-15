/** A run, its steps and the calls inside them, in this machine's own database. */
export const RUN_TABLE_NAME = "runs";
// A flow is asked more than once, and every question of it stands in its own row.
export const RUN_QUESTION_TABLE_NAME = "run_questions";
export const RUN_STEP_TABLE_NAME = "run_steps";
// The step keeps what happened; who ran it, on what model and with what words stand beside.
export const RUN_STEP_AGENT_TABLE_NAME = "run_step_agents";
export const RUN_STEP_MODEL_TABLE_NAME = "run_step_models";
export const RUN_STEP_SETTING_TABLE_NAME = "run_step_settings";
export const RUN_CALL_TABLE_NAME = "run_calls";
// The two edges of a walk — whose work came in, and where this step's work went.
export const RUN_STEP_FEED_TABLE_NAME = "run_step_feeds";
export const RUN_HANDOFF_TABLE_NAME = "run_handoffs";
