import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SpeechSection } from "./speech-section";
import { NOT_FILLED_LABEL } from "../../../../constants";
import {
  HEARING_LOST_NAME,
  HEARING_NONE_ACT,
  HEARING_NONE_NOTE,
  VOICE_LISTEN_LABEL,
  VOICE_MACHINE_NOTE,
} from "../../constants";
import { aModel } from "../../../../testing";
import type { ProviderState } from "../../../../interfaces";
import type { SpeechSectionProps } from "./interfaces";

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

const SONNET = aModel({
  id: "model-sonnet",
  title: "claude-sonnet-4.5",
  kind: "text",
  provider: "anthropic",
});

function props(patch: Partial<SpeechSectionProps> = {}): SpeechSectionProps {
  return {
    models: [SONNET, WHISPER],
    listenModelId: null,
    providers: [OPENROUTER],
    speech: {
      settings: {
        voiceName: null,
      },
      voices: [
        {
          name: "Lesya",
          lang: "uk-UA",
        },
      ],
      save: vi.fn(async () => {}),
    },
    onChooseListenModel: vi.fn(),
    onOpenModels: vi.fn(),
    onListen: vi.fn(),
    ...patch,
  };
}

describe("SpeechSection", () => {
  it("offers only the recognition models, and writes the one chosen by its id", async () => {
    const shown = props();

    render(<SpeechSection {...shown} />);

    await userEvent.click(screen.getAllByText(NOT_FILLED_LABEL)[0]);

    expect(screen.queryByText("claude-sonnet-4.5")).not.toBeInTheDocument();

    await userEvent.click(screen.getByText("openai/whisper-large-v3"));

    expect(shown.onChooseListenModel).toHaveBeenCalledWith("model-whisper");
  });

  it("names the chosen model and its provider", () => {
    render(
      <SpeechSection
        {...props({
          listenModelId: "model-whisper",
        })}
      />,
    );

    expect(screen.getByText("openai/whisper-large-v3")).toBeInTheDocument();
    expect(screen.getByText("OpenRouter")).toBeInTheDocument();
  });

  it("says there is nothing to choose from, and leads to the models", async () => {
    const shown = props({
      models: [SONNET],
    });

    render(<SpeechSection {...shown} />);

    expect(screen.getByText(HEARING_NONE_NOTE)).toBeInTheDocument();

    await userEvent.click(screen.getByText(HEARING_NONE_ACT));

    expect(shown.onOpenModels).toHaveBeenCalledTimes(1);
  });

  it("says a chosen model the catalogue no longer holds is a broken tie", () => {
    render(
      <SpeechSection
        {...props({
          listenModelId: "model-gone",
        })}
      />,
    );

    expect(screen.getByText(HEARING_LOST_NAME)).toBeInTheDocument();
  });

  it("marks the voice as this machine's, writes it at once and lets it be heard", async () => {
    const shown = props({
      speech: {
        ...props().speech,
        settings: {
          voiceName: "Lesya",
        },
      },
    });

    render(<SpeechSection {...shown} />);

    expect(screen.getByText(VOICE_MACHINE_NOTE)).toBeInTheDocument();
    expect(screen.getByText("Lesya · uk-UA")).toBeInTheDocument();

    await userEvent.click(screen.getByText(VOICE_LISTEN_LABEL));

    expect(shown.onListen).toHaveBeenCalledTimes(1);
  });
});
