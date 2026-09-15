import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useUndoOffers } from "./use-undo-offers";
import { UNDO_TICK_MS } from "./constants";
import { UNDO_STANDS_MS, DELETED_PLACE_MS } from "../../constants";
import type { TakenThings } from "../../../../../../contracts/project";

const NOTHING_TAKEN: TakenThings = {
  models: [],
  prompts: [],
  commands: [],
  servers: [],
  agents: [],
  links: [],
  promptTakenFrom: [],
  grantsTakenFrom: [],
};

function made(patch: Partial<Parameters<ReturnType<typeof useUndoOffers>["offer"]>[0]> = {}) {
  return {
    deletionId: "deletion-1",
    taken: NOTHING_TAKEN,
    message: "Агента забрано",
    place: {
      x: 100,
      y: 120,
    },
    ...patch,
  };
}

describe("useUndoOffers", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("stacks the ways back oldest first, each with its own way home", () => {
    // Two deletions one after another are two offers, and the older one is the one further up.
    vi.useFakeTimers();

    const { result } = renderHook(() => useUndoOffers());

    act(() =>
      result.current.offer(
        made({
          message: "Перше",
        }),
      ),
    );
    act(() =>
      result.current.offer(
        made({
          message: "Друге",
          deletionId: "deletion-2",
        }),
      ),
    );

    expect(result.current.offers.map((offer) => offer.message)).toEqual(["Перше", "Друге"]);
    expect(new Set(result.current.offers.map((offer) => offer.id)).size).toBe(2);
  });

  it("counts the seconds down from the whole of the way back", () => {
    vi.useFakeTimers();

    const { result } = renderHook(() => useUndoOffers());

    act(() => result.current.offer(made()));

    expect(result.current.offers[0].secondsLeft).toBe(UNDO_STANDS_MS / 1_000);

    act(() => {
      vi.advanceTimersByTime(UNDO_TICK_MS * 2);
    });

    expect(result.current.offers[0].secondsLeft).toBe(UNDO_STANDS_MS / 1_000 - 1);
  });

  it("puts the trace out long before the offer itself goes", () => {
    // The mark where the thing stood is a moment's thing; the way back stands for half a minute.
    vi.useFakeTimers();

    const { result } = renderHook(() => useUndoOffers());

    act(() => result.current.offer(made()));

    expect(result.current.offers[0].place).toEqual({
      x: 100,
      y: 120,
    });

    act(() => {
      vi.advanceTimersByTime(DELETED_PLACE_MS);
    });

    expect(result.current.offers[0].place).toBeNull();
    expect(result.current.offers).toHaveLength(1);
  });

  it("takes the offer off the stack when its time is up", () => {
    vi.useFakeTimers();

    const { result } = renderHook(() => useUndoOffers());

    act(() => result.current.offer(made()));

    act(() => {
      vi.advanceTimersByTime(UNDO_STANDS_MS);
    });

    expect(result.current.offers).toEqual([]);
  });

  it("hands the offer over and takes it off the stack, so nothing can be put back twice", () => {
    vi.useFakeTimers();

    const { result } = renderHook(() => useUndoOffers());

    act(() => result.current.offer(made()));

    const id = result.current.offers[0].id;
    let taken = null;

    act(() => {
      taken = result.current.take(id);
    });

    expect(taken).toMatchObject({
      id,
      message: "Агента забрано",
    });
    expect(result.current.offers).toEqual([]);
  });

  it("hands back nothing for an offer it does not have", () => {
    vi.useFakeTimers();

    const { result } = renderHook(() => useUndoOffers());

    expect(result.current.take("offer-gone")).toBeNull();
  });

  it("drops the offer whose deletion the history has already put back", () => {
    // The thing came back another way; the offer that named that deletion has nothing left to offer.
    vi.useFakeTimers();

    const { result } = renderHook(() => useUndoOffers());

    act(() => result.current.offer(made()));
    act(() =>
      result.current.offer(
        made({
          deletionId: "deletion-2",
          message: "Друге",
        }),
      ),
    );
    act(() => result.current.takeOfDeletion("deletion-1"));

    expect(result.current.offers.map((offer) => offer.message)).toEqual(["Друге"]);
  });
});
