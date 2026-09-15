import {
  AddCallDto,
  AddHandoffDto,
  AddStepDto,
  AskAgainDto,
  CallPlaceDto,
  CloseRunDto,
  ForgetRunDto,
  ForgetRunsDto,
  ListRunsDto,
  OpenRunDto,
  ReadRunDto,
  RunController,
  SearchRunsDto,
} from "../../../modules/runs";
import type { IpcChannelMap } from "../register-ipc-channels";
import {
  ADD_RUN_STEP_CHANNEL,
  ASK_AGAIN_CHANNEL,
  CLOSE_RUN_CHANNEL,
  FORGET_RUN_CHANNEL,
  FORGET_RUNS_CHANNEL,
  LIST_RUNS_CHANNEL,
  OPEN_RUN_CHANNEL,
  CALL_PLACE_CHANNEL,
  READ_RUN_CHANNEL,
  SEARCH_RUNS_CHANNEL,
} from "../../../contracts";

/** Run-record channels; each handler rebuilds a real DTO instance from the cloned payload. */
export const RUNS_IPC_CHANNELS: IpcChannelMap<RunController> = {
  [OPEN_RUN_CHANNEL]: (controller, payload) => controller.open(Object.assign(new OpenRunDto(), payload)),
  [ADD_RUN_STEP_CHANNEL]: (controller, payload) => {
    const step = Object.assign(new AddStepDto(), payload);

    // The calls come cloned as plain objects; each is rebuilt so its own decorators are readable.
    step.calls = (step.calls ?? []).map((call) => Object.assign(new AddCallDto(), call));
    step.handoffs = (step.handoffs ?? []).map((handoff) => Object.assign(new AddHandoffDto(), handoff));

    return controller.step(step);
  },
  [ASK_AGAIN_CHANNEL]: (controller, payload) => controller.askAgain(Object.assign(new AskAgainDto(), payload)),
  [CLOSE_RUN_CHANNEL]: (controller, payload) => controller.close(Object.assign(new CloseRunDto(), payload)),
  [LIST_RUNS_CHANNEL]: (controller, payload) => controller.list(Object.assign(new ListRunsDto(), payload)),
  [READ_RUN_CHANNEL]: (controller, payload) => controller.one(Object.assign(new ReadRunDto(), payload)),
  [CALL_PLACE_CHANNEL]: (controller, payload) => controller.placeOfCall(Object.assign(new CallPlaceDto(), payload)),
  [SEARCH_RUNS_CHANNEL]: (controller, payload) => controller.find(Object.assign(new SearchRunsDto(), payload)),
  [FORGET_RUN_CHANNEL]: (controller, payload) => controller.forget(Object.assign(new ForgetRunDto(), payload)),
  [FORGET_RUNS_CHANNEL]: (controller, payload) => controller.forgetAll(Object.assign(new ForgetRunsDto(), payload)),
};
