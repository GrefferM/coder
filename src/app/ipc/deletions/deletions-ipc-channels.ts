import { DeletionController, ForgetDeletionDto, OpenProjectDto, RememberDeletionDto } from "../../../modules/projects";
import type { IpcChannelMap } from "../register-ipc-channels";
import { FORGET_DELETION_CHANNEL, LIST_DELETIONS_CHANNEL, REMEMBER_DELETION_CHANNEL } from "../../../contracts";

/** Deletion-history channels, bound to the controller. */
export const DELETIONS_IPC_CHANNELS: IpcChannelMap<DeletionController> = {
  [REMEMBER_DELETION_CHANNEL]: (controller, payload) =>
    controller.remember(Object.assign(new RememberDeletionDto(), payload)),
  [LIST_DELETIONS_CHANNEL]: (controller, payload) => controller.list(Object.assign(new OpenProjectDto(), payload)),
  [FORGET_DELETION_CHANNEL]: (controller, payload) =>
    controller.forget(Object.assign(new ForgetDeletionDto(), payload)),
};
