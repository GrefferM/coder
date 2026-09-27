import type { IpcChannelMap } from "../register-ipc-channels";
import type { SystemShell } from "../../services";
import {
  CHOOSE_DIRECTORY_CHANNEL,
  PACK_ATTACHMENTS_CHANNEL,
  PICK_ATTACHMENT_CHANNEL,
  REVEAL_PROJECT_CHANNEL,
  SAVE_TEXT_FILE_CHANNEL,
} from "../../../contracts";
import type { PackAttachmentsAsk, PickAttachmentsAsk, SaveTextAsk } from "../../../contracts";

/** The desktop's own channels: a folder to work in, a project's file revealed, and files picked and packed for a question. */
export const SHELL_IPC_CHANNELS: IpcChannelMap<SystemShell> = {
  [CHOOSE_DIRECTORY_CHANNEL]: (systemShell) => systemShell.choose(),
  [REVEAL_PROJECT_CHANNEL]: (systemShell, payload) => systemShell.revealProject(<string>payload),
  [PICK_ATTACHMENT_CHANNEL]: (systemShell, payload) => systemShell.attach(<PickAttachmentsAsk>payload),
  [PACK_ATTACHMENTS_CHANNEL]: (systemShell, payload) => systemShell.pack(<PackAttachmentsAsk>payload),
  [SAVE_TEXT_FILE_CHANNEL]: (systemShell, payload) => systemShell.saveText(<SaveTextAsk>payload),
};
