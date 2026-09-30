import { PROJECT_NOT_FOUND } from "../constants";

/** Whether a failed open means the folder holds no project; the code sits inside Electron's wrapper message. */
export function isProjectNotFound(reason: unknown): boolean {
  return reason instanceof Error && reason.message.includes(PROJECT_NOT_FOUND);
}
