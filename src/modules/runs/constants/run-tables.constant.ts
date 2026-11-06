/** A run, its steps and the calls inside them, in this machine's own database. */
export const RUN_TABLE_NAME = "runs";
// One row per question; a flow is asked more than once.
export const RUN_QUESTION_TABLE_NAME = "run_questions";
// The files and folders sent with a question, one row each, packed as they went.
export const RUN_QUESTION_ATTACHMENT_TABLE_NAME = "run_question_attachments";
// The recordings a question was said with, one row each, the sound beside the wave.
export const RUN_QUESTION_RECORDING_TABLE_NAME = "run_question_recordings";
export const RUN_STEP_TABLE_NAME = "run_steps";
// Who ran a step, on what model and with what words, beside the step.
export const RUN_STEP_AGENT_TABLE_NAME = "run_step_agents";
export const RUN_STEP_MODEL_TABLE_NAME = "run_step_models";
export const RUN_STEP_SETTING_TABLE_NAME = "run_step_settings";
// The composer's messages: what an agent's memory was compressed into, beside the step that paid for it.
export const RUN_MEMORY_TABLE_NAME = "run_memories";
export const RUN_CALL_TABLE_NAME = "run_calls";
// Both edges of a walk: whose work came into a step and where its work went.
export const RUN_STEP_FEED_TABLE_NAME = "run_step_feeds";
export const RUN_HANDOFF_TABLE_NAME = "run_handoffs";
