import { describe, expect, it } from "vitest";
import { copiedAgentName } from "./copied-agent-name";

describe("copiedAgentName", () => {
  it("numbers the first copy two", () => {
    expect(copiedAgentName("EDITOR", ["EDITOR"])).toBe("EDITOR 2");
  });

  it("takes the next number when the copy before it is still there", () => {
    expect(copiedAgentName("EDITOR", ["EDITOR", "EDITOR 2"])).toBe("EDITOR 3");
  });

  it("copies a copy as the next number of the same name, not as a name with two numbers", () => {
    expect(copiedAgentName("EDITOR 2", ["EDITOR", "EDITOR 2"])).toBe("EDITOR 3");
  });

  it("fills a number freed by a deletion", () => {
    expect(copiedAgentName("EDITOR", ["EDITOR", "EDITOR 3"])).toBe("EDITOR 2");
  });

  it("steps over a number another case of the same name already holds", () => {
    // What the copy makes must not be what the settings tab would then refuse.
    expect(copiedAgentName("ТЕЗАР", ["ТЕЗАР", "Тезар 2"])).toBe("ТЕЗАР 3");
  });
});
