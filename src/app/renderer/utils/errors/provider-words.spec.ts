import { describe, expect, it } from "vitest";
import { providerWords } from "./provider-words";

describe("providerWords", () => {
  it("peels the bridge's own wrapper off a fault it carried over", () => {
    expect(providerWords("Error invoking remote method 'llm:ask': Error: 404 page not found")).toBe(
      "404 page not found",
    );
  });

  it("leaves a sentence that came whole alone", () => {
    expect(providerWords("socket hang up")).toBe("socket hang up");
  });

  it("keeps the words of a provider that names itself, cutting only what the transport added", () => {
    expect(providerWords("Error invoking remote method 'llm:ask': Error: RunPod 401 · Unauthorized")).toBe(
      "RunPod 401 · Unauthorized",
    );
  });
});
