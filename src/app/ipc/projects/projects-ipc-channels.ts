import {
  CreateProjectDto,
  ForgetProjectDto,
  OpenProjectDto,
  RememberProjectViewDto,
  ProjectConfigDto,
  ProjectController,
  SaveProjectDto,
} from "../../../modules";
import type { IpcChannelMap } from "../register-ipc-channels";
import {
  CLOSE_PROJECT_CHANNEL,
  CREATE_PROJECT_CHANNEL,
  FORGET_PROJECT_CHANNEL,
  LIST_RECENT_PROJECTS_CHANNEL,
  LOOK_PROJECT_CHANNEL,
  OPEN_OR_CREATE_PROJECT_CHANNEL,
  OPEN_PROJECT_CHANNEL,
  PROJECT_VIEW_CHANNEL,
  REMEMBER_PROJECT_VIEW_CHANNEL,
  SAVE_PROJECT_CHANNEL,
} from "../../../contracts";

/** Project channels; each handler rebuilds a real DTO instance from the cloned payload. */
export const PROJECTS_IPC_CHANNELS: IpcChannelMap<ProjectController> = {
  [CREATE_PROJECT_CHANNEL]: (controller, payload) => controller.create(Object.assign(new CreateProjectDto(), payload)),
  [OPEN_PROJECT_CHANNEL]: (controller, payload) => controller.open(Object.assign(new OpenProjectDto(), payload)),
  [SAVE_PROJECT_CHANNEL]: (controller, payload) => {
    const saveProject = Object.assign(new SaveProjectDto(), payload);

    saveProject.config = Object.assign(new ProjectConfigDto(), saveProject.config);

    return controller.save(saveProject);
  },
  [LOOK_PROJECT_CHANNEL]: (controller, payload) => controller.look(Object.assign(new OpenProjectDto(), payload)),
  [OPEN_OR_CREATE_PROJECT_CHANNEL]: (controller, payload) =>
    controller.openOrCreate(Object.assign(new OpenProjectDto(), payload)),
  [FORGET_PROJECT_CHANNEL]: (controller, payload) => controller.forget(Object.assign(new ForgetProjectDto(), payload)),
  [PROJECT_VIEW_CHANNEL]: (controller, payload) => controller.viewOf(Object.assign(new OpenProjectDto(), payload)),
  [REMEMBER_PROJECT_VIEW_CHANNEL]: (controller, payload) =>
    controller.rememberView(Object.assign(new RememberProjectViewDto(), payload)),
  [LIST_RECENT_PROJECTS_CHANNEL]: (controller) => controller.findRecent(),
  [CLOSE_PROJECT_CHANNEL]: (controller) => controller.close(),
};
