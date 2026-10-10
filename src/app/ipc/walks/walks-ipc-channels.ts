import {
  ConfigureWalksDto,
  GoOnInWalksDto,
  LetGoWalksDto,
  OpenWalksDto,
  PutWalkDto,
  SayWalkAgainDto,
  WalkController,
} from "../../../modules/walks";
import type { IpcChannelMap } from "../register-ipc-channels";
import {
  CONFIGURE_WALKS_CHANNEL,
  FRESH_WALKS_CHANNEL,
  GO_ON_IN_WALKS_CHANNEL,
  LET_GO_WALKS_CHANNEL,
  OPEN_WALKS_CHANNEL,
  PUT_WALK_CHANNEL,
  SAY_WALK_AGAIN_CHANNEL,
  STOP_WALKS_CHANNEL,
  WALKS_STATE_CHANNEL,
} from "../../../contracts";

/** Conversation channels; each handler rebuilds a DTO instance from the cloned payload. */
export const WALKS_IPC_CHANNELS: IpcChannelMap<WalkController> = {
  [OPEN_WALKS_CHANNEL]: (controller, payload) => controller.open(Object.assign(new OpenWalksDto(), payload)),
  [CONFIGURE_WALKS_CHANNEL]: (controller, payload) =>
    controller.configure(Object.assign(new ConfigureWalksDto(), payload)),
  [WALKS_STATE_CHANNEL]: (controller) => controller.state(),
  [PUT_WALK_CHANNEL]: (controller, payload) => controller.put(Object.assign(new PutWalkDto(), payload)),
  [STOP_WALKS_CHANNEL]: (controller) => controller.stop(),
  [SAY_WALK_AGAIN_CHANNEL]: (controller, payload) => controller.sayAgain(Object.assign(new SayWalkAgainDto(), payload)),
  [FRESH_WALKS_CHANNEL]: (controller) => controller.fresh(),
  [GO_ON_IN_WALKS_CHANNEL]: (controller, payload) => controller.goOnIn(Object.assign(new GoOnInWalksDto(), payload)),
  [LET_GO_WALKS_CHANNEL]: (controller, payload) => controller.letGo(Object.assign(new LetGoWalksDto(), payload)),
};
