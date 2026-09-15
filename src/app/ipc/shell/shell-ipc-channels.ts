import type { IpcChannelMap } from "../register-ipc-channels";
import type { SystemShell } from "../../services";
import { CHOOSE_DIRECTORY_CHANNEL, REVEAL_PROJECT_CHANNEL } from "../../../contracts";

/** The desktop's own channels: a folder to work in, and revealing a project's file. */
export const SHELL_IPC_CHANNELS: IpcChannelMap<SystemShell> = {
  [CHOOSE_DIRECTORY_CHANNEL]: (systemShell) => systemShell.choose(),
  [REVEAL_PROJECT_CHANNEL]: (systemShell, payload) => systemShell.revealProject(<string>payload),
};
