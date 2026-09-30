import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ProviderModels } from "./provider-models";
import {
  PROVIDER_MODELS_EMPTY_NOTE,
  PROVIDER_MODELS_LABEL,
  PROVIDER_MODELS_LAST_KNOWN_NOTE,
  PROVIDER_MODELS_MORE_PREFIX,
  PROVIDER_MODELS_REFRESH_LABEL,
  PROVIDER_MODELS_RETRY_LABEL,
  PROVIDER_MODELS_SHOWN_LIMIT,
  PROVIDER_MODELS_SHOW_ALL_LABEL,
  PROVIDER_MODELS_TAKE_UP_LABEL,
} from "./constants";
import { MODEL_FIELD_INPUT_PRICE, NOT_FILLED_LABEL } from "../../../../../../../../constants";
import type { ProjectModel, ProviderInstalledModel } from "../../../../../../../../interfaces";
import { aModel } from "../../../../../../../../testing";

function installed(name: string): ProviderInstalledModel {
  return {
    name,
    sizeBytes: null,
  };
}

const declared: ProjectModel = aModel({
  title: "llama3",
  provider: "ollama",
  inputPrice: 0,
  outputPrice: 0,
  contextCeiling: 128_000,
});

describe("ProviderModels", () => {
  it("lists what the provider says it holds", () => {
    render(
      <ProviderModels
        models={[installed("llama3"), installed("qwen3")]}
        catalogue={[]}
        isAnswering
        onAsk={() => {}}
        onTakeUp={() => {}}
      />,
    );

    expect(screen.getByText(PROVIDER_MODELS_LABEL)).toBeInTheDocument();
    expect(screen.getByText("llama3")).toBeInTheDocument();
    expect(screen.getByText("qwen3")).toBeInTheDocument();
  });

  it("offers to take up an installed model the catalogue does not declare, and prices one it does", () => {
    // The machine's models and the project's declared models are two lists; the row says which.
    render(
      <ProviderModels
        models={[installed("llama3"), installed("qwen3")]}
        catalogue={[declared]}
        isAnswering
        onAsk={() => {}}
        onTakeUp={() => {}}
      />,
    );

    expect(screen.getByText(PROVIDER_MODELS_TAKE_UP_LABEL)).toBeInTheDocument();
    expect(
      screen.getByText("$0.00", {
        exact: false,
      }),
    ).toBeInTheDocument();
  });

  it("names the field unwritten in a declared model's price, and never says it is free", () => {
    render(
      <ProviderModels
        models={[installed("llama3")]}
        catalogue={[
          {
            ...declared,
            inputPrice: null,
          },
        ]}
        isAnswering
        onAsk={() => {}}
        onTakeUp={() => {}}
      />,
    );

    expect(screen.getByText(`${NOT_FILLED_LABEL} · ${MODEL_FIELD_INPUT_PRICE}`)).toBeInTheDocument();
  });

  it("hands back the name of the model taken up", async () => {
    const onTakeUp = vi.fn();

    render(
      <ProviderModels models={[installed("qwen3")]} catalogue={[]} isAnswering onAsk={() => {}} onTakeUp={onTakeUp} />,
    );
    await userEvent.click(screen.getByText(PROVIDER_MODELS_TAKE_UP_LABEL));

    expect(onTakeUp).toHaveBeenCalledWith("qwen3");
  });

  it("shows eight and counts the rest, until it is asked for all of them", async () => {
    const many = Array.from(
      {
        length: 11,
      },
      (unused, index) => installed(`model-${index}`),
    );

    render(<ProviderModels models={many} catalogue={[]} isAnswering onAsk={() => {}} onTakeUp={() => {}} />);

    expect(screen.getAllByText(PROVIDER_MODELS_TAKE_UP_LABEL)).toHaveLength(PROVIDER_MODELS_SHOWN_LIMIT);

    await userEvent.click(screen.getByText(`${PROVIDER_MODELS_SHOW_ALL_LABEL}${PROVIDER_MODELS_MORE_PREFIX}3`));

    expect(screen.getAllByText(PROVIDER_MODELS_TAKE_UP_LABEL)).toHaveLength(11);
  });

  it("says a provider that answered with nothing has nothing, which is not the same as silence", () => {
    render(<ProviderModels models={[]} catalogue={[]} isAnswering onAsk={() => {}} onTakeUp={() => {}} />);

    expect(screen.getByText(PROVIDER_MODELS_EMPTY_NOTE)).toBeInTheDocument();
  });

  it("keeps the last list a silent provider gave, saying it is the last known", () => {
    // Silence is not an empty machine: the last list stays, dimmed and marked old.
    render(
      <ProviderModels
        models={[installed("llama3")]}
        catalogue={[]}
        isAnswering={false}
        onAsk={() => {}}
        onTakeUp={() => {}}
      />,
    );

    expect(
      screen.getByText("llama3", {
        exact: false,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(PROVIDER_MODELS_LAST_KNOWN_NOTE)).toBeInTheDocument();
    expect(screen.queryByText(PROVIDER_MODELS_TAKE_UP_LABEL)).not.toBeInTheDocument();
  });

  it("offers to ask again where it is silent, and to refresh where it answers", async () => {
    const onAsk = vi.fn();
    const { rerender } = render(
      <ProviderModels models={[]} catalogue={[]} isAnswering={false} onAsk={onAsk} onTakeUp={() => {}} />,
    );

    await userEvent.click(screen.getByText(PROVIDER_MODELS_RETRY_LABEL));

    expect(onAsk).toHaveBeenCalledOnce();

    rerender(<ProviderModels models={[]} catalogue={[]} isAnswering onAsk={onAsk} onTakeUp={() => {}} />);

    expect(screen.getByText(PROVIDER_MODELS_REFRESH_LABEL)).toBeInTheDocument();
  });
});
