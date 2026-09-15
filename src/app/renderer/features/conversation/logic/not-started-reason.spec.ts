import { describe, expect, it } from "vitest";
import { notStartedReason } from "./not-started-reason";
import { LLM_NO_ADDRESS, LLM_NO_KEY, LLM_PROVIDER_NOT_BUILT, LLM_PROVIDER_SILENT, MACHINE_WALLS } from "../constants";

describe("notStartedReason", () => {
  it("finds each of the four walls inside the sentence Electron wraps around it", () => {
    expect(notStartedReason(`Error invoking remote method: ${LLM_NO_KEY}`)).toBe("noKey");
    expect(notStartedReason(`Error invoking remote method: ${LLM_NO_ADDRESS}`)).toBe("noAddress");
    expect(notStartedReason(`Error invoking remote method: ${LLM_PROVIDER_SILENT}`)).toBe("silent");
    expect(notStartedReason(`Error invoking remote method: ${LLM_PROVIDER_NOT_BUILT}`)).toBe("noProvider");
  });

  it("says nothing for a turn that was tried and fell, which is not a wall at all", () => {
    // These are turns that never began; a provider's own fault is an answer, not a refusal.
    expect(notStartedReason("LLM_ASK_FAILED")).toBeNull();
    expect(notStartedReason("")).toBeNull();
  });

  it("finds every code the table names, and gives each its own wall", () => {
    // The table is the one place a refusal code and a wall are tied together, so nothing may share a row's
    // wall with another or sit in it unreachable.
    const walls = Object.entries(MACHINE_WALLS).map(([code, wall]) => {
      expect(notStartedReason(`Error invoking remote method: ${code}`)).toBe(wall);

      return wall;
    });

    expect(new Set(walls).size).toBe(walls.length);
  });
});
