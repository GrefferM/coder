import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useOpenedPass } from "./use-opened-pass";
import { READ_RUN_CHANNEL } from "../../../../../../contracts";
import { RUN_DONE, RUN_STEP_DONE } from "../../../record";
import type { WholeRun, WholeStep } from "../../../record";
import { standInBridge } from "../../../../testing";
import { aModel, anAgent, aStep } from "../../../../testing";

function step(patch: Partial<WholeStep>): WholeStep {
  return aStep({
    agentName: "EDITOR",
    agentColor: "#b18aff",
    model: "qwen2.5-coder",
    providerId: "ollama",
    inputPrice: 0,
    outputPrice: 0,
    contextCeiling: 32_000,
    temperature: 0.3,
    asked: "Питання",
    said: "Готово",
    state: RUN_STEP_DONE,
    inputTokens: 10,
    outputTokens: 10,
    money: 0,
    startedAt: new Date("2026-09-02T15:41:00"),
    endedAt: new Date("2026-09-02T15:41:12"),
    ...patch,
  });
}

const RUN: WholeRun = {
  id: "run-1",
  startedByAgentId: "agent-1",
  startedByAgentName: "EDITOR",
  startedByAgentColor: "#b18aff",
  askedAgentId: "agent-1",
  askedAgentName: "EDITOR",
  asked: "Друге питання",
  state: RUN_DONE,
  startedAt: new Date("2026-09-02T15:41:00"),
  askedAt: new Date("2026-09-02T15:50:00"),
  endedAt: new Date("2026-09-02T15:52:00"),
  steps: 2,
  money: 0,
  worked: 12_000,
  questions: [
    {
      id: "question-1",
      place: 1,
      asked: "Перше питання",
      askedAt: new Date("2026-09-02T15:41:00"),
      askedAgentId: "agent-1",
    },
    {
      id: "question-2",
      place: 2,
      asked: "Друге питання",
      askedAt: new Date("2026-09-02T15:50:00"),
      askedAgentId: "agent-1",
    },
  ],
  walk: [
    step({}),
    step({
      id: "step-2",
      questionId: "question-2",
      walkId: "walk-2",
      // The second question was walked by another agent, so the first pass has nothing to say about it.
      agentId: "agent-2",
      agentName: "REVIEWER",
      place: 2,
      startedAt: new Date("2026-09-02T15:50:00"),
      endedAt: new Date("2026-09-02T15:50:20"),
    }),
  ],
};

beforeEach(() => {
  const invoke = vi.fn(async (channel: string) => (channel === READ_RUN_CHANNEL ? RUN : undefined));

  standInBridge({
    invoke: invoke,
  });
});

describe("useOpenedPass", () => {
  it("stands closed until a question is opened", () => {
    const { result } = renderHook(() => useOpenedPass([], [], 0));

    expect(result.current.isOpen).toBe(false);
    expect(result.current.run).toBeNull();
    expect(result.current.place).toBe(0);
  });

  it("opens one pass of the flow, and says where it stands among them", async () => {
    const { result } = renderHook(() => useOpenedPass([], [], 0));

    act(() => result.current.open("run-1", "question-2"));

    await waitFor(() => expect(result.current.run).not.toBeNull());

    expect(result.current.isOpen).toBe(true);
    expect(result.current.passes).toBe(2);
    expect(result.current.place).toBe(2);
    // The pass is one question's walk, not the whole flow's.
    expect(result.current.run?.walk).toHaveLength(1);
    expect(result.current.run?.asked).toBe("Друге питання");
  });

  it("finds the question's steps by the question, whichever walk they ran in", async () => {
    // A question that never went at first has its steps in the repeat's walk.
    const { result } = renderHook(() => useOpenedPass([], [], 0));

    act(() => result.current.open("run-1", "question-2"));

    await waitFor(() => expect(result.current.run).not.toBeNull());

    expect(result.current.run?.walk.map((step) => step.walkId)).toEqual(["walk-2"]);
  });

  it("steps to another pass of the same flow, and stands still outside it", async () => {
    const { result } = renderHook(() => useOpenedPass([], [], 0));

    act(() => result.current.open("run-1", "question-2"));
    await waitFor(() => expect(result.current.run).not.toBeNull());

    act(() => result.current.go(1));
    await waitFor(() => expect(result.current.place).toBe(1));

    expect(result.current.run?.asked).toBe("Перше питання");

    act(() => result.current.go(3));

    expect(result.current.place).toBe(1);
  });

  it("closes to nothing at all", async () => {
    const { result } = renderHook(() => useOpenedPass([], [], 0));

    act(() => result.current.open("run-1", "question-2"));
    await waitFor(() => expect(result.current.run).not.toBeNull());

    act(() => result.current.close());

    expect(result.current.isOpen).toBe(false);
    expect(result.current.run).toBeNull();
  });

  it("says nothing about an agent that walked another question of the same flow", async () => {
    // A projection is one pass: a model changed under an agent that never walked here is not reported.
    const { result } = renderHook(() =>
      useOpenedPass(
        [
          // The agent of this pass is unchanged from the record.
          anAgent({
            id: "agent-1",
            name: "EDITOR",
            modelId: "model-then",
            temperature: 0.3,
          }),
          anAgent({
            id: "agent-2",
            name: "REVIEWER",
            modelId: "model-now",
          }),
        ],
        [
          aModel({
            id: "model-then",
            title: "qwen2.5-coder",
          }),
          aModel({
            id: "model-now",
            title: "claude-opus-4.1",
          }),
        ],
        0,
      ),
    );

    act(() => result.current.open("run-1", "question-1"));

    await waitFor(() => expect(result.current.run).not.toBeNull());

    expect(result.current.standings.map((standing) => standing.id)).toEqual(["agent-1"]);
    // The other agent's model changed, but it never walked here.
    expect(result.current.changes).toEqual([]);
  });

  it("holds the agents of the pass it is open on against today", async () => {
    const { result } = renderHook(() =>
      useOpenedPass(
        [
          anAgent({
            id: "agent-2",
            name: "REVIEWER",
            modelId: "model-now",
          }),
        ],
        [
          aModel({
            id: "model-now",
            title: "claude-opus-4.1",
          }),
        ],
        0,
      ),
    );

    act(() => result.current.open("run-1", "question-2"));

    await waitFor(() => expect(result.current.run).not.toBeNull());

    expect(result.current.changes.map((change) => change.id)).toEqual(["agent-2"]);
    expect(result.current.changes[0].wasModel).toBe("qwen2.5-coder");
    expect(result.current.changes[0].nowModel).toBe("claude-opus-4.1");
  });
});
