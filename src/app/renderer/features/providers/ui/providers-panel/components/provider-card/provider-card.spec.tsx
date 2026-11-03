import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ProviderCard } from "./provider-card";
import {
  PROVIDER_CARD_ADDRESS_PLACEHOLDER,
  PROVIDER_CARD_ANSWERED_LABEL,
  PROVIDER_CARD_SETUP_NOTES,
  PROVIDER_CARD_SILENT_LABEL,
} from "./constants";
import { MODEL_FIELD_ANSWER_CEILING, NOT_FILLED_LABEL } from "../../../../../../constants";
import {
  PROVIDER_MODELS_LAST_KNOWN_NOTE,
  PROVIDER_MODELS_MORE_PREFIX,
  PROVIDER_MODELS_REFRESH_LABEL,
  PROVIDER_MODELS_RETRY_LABEL,
  PROVIDER_MODELS_SHOWN_LIMIT,
  PROVIDER_MODELS_SHOW_ALL_LABEL,
  PROVIDER_MODELS_TAKE_UP_LABEL,
} from "./components/provider-models/constants";
import type { ProjectModel, ProviderAnswer, ProviderNeed, ProviderState } from "../../../../../../interfaces";
import { NOTHING_TYPED } from "../../../../constants";
import { aModel } from "../../../../../../testing";

const OLLAMA: ProviderState = {
  id: "ollama",
  name: "Ollama",
  kind: "local",
  needs: ["address"],
  takesTools: true,
  customaryAddress: "http://localhost:11434",
  keyHint: null,
  address: null,
};

const ANTHROPIC: ProviderState = {
  id: "anthropic",
  name: "Anthropic",
  kind: "remote",
  needs: ["key"],
  takesTools: true,
  customaryAddress: null,
  keyHint: "sk-ant-…4Kd",
  address: null,
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
};

const RUNPOD_OPENAI: ProviderState = {
  ...RUNPOD,
  id: "runpod-openai",
  name: "RunPod OpenAI",
  keyHint: "rpa_JX3…rkk",
  address: "https://api.runpod.ai/v2/k3x9q2m7f1",
};

const INSTALLED = [
  {
    name: "qwen2.5-coder",
    sizeBytes: 19_000_000_000,
  },
  {
    name: "llama3.1:8b",
    sizeBytes: 4_700_000_000,
  },
];

const DECLARED: ProjectModel[] = [
  aModel({
    id: "9a1",
    title: "qwen2.5-coder",
    provider: "ollama",
    inputPrice: 0,
    outputPrice: 0,
    contextCeiling: 200000,
  }),
];

const ANSWERED: ProviderAnswer = {
  isAnswering: true,
  models: INSTALLED,
  askedAt: new Date(2026, 7, 19, 14, 26),
};

const SILENT: ProviderAnswer = {
  isAnswering: false,
  models: INSTALLED,
  askedAt: new Date(2026, 7, 19, 14, 26),
};

function renderCard(
  provider: ProviderState,
  answer: ProviderAnswer | null = null,
  models: ProjectModel[] = [],
  acts: {
    onTakeUpModel?: () => void;
    onAsk?: () => void;
    onChange?: (need: ProviderNeed, value: string) => void;
  } = {},
) {
  return render(
    <ProviderCard
      provider={provider}
      // Nothing typed: the field shows the hint of the existing key.
      value={NOTHING_TYPED}
      models={models}
      answer={answer}
      isAsking={false}
      onAsk={acts.onAsk ?? (() => {})}
      onChange={acts.onChange ?? (() => {})}
      onCancel={() => {}}
      onSave={() => {}}
      onTakeUpModel={acts.onTakeUpModel ?? (() => {})}
    />,
  );
}

