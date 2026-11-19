import { describe, expect, it } from "vitest";
import { hearingChoice } from "./hearing-choice";
import { aConfig, aModel } from "../../../testing";
import { MAC_HEARING_ID } from "../../../../../contracts";
import { NOTHING_CHOSEN } from "../constants";
import type { ProviderState } from "../../../interfaces";

const OPENROUTER: ProviderState = {
  id: "openrouter",
  name: "OpenRouter",
  kind: "remote",
  needs: ["key"],
  takesTools: true,
  customaryAddress: null,
  keyHint: "sk-or",
  address: null,
  isOff: false,
};

const WHISPER = aModel({
  id: "model-whisper",
  title: "openai/whisper-large-v3",
  kind: "listen",
  provider: "openrouter",
});

describe("hearingChoice", () => {
  it("hands over the chosen recognition model by its provider and name", () => {
    expect(
      hearingChoice(
        aConfig({
          models: [WHISPER],
          speech: {
            listenModelId: "model-whisper",
          },
        }),
        [OPENROUTER],
        NOTHING_CHOSEN,
      ),
    ).toEqual({
      providerId: "openrouter",
      providerName: "OpenRouter",
      model: "openai/whisper-large-v3",
    });
  });

  it("stands on nothing while no model is chosen", () => {
    expect(
      hearingChoice(
        aConfig({
          models: [WHISPER],
        }),
        [OPENROUTER],
        NOTHING_CHOSEN,
      ),
    ).toBeNull();
  });

  it("stands on nothing where the chosen model is gone, or is a text model", () => {
    expect(
      hearingChoice(
        aConfig({
          models: [],
          speech: {
            listenModelId: "model-whisper",
          },
        }),
        [OPENROUTER],
        NOTHING_CHOSEN,
      ),
    ).toBeNull();
    expect(
      hearingChoice(
        aConfig({
          models: [
            {
              ...WHISPER,
              kind: "text",
            },
          ],
          speech: {
            listenModelId: "model-whisper",
          },
        }),
        [OPENROUTER],
        NOTHING_CHOSEN,
      ),
    ).toBeNull();
  });

  it("hands over macOS in its language where this machine chose it, over the project's model", () => {
    expect(
      hearingChoice(
        aConfig({
          models: [WHISPER],
          speech: {
            listenModelId: "model-whisper",
          },
        }),
        [OPENROUTER],
        {
          ...NOTHING_CHOSEN,
          isMacHearing: true,
          macLocale: "en-GB",
        },
      ),
    ).toEqual({
      providerId: MAC_HEARING_ID,
      providerName: "macOS",
      model: "en-GB",
    });
  });

  it("stands on nothing while macOS has no language chosen", () => {
    expect(
      hearingChoice(aConfig(), [OPENROUTER], {
        ...NOTHING_CHOSEN,
        isMacHearing: true,
      }),
    ).toBeNull();
  });
});
