import {
  CallPlaceDto,
  ForgetRunDto,
  ForgetRunsDto,
  ListRunsDto,
  ReadRunDto,
  RunController,
  SearchRunsDto,
} from "../../../modules/runs";
import type { IpcChannelMap } from "../register-ipc-channels";
import {
  FORGET_RUN_CHANNEL,
  FORGET_RUNS_CHANNEL,
  LIST_RUNS_CHANNEL,
  CALL_PLACE_CHANNEL,
  READ_RUN_CHANNEL,
  SEARCH_RUNS_CHANNEL,
} from "../../../contracts";

/** Run-record channels; each handler rebuilds a DTO instance from the cloned payload. */
export const RUNS_IPC_CHANNELS: IpcChannelMap<RunController> = {
  [LIST_RUNS_CHANNEL]: (controller, payload) => controller.list(Object.assign(new ListRunsDto(), payload)),
  [READ_RUN_CHANNEL]: (controller, payload) => controller.one(Object.assign(new ReadRunDto(), payload)),
  [CALL_PLACE_CHANNEL]: (controller, payload) => controller.placeOfCall(Object.assign(new CallPlaceDto(), payload)),
  [SEARCH_RUNS_CHANNEL]: (controller, payload) => controller.find(Object.assign(new SearchRunsDto(), payload)),
  [FORGET_RUN_CHANNEL]: (controller, payload) => controller.forget(Object.assign(new ForgetRunDto(), payload)),
  [FORGET_RUNS_CHANNEL]: (controller, payload) => controller.forgetAll(Object.assign(new ForgetRunsDto(), payload)),
};