describe("ProviderCard", () => {
  it("says a local provider answered, and how many models it has installed", () => {
    renderCard(OLLAMA, ANSWERED);

    expect(screen.getByText(`${PROVIDER_CARD_ANSWERED_LABEL} · 2 моделі встановлено`)).toBeInTheDocument();
  });

  it("names every installed model and the room it takes, since the names come from the provider and are never typed", () => {
    renderCard(OLLAMA, ANSWERED);

    expect(screen.getByText("qwen2.5-coder")).toBeInTheDocument();
    expect(screen.getByText("19 GB")).toBeInTheDocument();
    expect(screen.getByText("llama3.1:8b")).toBeInTheDocument();
    expect(screen.getByText("4.7 GB")).toBeInTheDocument();
  });

  it("says a local provider that is not running does not answer, and when that was found out", () => {
    renderCard(OLLAMA, SILENT);

    expect(screen.getByText(`${PROVIDER_CARD_SILENT_LABEL} · перевірено 14:26`)).toBeInTheDocument();
  });

  it("keeps the last known list under a silent provider, since an empty one would read as nothing installed", () => {
    renderCard(OLLAMA, SILENT);

    expect(screen.getByText("qwen2.5-coder · llama3.1:8b")).toBeInTheDocument();
    expect(screen.getByText(PROVIDER_MODELS_LAST_KNOWN_NOTE)).toBeInTheDocument();
    expect(screen.getByText(PROVIDER_MODELS_RETRY_LABEL)).toBeInTheDocument();
  });

  it("asks the provider again on demand", () => {
    const onAsk = vi.fn();

    renderCard(OLLAMA, ANSWERED, [], {
      onAsk,
    });
    fireEvent.click(screen.getByText(PROVIDER_MODELS_REFRESH_LABEL));

    expect(onAsk).toHaveBeenCalled();
  });

  it("offers to take up an installed model the project has never declared, since a model is declared in one place", () => {
    const onTakeUpModel = vi.fn();

    renderCard(OLLAMA, ANSWERED, DECLARED, {
      onTakeUpModel,
    });
    fireEvent.click(screen.getByText(PROVIDER_MODELS_TAKE_UP_LABEL));

    expect(onTakeUpModel).toHaveBeenCalledWith("llama3.1:8b");
  });

  it("says what a declared model costs, a local one's nothing included, since zero is a price somebody wrote", () => {
    renderCard(OLLAMA, ANSWERED, DECLARED);

    expect(screen.getByText(/\$0\.00/)).toBeInTheDocument();
    expect(screen.queryByText(NOT_FILLED_LABEL)).not.toBeInTheDocument();
    expect(screen.getAllByText(PROVIDER_MODELS_TAKE_UP_LABEL)).toHaveLength(1);
  });

  it("names the field nobody has written in the price's place, in the words every other row uses", () => {
    // An unfinished model reads the same everywhere, without «БЕЗ ЦІНИ».
    renderCard(OLLAMA, ANSWERED, [
      {
        ...DECLARED[0],
        answerCeiling: null,
      },
    ]);

    expect(screen.getByText(`${NOT_FILLED_LABEL} · ${MODEL_FIELD_ANSWER_CEILING}`)).toBeInTheDocument();
  });

  it("shows the first few of a long list and keeps the rest one line away, since the card stands in a panel", () => {
    const many = Array.from(
      {
        length: PROVIDER_MODELS_SHOWN_LIMIT + 4,
      },
      (_unused, at) => ({
        name: `model-${at}`,
        sizeBytes: null,
      }),
    );

    renderCard(OLLAMA, {
      isAnswering: true,
      models: many,
      askedAt: new Date(2026, 7, 19, 14, 26),
    });

    expect(screen.queryByText(`model-${PROVIDER_MODELS_SHOWN_LIMIT}`)).not.toBeInTheDocument();

    fireEvent.click(screen.getByText(`${PROVIDER_MODELS_SHOW_ALL_LABEL}${PROVIDER_MODELS_MORE_PREFIX}4`));

    expect(screen.getByText(`model-${PROVIDER_MODELS_SHOWN_LIMIT}`)).toBeInTheDocument();
  });

  it("says nothing about answering for a remote provider, which is reached by key", () => {
    renderCard(ANTHROPIC);

    expect(screen.getByText("Anthropic")).toBeInTheDocument();
    expect(screen.queryByText(PROVIDER_CARD_ANSWERED_LABEL)).not.toBeInTheDocument();
    expect(screen.queryByText(PROVIDER_MODELS_REFRESH_LABEL)).not.toBeInTheDocument();
  });
});

describe("ProviderCard's key", () => {
  it("takes the key off only when the cross is pressed, and offers none where there is no key", async () => {
    // The field shows the key's hint, so leaving it alone must not lose the key.
    const onChange = vi.fn();

    renderCard(ANTHROPIC, null, [], {
      onChange,
    });

    await userEvent.click(
      screen.getByRole("button", {
        name: "Очистити",
      }),
    );

    expect(onChange).toHaveBeenCalledWith("key", "");

    renderCard({
      ...ANTHROPIC,
      keyHint: null,
    });

    // The second card has no key, so no cross; the first's is the only one.
    expect(
      screen.getAllByRole("button", {
        name: "Очистити",
      }),
    ).toHaveLength(1);
  });

  it("draws a field for each thing the provider asks for, and names which one was typed into", async () => {
    // RunPod asks for both: the person's key, and an address carrying their endpoint id.
    const onChange = vi.fn();

    renderCard(RUNPOD, null, [], {
      onChange,
    });

    const address = screen.getByLabelText("АДРЕСА");

    expect(screen.getByLabelText("КЛЮЧ")).toBeInTheDocument();
    // No customary address, so the placeholder shows an address shape, not a value to keep.
    expect(address).toHaveAttribute("placeholder", PROVIDER_CARD_ADDRESS_PLACEHOLDER);

    await userEvent.type(address, "h");

    expect(onChange).toHaveBeenCalledWith("address", "h");
  });

  it("takes a saved address off only when its cross is pressed, as it does a key", async () => {
    // The saved address stands as the placeholder, so an empty field cannot be how it is removed.
    const onChange = vi.fn();

    renderCard(RUNPOD_OPENAI, null, [], {
      onChange,
    });

    const [, addressCross] = screen.getAllByRole("button", {
      name: "Очистити",
    });

    expect(screen.getByLabelText("АДРЕСА")).toHaveAttribute("placeholder", RUNPOD_OPENAI.address);

    await userEvent.click(addressCross);

    expect(onChange).toHaveBeenCalledWith("address", "");
    expect(onChange).not.toHaveBeenCalledWith("key", "");
  });

  it("offers no cross on an address nobody has saved", () => {
    renderCard(RUNPOD);

    expect(
      screen.queryByRole("button", {
        name: "Очистити",
      }),
    ).not.toBeInTheDocument();
  });

  it("says what the endpoint itself must carry for functions, only on the provider that needs it", () => {
    const { unmount } = renderCard(RUNPOD_OPENAI);

    expect(screen.getByText(PROVIDER_CARD_SETUP_NOTES["runpod-openai"])).toBeInTheDocument();

    unmount();
    renderCard(RUNPOD);

    expect(screen.queryByText(/ENABLE_AUTO_TOOL_CHOICE/)).not.toBeInTheDocument();
  });

  it("asks a key-only provider for no address at all", () => {
    renderCard(ANTHROPIC);

    expect(screen.getByLabelText("КЛЮЧ")).toBeInTheDocument();
    expect(screen.queryByLabelText("АДРЕСА")).not.toBeInTheDocument();
  });
});
