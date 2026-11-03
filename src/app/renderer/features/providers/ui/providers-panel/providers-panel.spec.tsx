import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ProvidersPanel } from "./providers-panel";
import { PROVIDERS_OFF_LABEL, PROVIDERS_UNSET_LABEL } from "./constants";
import type { Agent, ProjectModel, ProviderAnswer, ProviderState } from "../../../../interfaces";
import { aModel, anAgent } from "../../../../testing";

const MODELS: ProjectModel[] = [
  aModel({
    title: "claude-sonnet-4.5",
    provider: "anthropic",
    contextCeiling: 200000,
  }),
  aModel({
    id: "model-2",
    title: "claude-haiku-4.5",
    provider: "anthropic",
    inputPrice: 1,
    outputPrice: 5,
    contextCeiling: 200000,
  }),
];

const AGENTS: Agent[] = [
  anAgent({
    name: "EDITOR",
    color: "#38a3ff",
    x: 0,
    y: 0,
    maxCalls: 10,
    temperature: 0.3,
  }),
];

const ANTHROPIC: ProviderState = {
  id: "anthropic",
  name: "Anthropic",
  kind: "remote",
  needs: ["key"],
  takesTools: true,
  customaryAddress: null,
  keyHint: null,
  address: null,
  isOff: false,
};

const OPENAI: ProviderState = {
  id: "openai",
  name: "OpenAI",
  kind: "remote",
  needs: ["key"],
  takesTools: true,
  customaryAddress: null,
  keyHint: null,
  address: null,
  isOff: false,
};

const RUNPOD: ProviderState = {
  id: "runpod",
  name: "RunPod",
  kind: "remote",
  needs: ["key", "address"],
  takesTools: true,
  customaryAddress: null,
  keyHint: null,
  address: null,
  isOff: false,
};

const OLLAMA: ProviderState = {
  id: "ollama",
  name: "Ollama",
  kind: "local",
  needs: ["address"],
  takesTools: true,
  customaryAddress: "http://localhost:11434",
  keyHint: null,
  address: null,
  isOff: false,
};

const ANSWERED: Record<string, ProviderAnswer> = {
  ollama: {
    isAnswering: true,
    models: [
      {
        name: "qwen2.5-coder:0.5b",
        sizeBytes: 398_000_000,
      },
    ],
    askedAt: new Date(2026, 7, 19, 14, 26),
  },
};

function renderPanel(
  providers: ProviderState[],
  models: ProjectModel[] = MODELS,
  agents: Agent[] = AGENTS,
  answers: Record<string, ProviderAnswer> = ANSWERED,
) {
  const onSave = vi.fn().mockResolvedValue(undefined);

  render(
    <ProvidersPanel
      providers={providers}
      answers={answers}
      askingIds={[]}
      models={models}
      agents={agents}
      onAsk={() => {}}
      onSave={onSave}
      onSwitch={async () => {}}
      onTakeUpModel={() => {}}
    />,
  );

  return onSave;
}

