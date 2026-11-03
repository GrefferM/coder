import { describe, expect, it } from "vitest";
import { lostProvider } from "./lost-provider";
import type { ProjectModel, ProviderState } from "../../../interfaces";
import { aModel } from "../../../testing";

const MODELS: ProjectModel[] = [
  aModel({
    title: "qwen2.5-coder",
    provider: "ollama-old",
    inputPrice: 0,
    outputPrice: 0,
    contextCeiling: 4096,
  }),
];

const PROVIDERS: ProviderState[] = [
  {
    id: "ollama",
    name: "Ollama",
    kind: "local",
    needs: ["address"],
    takesTools: true,
    address: "http://localhost:11434",
    keyHint: null,
    customaryAddress: "http://localhost:11434",
    isOff: false,
  },
];

describe("lostProvider", () => {
  it("names the provider the model stands on where nobody declared it", () => {
    expect(lostProvider("model-1", MODELS, PROVIDERS)).toBe("ollama-old");
  });

  it("says nothing where the provider is declared", () => {
    expect(
      lostProvider("model-1", MODELS, [
        ...PROVIDERS,
        {
          ...PROVIDERS[0],
          id: "ollama-old",
        },
      ]),
    ).toBeNull();
  });

  it("says nothing where the model itself is gone, since that is the other trouble", () => {
    expect(lostProvider("model-gone", MODELS, PROVIDERS)).toBeNull();
  });
});
