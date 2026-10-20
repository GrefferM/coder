import { describe, expect, it } from "vitest";
import { mendedNumber } from "./mended-number";
import type { AgentDraft } from "../interfaces";
import { aDraft } from "../../../testing";

function draft(patch: Partial<AgentDraft> = {}): AgentDraft {
  return aDraft({
    name: "ТЕЗАР",
    color: "#b18aff",
    temperature: 0.3,
    ...patch,
  });
}

describe("mendedNumber", () => {
  it("says nothing of a draft whose both numbers are written", () => {
    expect(mendedNumber(draft())).toBeNull();
  });

  it("names the first empty one in the tab's own order, which is the one the card named", () => {
    expect(
      mendedNumber(
        draft({
          maxCalls: null,
          temperature: null,
        }),
      ),
    ).toBe("maxCalls");
  });

  it("names the temperature where only it is empty", () => {
    expect(
      mendedNumber(
        draft({
          temperature: null,
        }),
      ),
    ).toBe("temperature");
  });

  it("counts a temperature of nothing as written, since zero is the end of the row the person chose", () => {
    expect(
      mendedNumber(
        draft({
          temperature: 0,
        }),
      ),
    ).toBeNull();
  });

  it("opens on the memory's numbers first, since they stand above the run's on the tab", () => {
    expect(
      mendedNumber(
        draft({
          compressTo: null,
          maxCalls: null,
        }),
      ),
    ).toBe("compressTo");
    expect(
      mendedNumber(
        draft({
          compressAt: null,
        }),
      ),
    ).toBe("compressAt");
  });

  it("leaves the memory's numbers out where the memory is off", () => {
    expect(
      mendedNumber(
        draft({
          memory: "none",
          compressAt: null,
          compressTo: null,
        }),
      ),
    ).toBeNull();
  });
});
