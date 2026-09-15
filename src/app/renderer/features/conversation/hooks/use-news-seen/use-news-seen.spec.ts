import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useNewsSeen } from "./use-news-seen";

/** The hook as the chat holds it: what waits elsewhere, and what waits in the stream on screen. */
function seen(elsewhere: string[] = [], onScreen: string[] = []) {
  return renderHook(({ away, here }: { away: string[]; here: string[] }) => useNewsSeen(away, here), {
    initialProps: {
      away: elsewhere,
      here: onScreen,
    },
  });
}

describe("useNewsSeen · what the person has been shown", () => {
  it("says there is nothing when nothing waits", () => {
    const { result } = seen();

    expect(result.current.isNewsElsewhere).toBe(false);
  });

  it("says there is news when a word waits in a conversation that is not on screen", () => {
    const { result } = seen(["one"]);

    expect(result.current.isNewsElsewhere).toBe(true);
  });

  it("makes no news of a word the person was already reading on screen", () => {
    const { result, rerender } = seen([], ["one"]);

    rerender({
      away: ["one"],
      here: [],
    });

    expect(result.current.isNewsElsewhere).toBe(false);
  });

  it("has no more news once the history was opened", () => {
    const { result } = seen(["one"]);

    act(() => result.current.readNews());

    expect(result.current.isNewsElsewhere).toBe(false);
  });

  it("says there is news again when another word starts waiting after that", () => {
    const { result, rerender } = seen(["one"]);

    act(() => result.current.readNews());
    rerender({
      away: ["one", "two"],
      here: [],
    });

    expect(result.current.isNewsElsewhere).toBe(true);
  });
});
