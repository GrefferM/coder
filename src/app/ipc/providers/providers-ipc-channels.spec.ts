import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ProviderController, SaveProviderAddressDto, SaveProviderKeyDto } from "../../../modules/providers";
import { LIST_PROVIDERS_CHANNEL, SAVE_PROVIDER_ADDRESS_CHANNEL, SAVE_PROVIDER_KEY_CHANNEL } from "../../../contracts";
import { PROVIDERS_IPC_CHANNELS } from "./providers-ipc-channels";

function controllerRecording(received: unknown[]): ProviderController {
  return <ProviderController>(<unknown>{
    list: async () => {
      received.push("list");
    },
    saveKey: async (payload: unknown) => {
      received.push(payload);
    },
    saveAddress: async (payload: unknown) => {
      received.push(payload);
    },
  });
}

describe("PROVIDERS_IPC_CHANNELS", () => {
  it("asks for the list with no payload at all", async () => {
    const received: unknown[] = [];

    await PROVIDERS_IPC_CHANNELS[LIST_PROVIDERS_CHANNEL](controllerRecording(received), undefined);

    assert.deepEqual(received, ["list"]);
  });

  it("rebuilds a written key into a real DTO, so its decorators are readable", async () => {
    const received: unknown[] = [];

    await PROVIDERS_IPC_CHANNELS[SAVE_PROVIDER_KEY_CHANNEL](controllerRecording(received), {
      providerId: "anthropic",
      value: "sk-ant-api03-longvalue4Kd",
    });

    assert.ok(received[0] instanceof SaveProviderKeyDto);
  });

  it("rebuilds a written address the same way", async () => {
    const received: unknown[] = [];

    await PROVIDERS_IPC_CHANNELS[SAVE_PROVIDER_ADDRESS_CHANNEL](controllerRecording(received), {
      providerId: "ollama",
      value: "http://localhost:11434",
    });

    assert.ok(received[0] instanceof SaveProviderAddressDto);
  });
});