describe("ProvidersPanel", () => {
  it("stands the whole list the machine hands it, whatever the project uses", () => {
    renderPanel([ANTHROPIC, OLLAMA], [], []);

    expect(screen.getByText("Anthropic")).toBeInTheDocument();
    expect(screen.getByText("Ollama")).toBeInTheDocument();
  });

  it("says the kind and what is missing, and counts only what the project actually has", () => {
    renderPanel([ANTHROPIC, OLLAMA]);

    expect(screen.getByText("ВІДДАЛЕНИЙ · КЛЮЧА НЕМАЄ · 2 МОДЕЛІ · 1 АГЕНТ")).toBeInTheDocument();
    // A local provider's row shows whether anything answers at its address.
    expect(screen.getByText("ВІДПОВІДАЄ")).toBeInTheDocument();
  });

  it("says a local provider is silent rather than unfilled, since its address was there from the start", () => {
    renderPanel([OLLAMA], [], [], {
      ollama: {
        isAnswering: false,
        models: [],
        askedAt: new Date(2026, 7, 19, 14, 26),
      },
    });

    expect(screen.getByText("НЕ ВІДПОВІДАЄ")).toBeInTheDocument();
    expect(screen.queryByText(PROVIDERS_UNSET_LABEL)).not.toBeInTheDocument();
  });

  it("writes a key through the machine, and never asks for one back", async () => {
    const user = userEvent.setup();
    const onSave = renderPanel([ANTHROPIC]);

    await user.click(screen.getByLabelText(/Відкрити провайдера Anthropic/));
    await user.type(screen.getByLabelText("КЛЮЧ"), "sk-ant-api03-longvalue4Kd");
    await user.click(screen.getByText("Зберегти"));

    expect(onSave).toHaveBeenCalledWith(ANTHROPIC, {
      key: "sk-ant-api03-longvalue4Kd",
      address: null,
    });
  });

  it("asks a local provider for an address instead, offering the one it usually answers at", async () => {
    const user = userEvent.setup();
    const onSave = renderPanel([OLLAMA], [], []);

    await user.click(screen.getByLabelText(/Відкрити провайдера Ollama/));

    const address = screen.getByLabelText("АДРЕСА");

    expect(screen.queryByLabelText("КЛЮЧ")).not.toBeInTheDocument();
    expect(address).toHaveAttribute("placeholder", "http://localhost:11434");

    await user.type(address, "http://10.0.0.4:11434");
    await user.click(screen.getByText("Зберегти"));

    expect(onSave).toHaveBeenCalledWith(OLLAMA, {
      key: null,
      address: "http://10.0.0.4:11434",
    });
  });

  it("stands what is written first, apart from what nobody has touched", () => {
    renderPanel([
      {
        ...ANTHROPIC,
        keyHint: "sk-ant-••••••••••••4Kd",
      },
      OPENAI,
    ]);

    expect(screen.getByText("КЛЮЧ ВПИСАНО · 2 МОДЕЛІ · 1 АГЕНТ")).toBeInTheDocument();
    expect(screen.getByText(PROVIDERS_UNSET_LABEL)).toBeInTheDocument();
  });

  it("leaves a key nobody touched alone, whatever else the card was opened for", async () => {
    // The field shows the key's hint, not the key, so an untouched save must not lose it.
    const user = userEvent.setup();
    const written = {
      ...ANTHROPIC,
      keyHint: "sk-ant-••••••••••••4Kd",
    };
    const onSave = renderPanel([written, OPENAI]);

    await user.click(screen.getByLabelText(/Відкрити провайдера Anthropic/));
    await user.click(screen.getByText("Зберегти"));

    expect(onSave).not.toHaveBeenCalled();
  });

  it("takes the key away when the cross emptied the field, and not before", async () => {
    const user = userEvent.setup();
    const written = {
      ...ANTHROPIC,
      keyHint: "sk-ant-••••••••••••4Kd",
    };
    const onSave = renderPanel([written, OPENAI]);

    await user.click(screen.getByLabelText(/Відкрити провайдера Anthropic/));
    await user.click(
      screen.getByRole("button", {
        name: "Очистити",
      }),
    );
    await user.click(screen.getByText("Зберегти"));

    expect(onSave).toHaveBeenCalledWith(written, {
      key: "",
      address: null,
    });
  });

  it("says both things missing where a provider asks for both, and the address alone once the key is in", () => {
    renderPanel([RUNPOD], [], []);

    expect(screen.getByText("ВІДДАЛЕНИЙ · КЛЮЧА НЕМАЄ · АДРЕСИ НЕМАЄ")).toBeInTheDocument();
  });

  it("asks a provider that needs both for both at once, and writes each where it belongs", async () => {
    // RunPod's endpoint id lives in the address, so the key alone is not enough.
    const user = userEvent.setup();
    const onSave = renderPanel([RUNPOD], [], []);

    await user.click(screen.getByLabelText(/Відкрити провайдера RunPod/));
    await user.type(screen.getByLabelText("КЛЮЧ"), "rpa_longvalue4Kd");
    await user.type(screen.getByLabelText("АДРЕСА"), "https://api.runpod.ai/v2/q7w2e9r4t6y1u3/openai/v1");
    await user.click(screen.getByText("Зберегти"));

    expect(onSave).toHaveBeenCalledWith(RUNPOD, {
      key: "rpa_longvalue4Kd",
      address: "https://api.runpod.ai/v2/q7w2e9r4t6y1u3/openai/v1",
    });
  });

  it("leaves the field nobody touched alone, whichever of the two it is", async () => {
    const user = userEvent.setup();
    const written = {
      ...RUNPOD,
      keyHint: "rpa_lon•••",
    };
    const onSave = renderPanel([written], [], []);

    await user.click(screen.getByLabelText(/Відкрити провайдера RunPod/));
    await user.type(screen.getByLabelText("АДРЕСА"), "https://api.runpod.ai/v2/q7w2e9r4t6y1u3/openai/v1");
    await user.click(screen.getByText("Зберегти"));

    expect(onSave).toHaveBeenCalledWith(written, {
      key: null,
      address: "https://api.runpod.ai/v2/q7w2e9r4t6y1u3/openai/v1",
    });
  });

  describe("providers turned off on this machine", () => {
    /** The names of the rows and the group words, top to bottom. */
    function order(): string[] {
      return screen
        .getAllByText(/^(Anthropic|OpenAI|Ollama|НЕ НАЛАШТОВАНІ|ВИМКНЕНІ)$/)
        .map((element) => element.textContent ?? "");
    }

    it("stands them last, under their own word, after the unset ones", () => {
      renderPanel([
        {
          ...ANTHROPIC,
          keyHint: "sk-ant-••••••••••••4Kd",
        },
        OPENAI,
        {
          ...OLLAMA,
          isOff: true,
        },
      ]);

      expect(order()).toEqual(["Anthropic", PROVIDERS_UNSET_LABEL, "OpenAI", PROVIDERS_OFF_LABEL, "Ollama"]);
    });

    it("stands one off among them even while it lacks its key, and says off before its counts", () => {
      renderPanel([
        {
          ...ANTHROPIC,
          isOff: true,
        },
        OLLAMA,
      ]);

      expect(order()).toEqual(["Ollama", PROVIDERS_OFF_LABEL, "Anthropic"]);
      expect(screen.getByText("ВИМКНЕНО · 2 МОДЕЛІ · 1 АГЕНТ")).toBeInTheDocument();
      expect(screen.queryByText(PROVIDERS_UNSET_LABEL)).not.toBeInTheDocument();
    });

    it("draws no such group while none is off", () => {
      renderPanel([ANTHROPIC, OPENAI, OLLAMA]);

      expect(screen.queryByText(PROVIDERS_OFF_LABEL)).not.toBeInTheDocument();
    });

    it("never says an off local provider is silent, whatever it last answered", () => {
      renderPanel(
        [
          {
            ...OLLAMA,
            isOff: true,
          },
        ],
        [],
        [],
        {
          ollama: {
            isAnswering: false,
            models: [],
            askedAt: new Date(2026, 7, 19, 14, 26),
          },
        },
      );

      expect(screen.getByText("ВИМКНЕНО")).toBeInTheDocument();
      expect(screen.queryByText("НЕ ВІДПОВІДАЄ")).not.toBeInTheDocument();
    });

    it("turns a provider off from its card at once, with nothing saved, and keeps the card open", async () => {
      const user = userEvent.setup();
      const onSave = vi.fn().mockResolvedValue(undefined);
      const onSwitch = vi.fn().mockResolvedValue(undefined);

      render(
        <ProvidersPanel
          providers={[ANTHROPIC]}
          answers={{}}
          askingIds={[]}
          models={MODELS}
          agents={AGENTS}
          onAsk={() => {}}
          onSave={onSave}
          onSwitch={onSwitch}
          onTakeUpModel={() => {}}
        />,
      );

      await user.click(screen.getByLabelText(/Відкрити провайдера Anthropic/));
      await user.click(screen.getByText("Вимкнути"));

      expect(onSwitch).toHaveBeenCalledWith(ANTHROPIC, true);
      expect(onSave).not.toHaveBeenCalled();
      expect(screen.getByLabelText("КЛЮЧ")).toBeInTheDocument();
    });
  });
});
