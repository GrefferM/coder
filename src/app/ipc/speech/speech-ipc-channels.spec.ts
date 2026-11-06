import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { HearSpeechDto, SaveSpeechDto, SpeechController } from "../../../modules/speech";
import { HEAR_SPEECH_CHANNEL, SAVE_SPEECH_CHANNEL, SPEECH_SETTINGS_CHANNEL } from "../../../contracts";
import { SPEECH_IPC_CHANNELS } from "./speech-ipc-channels";

function controllerRecording(received: unknown[]): SpeechController {
  return <SpeechController>(<unknown>{
    settings: async () => {
      received.push("settings");
    },
    save: async (payload: unknown) => {
      received.push(payload);
    },
    hear: async (payload: unknown) => {
      received.push(payload);
    },
  });
}

describe("SPEECH_IPC_CHANNELS", () => {
  it("asks for the settings with no payload at all", async () => {
    const received: unknown[] = [];

    await SPEECH_IPC_CHANNELS[SPEECH_SETTINGS_CHANNEL](controllerRecording(received), undefined);

    assert.deepEqual(received, ["settings"]);
  });

  it("rebuilds saved settings into a real DTO, so its decorators are readable", async () => {
    const received: unknown[] = [];

    await SPEECH_IPC_CHANNELS[SAVE_SPEECH_CHANNEL](controllerRecording(received), {
      voiceName: "Lesya",
    });

    assert.ok(received[0] instanceof SaveSpeechDto);
  });

  it("rebuilds a recording the same way, its bytes untouched", async () => {
    const received: unknown[] = [];
    const audio = new Uint8Array([1, 2, 3]);

    await SPEECH_IPC_CHANNELS[HEAR_SPEECH_CHANNEL](controllerRecording(received), {
      audio,
      mimeType: "audio/webm",
      providerId: "openrouter",
      model: "openai/whisper-large-v3",
    });

    assert.ok(received[0] instanceof HearSpeechDto);
    assert.equal((<HearSpeechDto>received[0]).audio, audio);
  });
});
