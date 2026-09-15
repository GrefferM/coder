import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useShownStream } from "./use-shown-stream";
import {
  FORGET_RUN_CHANNEL,
  FORGET_RUNS_CHANNEL,
  LIST_RUNS_CHANNEL,
  READ_RUN_CHANNEL,
} from "../../../../../../contracts";
import { RUN_DONE } from "../../../../features/record";
import type { AgentChatState } from "../../../../features/conversation";
import type { RunRow } from "../../../../features/record";
import { standInBridge } from "../../../../testing";

const DIRECTORY = "/code/coder";
const AT = new Date(2026, 8, 4, 14, 0);

/** The page's own hand on the selection; the stream only asks it to move. */
const select = vi.fn();

function row(id: string, endedAt: Date | null): RunRow {
  return {
    id,
    startedByAgentId: "agent-1",
    startedByAgentName: "Шукач",
    startedByAgentColor: "#6fd3d8",
    askedAgentId: "agent-1",
    askedAgentName: "Шукач",
    asked: "Знайди md-файли",
    state: RUN_DONE,
    startedAt: AT,
    askedAt: AT,
    endedAt,
    steps: 1,
    money: null,
    worked: 1_000,
  };
}

function chat(patch: Partial<AgentChatState> = {}): AgentChatState {
  return {
    fellAt: {},
    aimedAgentId: null,
    openCalls: {
      isOpen: () => false,
      toggle: () => {},
      open: () => {},
    },
    fieldHeight: null,
    setFieldHeight: () => {},
    aim: vi.fn(),
    fresh: vi.fn(),
    sayAgain: vi.fn(),
    saidAgain: [],
    runId: "run-live",
    goOnIn: vi.fn(),
    letGo: vi.fn(),
    messages: [],
    draft: "",
    isWorking: false,
    isNewsElsewhere: false,
    readNews: vi.fn(),
    written: 0,
    startedAt: null,
    working: [],
    waiting: [],
    linkLives: {},
    changeDraft: vi.fn(),
    send: vi.fn(),
    stop: vi.fn(),
    ...patch,
  };
}

/** The machine, answering the record's channels and nothing else. */
function machine(runs: RunRow[]) {
  const invoke = vi.fn(async (channel: string) => {
    if (channel === LIST_RUNS_CHANNEL) {
      return runs;
    }

    if (channel === READ_RUN_CHANNEL) {
      return null;
    }

    return undefined;
  });

  standInBridge({
    invoke: invoke,
  });

  return invoke;
}

