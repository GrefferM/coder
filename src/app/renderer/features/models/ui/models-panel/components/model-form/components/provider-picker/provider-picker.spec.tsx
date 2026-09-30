import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ProviderPicker } from "./provider-picker";
import { PROVIDER_PICKER_LOST_NAME, PROVIDER_PICKER_LOST_NOTE, PROVIDER_PICKER_PLACEHOLDER } from "./constants";
import {
  PROVIDER_KEY_WRITTEN_LABEL,
  PROVIDER_LOCAL_LABEL,
  PROVIDER_NO_KEY_LABEL,
} from "../../../../../../../providers";
import { FIELD_SLOT_WAS_PREFIX } from "../../../../../../../../components/field-slot/constants";
import type { ProviderState } from "../../../../../../../../interfaces";

function provider(patch: Partial<ProviderState> = {}): ProviderState {
  return {
    id: "openrouter",
    name: "OpenRouter",
    kind: "remote",
    needs: ["key"],
    takesTools: true,
    customaryAddress: null,
    keyHint: "sk-…4f2",
    address: null,
    ...patch,
  };
}

const local = provider({
  id: "ollama",
  name: "Ollama",
  kind: "local",
  needs: ["address"],
  takesTools: true,
  keyHint: null,
  customaryAddress: "http://localhost:11434",
});

describe("ProviderPicker", () => {
  it("stands the chosen provider's name in the field", () => {
    render(
      <ProviderPicker
        providers={[provider(), local]}
        providerId="openrouter"
        wasProviderId={null}
        isInvalid={false}
        onChange={() => {}}
      />,
    );

    expect(screen.getByText("OpenRouter")).toBeInTheDocument();
  });

  it("says what to do where nothing is chosen yet", () => {
    render(
      <ProviderPicker
        providers={[provider()]}
        providerId=""
        wasProviderId={null}
        isInvalid={false}
        onChange={() => {}}
      />,
    );

    expect(screen.getByText(PROVIDER_PICKER_PLACEHOLDER)).toBeInTheDocument();
  });

  it("says of each provider in the list what kind it is, and whether a remote one can be reached", async () => {
    render(
      <ProviderPicker
        providers={[
          provider(),
          local,
          provider({
            id: "openai",
            name: "OpenAI",
            keyHint: null,
          }),
        ]}
        providerId="openrouter"
        wasProviderId={null}
        isInvalid={false}
        onChange={() => {}}
      />,
    );
    await userEvent.click(screen.getByText("OpenRouter"));

    expect(screen.getByText(PROVIDER_LOCAL_LABEL)).toBeInTheDocument();
    expect(
      screen.getByText(PROVIDER_KEY_WRITTEN_LABEL, {
        exact: false,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(PROVIDER_NO_KEY_LABEL, {
        exact: false,
      }),
    ).toBeInTheDocument();
  });

  it("hands back the provider that was picked, and closes on the way", async () => {
    const onChange = vi.fn();

    render(
      <ProviderPicker
        providers={[provider(), local]}
        providerId="openrouter"
        wasProviderId={null}
        isInvalid={false}
        onChange={onChange}
      />,
    );
    await userEvent.click(screen.getByText("OpenRouter"));
    await userEvent.click(screen.getByText("Ollama"));

    expect(onChange).toHaveBeenCalledWith("ollama");
  });

  it("shows the broken tie where the file names a provider nobody declared", () => {
    // A broken tie shows as on every other field, and the field stays empty.
    render(
      <ProviderPicker
        providers={[provider()]}
        providerId="gone"
        wasProviderId={null}
        isInvalid={false}
        onChange={() => {}}
      />,
    );

    expect(screen.getByText(PROVIDER_PICKER_LOST_NOTE)).toBeInTheDocument();
    expect(screen.getByText(PROVIDER_PICKER_LOST_NAME)).toBeInTheDocument();
  });

  it("says what the provider was in the display name, not in the file's own word", () => {
    // «було · OpenRouter», never «було · openrouter».
    render(
      <ProviderPicker
        providers={[provider(), local]}
        providerId="ollama"
        wasProviderId="openrouter"
        isInvalid={false}
        onChange={() => {}}
      />,
    );

    expect(screen.getByText(`${FIELD_SLOT_WAS_PREFIX}OpenRouter`)).toBeInTheDocument();
  });
});
