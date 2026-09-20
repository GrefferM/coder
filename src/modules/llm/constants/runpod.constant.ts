/**
 * The queue of a serverless endpoint: a job is thrown in, then asked about until it is over. The paths hang off
 * the endpoint's own address, which is what the person writes in the provider's card.
 */
export const RUNPOD_RUN_PATH = "/run";
export const RUNPOD_STATUS_PATH = "/status/";
export const RUNPOD_CANCEL_PATH = "/cancel/";

/** How often the job is asked about. The queue allows two thousand asks per ten seconds; a second is grain enough. */
export const RUNPOD_ASKED_EVERY_MS = 1_000;

/** What the queue calls a job that is still to come, and the one word that means an answer. */
export const RUNPOD_WAITING = ["IN_QUEUE", "IN_PROGRESS"];
export const RUNPOD_DONE = "COMPLETED";

/** Said where the job ended in anything but an answer and the worker left no words of its own. */
export const RUNPOD_ENDED_PREFIX = "RunPod: ";
/** Said where the queue itself refused the job — its own status line stands after this. */
export const RUNPOD_REFUSED_PREFIX = "RunPod ";
export const RUNPOD_REFUSED_SEPARATOR = " · ";

/** What the app is called to whoever reads a trace; the queue is not OpenAI's protocol and does not pretend to be. */
export const RUNPOD_CLIENT_NAME = "runpod-queue";