describe("useShownStream", () => {
  it("stands on the live stream until a run is opened", () => {
    machine([]);

    const { result } = renderHook(() => useShownStream(DIRECTORY, [], chat(), select));

    expect(result.current.tab).toBe("stream");
    // With nothing opened, the run the stream stands on is the one it writes into.
    expect(result.current.shownRunId).toBe("run-live");
  });

  it("opens a row in the stream's place, aims at whoever walked it, and goes on in its record", async () => {
    // A run opened is not a read-only page — the next question continues that record.
    machine([]);

    const said = chat();
    const { result } = renderHook(() => useShownStream(DIRECTORY, [], said, select));

    act(() => result.current.openRun(row("run-1", AT), null));

    expect(result.current.tab).toBe("stream");
    expect(result.current.shownRunId).toBe("run-1");
    expect(said.aim).toHaveBeenCalledWith("agent-1");
    expect(said.goOnIn).toHaveBeenCalledWith("run-1");
  });

  it("aims at whom the flow was asked last, and not at whom it was asked first", async () => {
    // The bug this guards: a flow begun with one agent and handed to another opened aimed at the first, so «спитати
    // ще раз» went back to an agent the conversation had already left behind.
    machine([]);
    select.mockClear();

    const said = chat();
    const agents = [
      {
        id: "agent-2",
        name: "Рев'юер",
        color: "#b18aff",
      },
    ];
    const { result } = renderHook(() => useShownStream(DIRECTORY, agents, said, select));

    act(() =>
      result.current.openRun(
        {
          ...row("run-1", AT),
          askedAgentId: "agent-2",
          askedAgentName: "Рев'юер",
        },
        null,
      ),
    );

    expect(said.aim).toHaveBeenCalledWith("agent-2");
    // The mark on the sphere moves with the aim, so it is the same agent that is lit.
    expect(select).toHaveBeenCalledWith("agent-2");
  });

  it("moves the sphere's own mark with the aim, so two spheres are never lit at once", async () => {
    // Fixing and aiming are two marks of one agent — a ring left where the person came from would say
    // the chat writes to that sphere, while the halo says it writes to another.
    machine([]);
    select.mockClear();

    const { result } = renderHook(() =>
      useShownStream(
        DIRECTORY,
        [
          {
            id: "agent-1",
            name: "Шукач",
            color: "#6fd3d8",
          },
        ],
        chat(),
        select,
      ),
    );

    act(() => result.current.openRun(row("run-1", AT), null));

    expect(select).toHaveBeenCalledWith("agent-1");
  });

  it("lets the selection go when the project no longer holds the agent the run started from", async () => {
    // The record keeps the name of an agent the project let go, but there is no sphere left to mark.
    machine([]);
    select.mockClear();

    const { result } = renderHook(() => useShownStream(DIRECTORY, [], chat(), select));

    act(() => result.current.openRun(row("run-1", AT), null));

    expect(select).toHaveBeenCalledWith(null);
  });

  it("lets the opened run go when the stream is made fresh", () => {
    machine([]);

    const said = chat();
    const { result } = renderHook(() => useShownStream(DIRECTORY, [], said, select));

    act(() => result.current.openRun(row("run-1", AT), null));
    act(() => result.current.fresh());

    expect(result.current.shownRunId).toBe("run-live");
    expect(said.fresh).toHaveBeenCalled();
  });

  it("counts only ended runs as deletable, one still going being a half-written record", async () => {
    // What the forget-all question is about is exactly what is offered.
    machine([row("run-1", AT), row("run-2", null)]);

    const { result } = renderHook(() => useShownStream(DIRECTORY, [], chat(), select));

    act(() => result.current.showTab("history"));

    await waitFor(() => expect(result.current.runs).toHaveLength(2));

    expect(result.current.endedRuns).toHaveLength(1);

    act(() => result.current.armForgetAll());

    expect(result.current.doomedRuns).toHaveLength(1);
  });

  it("arms one run and lets it off again without deleting anything", () => {
    const invoke = machine([]);
    const { result } = renderHook(() => useShownStream(DIRECTORY, [], chat(), select));

    act(() => result.current.armForget(row("run-1", AT)));

    expect(result.current.doomedRun?.id).toBe("run-1");

    act(() => result.current.dismissForget());

    expect(result.current.doomedRun).toBeNull();
    expect(invoke).not.toHaveBeenCalledWith(FORGET_RUN_CHANNEL, expect.anything());
  });

  it("takes the conversation with the record, and opens the stream fresh where that record stood in it", async () => {
    // Putting the older conversation back would read as if deleting a record brought it out.
    const invoke = machine([]);
    const said = chat();
    const { result } = renderHook(() => useShownStream(DIRECTORY, [], said, select));

    act(() => result.current.openRun(row("run-1", AT), null));
    act(() => result.current.armForget(row("run-1", AT)));
    await act(() => result.current.forgetRun());

    expect(invoke).toHaveBeenCalledWith(FORGET_RUN_CHANNEL, {
      id: "run-1",
    });
    expect(said.letGo).toHaveBeenCalledWith("run-1");
    expect(said.fresh).toHaveBeenCalled();
    expect(result.current.shownRunId).toBe("run-live");
  });

  it("empties the whole history and leaves the stream fresh behind it", async () => {
    const invoke = machine([]);
    const said = chat();
    const { result } = renderHook(() => useShownStream(DIRECTORY, [], said, select));

    act(() => result.current.armForgetAll());
    await act(() => result.current.forgetAllRuns());

    expect(invoke).toHaveBeenCalledWith(FORGET_RUNS_CHANNEL, {
      directory: DIRECTORY,
    });
    expect(result.current.doomedRuns).toBeNull();
    expect(said.fresh).toHaveBeenCalled();
  });

  it("reads the news the moment the history is opened", async () => {
    // The dot says another conversation has something; opening the list is having seen it.
    machine([]);

    const said = chat({
      isNewsElsewhere: true,
    });
    const { result } = renderHook(() => useShownStream(DIRECTORY, [], said, select));

    act(() => result.current.showTab("history"));

    await waitFor(() => expect(said.readNews).toHaveBeenCalled());
  });
});
