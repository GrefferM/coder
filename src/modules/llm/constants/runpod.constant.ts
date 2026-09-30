/**
 * The queue of a serverless endpoint: a job is submitted, then polled until over. Paths hang off the endpoint address
 * from the provider's card.
 */
export const RUNPOD_RUN_PATH = "/run";
export const RUNPOD_STATUS_PATH = "/status/";
export const RUNPOD_CANCEL_PATH = "/cancel/";

/** Polling interval; the queue allows 2000 asks per ten seconds. */
export const RUNPOD_ASKED_EVERY_MS = 1_000;

/** The queue's statuses for a job still to come. */
export const RUNPOD_WAITING = ["IN_QUEUE", "IN_PROGRESS"];
export const RUNPOD_DONE = "COMPLETED";

/** Prefix where the job ended in anything but an answer and the worker left no words. */
export const RUNPOD_ENDED_PREFIX = "RunPod: ";
/** Prefix where the queue itself refused the job; its status line follows. */
export const RUNPOD_REFUSED_PREFIX = "RunPod ";
export const RUNPOD_REFUSED_SEPARATOR = " · ";

/** The client name shown in a trace; the queue is not OpenAI's protocol. */
export const RUNPOD_CLIENT_NAME = "runpod-queue";
