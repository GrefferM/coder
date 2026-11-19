/** The file Coder Hearing writes its one line to, inside a folder of its own. */
export const MAC_ANSWER_FILE_NAME = "answer.json";

/** The recording handed to Coder Hearing, beside its answer. */
export const MAC_RECORDING_FILE_NAME = "speech.wav";

/** The folder name each call to Coder Hearing is given under the system's temporary one. */
export const MAC_CALL_DIRECTORY_PREFIX = "coder-hearing-";

/** How Coder Hearing is launched: as an app of its own, waited for, kept in the background. */
export const MAC_OPEN_ARGUMENTS = ["-W", "-n", "-g"];

/** How long Coder Hearing may take: to say its permission or languages, to hear a recording, to wait for a person. */
export const MAC_LOOK_WAIT_MS = 15_000;
export const MAC_HEAR_WAIT_MS = 60_000;
export const MAC_ALLOW_WAIT_MS = 300_000;

/** What is said where Coder Hearing did not answer in time, or left no answer. */
export const MAC_SILENT_WORDS = "Coder Hearing не відповів";
