/** The file Coder Hearing writes its one line to, inside a folder of its own. */
export const MAC_ANSWER_FILE_NAME = "answer.json";

/** The recording handed to Coder Hearing, beside its answer. */
export const MAC_RECORDING_FILE_NAME = "speech.wav";

/** The folder name each call to Coder Hearing is given under the system's temporary one. */
export const MAC_CALL_DIRECTORY_PREFIX = "coder-hearing-";

/** How Coder Hearing is launched: as an app of its own, waited for, kept in the background. */
export const MAC_OPEN_ARGUMENTS = ["-W", "-n", "-g"];
