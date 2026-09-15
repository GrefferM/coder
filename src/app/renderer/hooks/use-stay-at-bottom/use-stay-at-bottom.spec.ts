import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { useStayAtBottom } from "./use-stay-at-bottom";
import { STAY_AT_BOTTOM_REACH_PX } from "./constants";

const HEIGHT = 200;
let full = 1_000;

/** A box tall enough to scroll: the page cannot lay out in jsdom, so its measurements are given. */
function box(): HTMLDivElement {
  const node = document.createElement("div");

  Object.defineProperty(node, "scrollHeight", {
    get: () => full,
  });
  Object.defineProperty(node, "clientHeight", {
    get: () => HEIGHT,
  });
  document.body.append(node);

  return node;
}

/**
 * jsdom lays nothing out, so nothing in it ever resizes on its own. This stands in for the watcher and hands the
 * test the say — the box shrinking is what happens when the field under the stream is pulled taller.
 */
function whenResized(): () => void {
  const told: (() => void)[] = [];

  globalThis.ResizeObserver = <typeof ResizeObserver>(<unknown>class {
    constructor(said: () => void) {
      told.push(said);
    }

    observe(): void {}

    unobserve(): void {}

    disconnect(): void {}
  });

  return () => {
    for (const said of told) {
      said();
    }
  };
}

/** Waits for the MutationObserver, which reports after the current task. */
async function settled(): Promise<void> {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

describe("useStayAtBottom", () => {
  beforeEach(() => {
    full = 1_000;
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("opens at the end, because a stream is read from its end", () => {
    const node = box();

    renderHook(() => {
      const kept = useStayAtBottom<HTMLDivElement>("Шукач");

      kept.box.current = node;

      return kept;
    });

    expect(node.scrollTop).toBe(1_000);
  });

  it("follows what grows at the end while the person stands there", async () => {
    const node = box();

    renderHook(() => {
      const kept = useStayAtBottom<HTMLDivElement>("Шукач");

      kept.box.current = node;

      return kept;
    });

    full = 1_600;
    node.append(document.createElement("span"));
    await settled();

    expect(node.scrollTop).toBe(1_600);
  });

  it("keeps whoever stood at the end there when the box itself shrinks under them", () => {
    // The field under the stream is pulled taller and nothing in the stream changes — so nothing else would notice.
    const resize = whenResized();
    const node = box();

    renderHook(() => {
      const kept = useStayAtBottom<HTMLDivElement>("Шукач");

      kept.box.current = node;

      return kept;
    });

    node.scrollTop = 100;

    act(() => resize());

    expect(node.scrollTop).toBe(1_000);
  });

  it("leaves the person where they scrolled to, since scrolling up is their own act", async () => {
    const node = box();

    renderHook(() => {
      const kept = useStayAtBottom<HTMLDivElement>("Шукач");

      kept.box.current = node;

      return kept;
    });

    node.scrollTop = 100;
    node.dispatchEvent(new Event("scroll"));
    full = 1_600;
    node.append(document.createElement("span"));
    await settled();

    expect(node.scrollTop).toBe(100);
  });

  it("says whether the end is in view, which is the one thing the button down turns on", async () => {
    const node = box();

    const { result } = renderHook(() => {
      const kept = useStayAtBottom<HTMLDivElement>("Шукач");

      kept.box.current = node;

      return kept;
    });

    expect(result.current.isAtEnd).toBe(true);

    node.scrollTop = 100;
    node.dispatchEvent(new Event("scroll"));
    await settled();

    // The button is there exactly while the end is out of view.
    expect(result.current.isAtEnd).toBe(false);
  });

  it("takes the box to its end when asked, which is the button's one act", async () => {
    const node = box();

    const { result } = renderHook(() => {
      const kept = useStayAtBottom<HTMLDivElement>("Шукач");

      kept.box.current = node;

      return kept;
    });

    node.scrollTop = 100;
    node.dispatchEvent(new Event("scroll"));
    await settled();

    act(() => result.current.goToEnd());

    expect(node.scrollTop).toBe(1_000);
  });

  it("counts a couple of pixels short of the end as the end", async () => {
    const node = box();

    renderHook(() => {
      const kept = useStayAtBottom<HTMLDivElement>("Шукач");

      kept.box.current = node;

      return kept;
    });

    node.scrollTop = 1_000 - HEIGHT - STAY_AT_BOTTOM_REACH_PX;
    node.dispatchEvent(new Event("scroll"));
    full = 1_600;
    node.append(document.createElement("span"));
    await settled();

    expect(node.scrollTop).toBe(1_600);
  });

  it("lets the end go when asked, so a ride to a place higher up is not pulled back to it", async () => {
    const node = box();

    const { result } = renderHook(() => {
      const kept = useStayAtBottom<HTMLDivElement>("Шукач");

      kept.box.current = node;

      return kept;
    });

    act(() => result.current.stopFollowing());
    expect(result.current.isAtEnd).toBe(false);

    node.scrollTop = 400;
    full = 1_600;
    node.append(document.createElement("span"));
    await settled();

    // The search rode here, and what grows at the end must not drag the reader back to it.
    expect(node.scrollTop).toBe(400);
  });

  it("holds its two acts still between renders, so an effect that rides does not ride again on every render", () => {
    const node = box();

    const { result, rerender } = renderHook(() => {
      const kept = useStayAtBottom<HTMLDivElement>("Шукач");

      kept.box.current = node;

      return kept;
    });

    const first = result.current;

    rerender();

    // A fresh function each render pinned the stream to the match — the person could not scroll
    // away from it at all until the word was taken out.
    expect(result.current.stopFollowing).toBe(first.stopFollowing);
    expect(result.current.goToEnd).toBe(first.goToEnd);
  });
});
