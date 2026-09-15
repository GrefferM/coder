import { describe, expect, it } from "vitest";
import { withPinned, withPinnedValue, withoutPinned } from "./grant-pins";
import type { CommandToolGrant } from "../../../interfaces";

function grant(): CommandToolGrant {
  return {
    id: "grant-1",
    source: "command",
    commandId: "command-1",
    pinned: [
      {
        id: "pinned-1",
        parameterId: "parameter-1",
        value: "main",
      },
    ],
  };
}

describe("grant pins", () => {
  it("pins a parameter with nothing in it yet: the value is typed on the row afterwards", () => {
    const stood = withPinned(grant(), "parameter-2", "pinned-2");

    expect(stood.pinned).toHaveLength(2);
    expect(stood.pinned[1]).toEqual({
      id: "pinned-2",
      parameterId: "parameter-2",
      value: "",
    });
  });

  it("unpins by the pin's own id and takes its value with it", () => {
    // The model fills that parameter in itself again, so what a hand wrote there is no longer anything.
    expect(withoutPinned(grant(), "pinned-1").pinned).toEqual([]);
  });

  it("changes one pin's value and leaves the others as they stood", () => {
    const stood = withPinnedValue(withPinned(grant(), "parameter-2", "pinned-2"), "pinned-2", "release");

    expect(stood.pinned[0].value).toBe("main");
    expect(stood.pinned[1].value).toBe("release");
  });
});
