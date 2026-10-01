import {
  AddCallDto,
  AddHandoffDto,
  AddStepDto,
  AskAgainDto,
  AttachedDto,
  CallPlaceDto,
  CloseRunDto,
  ForgetRunDto,
  ForgetRunsDto,
  ListRunsDto,
  OpenRunDto,
  ReadRunDto,
  RunController,
  SearchRunsDto,
  SharedMemoryDto,
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
  SHARED_MEMORY_CHANNEL,
} from "../../../contracts";

/** Run-record channels; each handler rebuilds a DTO instance from the cloned payload. */
export const RUNS_IPC_CHANNELS: IpcChannelMap<RunController> = {
  [OPEN_RUN_CHANNEL]: (controller, payload) => {
    const opening = Object.assign(new OpenRunDto(), payload);

    // Attachments arrive as plain objects; each is rebuilt so its decorators are readable. A missing list stays missing,
    // for the validator to refuse.
    opening.attached = attachedOf(opening.attached);

    return controller.open(opening);
  },
  [ADD_RUN_STEP_CHANNEL]: (controller, payload) => {
    const step = Object.assign(new AddStepDto(), payload);

    // Calls arrive as plain objects; each is rebuilt so its decorators are readable.
    step.calls = (step.calls ?? []).map((call) => Object.assign(new AddCallDto(), call));
    step.handoffs = (step.handoffs ?? []).map((handoff) => Object.assign(new AddHandoffDto(), handoff));

    return controller.step(step);
  },
  [ASK_AGAIN_CHANNEL]: (controller, payload) => {
    const asking = Object.assign(new AskAgainDto(), payload);

    asking.attached = attachedOf(asking.attached);

    return controller.askAgain(asking);
  },
  [CLOSE_RUN_CHANNEL]: (controller, payload) => controller.close(Object.assign(new CloseRunDto(), payload)),
  [LIST_RUNS_CHANNEL]: (controller, payload) => controller.list(Object.assign(new ListRunsDto(), payload)),
  [READ_RUN_CHANNEL]: (controller, payload) => controller.one(Object.assign(new ReadRunDto(), payload)),
  [SHARED_MEMORY_CHANNEL]: (controller, payload) =>
    controller.sharedMemory(Object.assign(new SharedMemoryDto(), payload)),
  [CALL_PLACE_CHANNEL]: (controller, payload) => controller.placeOfCall(Object.assign(new CallPlaceDto(), payload)),
  [SEARCH_RUNS_CHANNEL]: (controller, payload) => controller.find(Object.assign(new SearchRunsDto(), payload)),
  [FORGET_RUN_CHANNEL]: (controller, payload) => controller.forget(Object.assign(new ForgetRunDto(), payload)),
  [FORGET_RUNS_CHANNEL]: (controller, payload) => controller.forgetAll(Object.assign(new ForgetRunsDto(), payload)),
};

/** A question's attachments rebuilt as DTOs; anything but a list is handed on as it came. */
function attachedOf(attached: AttachedDto[]): AttachedDto[] {
  return Array.isArray(attached) ? attached.map((one) => Object.assign(new AttachedDto(), one)) : attached;
}
