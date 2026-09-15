import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useLookAfterCall } from "./use-look-after-call";
import { sayPiece } from "../use-live-answer";
import { RUN_CALL_RAN, RUN_CALL_RUNNING } from "../../../record";
import type { LiveCall } from "../../../../interfaces";

function aCall(patch: Partial<LiveCall> = {}): LiveCall {
  return <LiveCall>{
    id: "call-1",
    name: "browser_navigate",
    arguments: {},
    pinned: [],
    line: "",
    output: "Chromium distribution 'chrome' is not found",
    refusal: "",
    exitCode: null,
    serverId: "server-1",
    serverName: "playwright-mcp",
    isFailed: true,
    startedAt: 1,
    endedAt: 2,
    state: RUN_CALL_RAN,
    ...patch,
  };
}

describe("useLookAfterCall", () => {
  it("asks the server again once its call has ended", () => {
    // «рядок сервера бере стан після виклику» — and nothing else would ever make the catalogue ask.
    const look = vi.fn();

    renderHook(() => useLookAfterCall(look));

    act(() => sayPiece("turn-1", "", aCall()));

    expect(look).toHaveBeenCalledWith("server-1");
  });

  it("says nothing while the call is still out, because its state is not known yet", () => {
    const look = vi.fn();

    renderHook(() => useLookAfterCall(look));

    act(() =>
      sayPiece("turn-2", "", {
        ...aCall({
          state: RUN_CALL_RUNNING,
        }),
        id: "call-2",
        serverId: "server-2",
      }),
    );

    expect(look).not.toHaveBeenCalled();
  });

  it("asks once for one call, however many pieces of it arrive", () => {
    const look = vi.fn();

    renderHook(() => useLookAfterCall(look));

    act(() =>
      sayPiece("turn-3", "", {
        ...aCall(),
        id: "call-3",
        serverId: "server-3",
      }),
    );
    act(() =>
      sayPiece("turn-3", "", {
        ...aCall(),
        id: "call-3",
        serverId: "server-3",
      }),
    );

    expect(look).toHaveBeenCalledTimes(1);
  });

  it("says nothing of a command, which ended on no server at all", () => {
    const look = vi.fn();

    renderHook(() => useLookAfterCall(look));

    act(() =>
      sayPiece("turn-4", "", {
        ...aCall(),
        id: "call-4",
        serverId: null,
        serverName: "",
      }),
    );

    expect(look).not.toHaveBeenCalled();
  });

  it("says nothing of what ended before this screen stood, since the first look already had it", () => {
    act(() =>
      sayPiece("turn-5", "", {
        ...aCall(),
        id: "call-5",
        serverId: "server-5",
      }),
    );

    const look = vi.fn();

    renderHook(() => useLookAfterCall(look));

    expect(look).not.toHaveBeenCalled();
  });
});
