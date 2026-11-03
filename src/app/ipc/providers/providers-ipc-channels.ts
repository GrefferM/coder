import {
  AskProviderDto,
  ProviderController,
  SaveProviderAddressDto,
  SaveProviderKeyDto,
  SwitchProviderDto,
} from "../../../modules/providers";
import type { IpcChannelMap } from "../register-ipc-channels";
import {
  ASK_PROVIDER_CHANNEL,
  LIST_PROVIDERS_CHANNEL,
  SAVE_PROVIDER_ADDRESS_CHANNEL,
  SAVE_PROVIDER_KEY_CHANNEL,
  SWITCH_PROVIDER_CHANNEL,
} from "../../../contracts";

/** Provider channels; a key is written through its provider and never read back. */
export const PROVIDERS_IPC_CHANNELS: IpcChannelMap<ProviderController> = {
  [LIST_PROVIDERS_CHANNEL]: (controller) => controller.list(),
  [ASK_PROVIDER_CHANNEL]: (controller, payload) => controller.ask(Object.assign(new AskProviderDto(), payload)),
  [SAVE_PROVIDER_KEY_CHANNEL]: (controller, payload) =>
    controller.saveKey(Object.assign(new SaveProviderKeyDto(), payload)),
  [SAVE_PROVIDER_ADDRESS_CHANNEL]: (controller, payload) =>
    controller.saveAddress(Object.assign(new SaveProviderAddressDto(), payload)),
  [SWITCH_PROVIDER_CHANNEL]: (controller, payload) =>
    controller.switchOff(Object.assign(new SwitchProviderDto(), payload)),
};
