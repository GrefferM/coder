import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useRecordWriter } from "./use-record-writer";
import { ASK_AGAIN_CHANNEL, CLOSE_RUN_CHANNEL, OPEN_RUN_CHANNEL } from "../../../../../../contracts";
import type { Agent } from "../../../../interfaces";
import type { RunLedger } from "../../interfaces";
import { standInBridge } from "../../../../testing";
import { anAgent } from "../../../../testing";

const EDITOR: Agent = anAgent({
  name: "ТЕЗАР",
  color: "#b18aff",
  x: 0,
  y: 0,
  maxCalls: 5,
  temperature: 0.3,
});

/** One walk's book, as the machine hands it to the writer. */
function ledger(walkId: string, runId: string | null = null): RunLedger {
  return {
    walkId,
    askedAt: 100,
    runId,
    questionId: `question-${walkId}`,
    out: 1,
    stepIdOf: {},
    queue: Promise.resolve(),
  };
}

/** The machine's answers, each channel held or given back as the test needs it. */
function machine(held: string[] = []) {
  const releases: Record<string, () => void> = {};
  const sent: Record<string, unknown[]> = {};
  const gates = new Map(
    held.map((channel) => [
      channel,
      new Promise<void>((resolve) => {
        releases[channel] = resolve;
      }),
    ]),
  );
  const invoke = vi.fn(async (channel: string, payload?: unknown) => {
    sent[channel] = [...(sent[channel] ?? []), payload];

    await gates.get(channel);

    if (channel === OPEN_RUN_CHANNEL) {
      return {
        runId: "run-1",
        questionId: "question-walk-1",
      };
    }

    return channel === ASK_AGAIN_CHANNEL ? "question-walk-2" : undefined;
  });

  standInBridge({
    invoke: invoke,
  });

  return {
    sent,
    invoke,
    release: (channel: string) => releases[channel](),
  };
}

function writer() {
  return renderHook(() =>
    useRecordWriter(
      () => undefined,
      () => undefined,
      () => false,
      () => undefined,
    ),
  );
}

describe("useRecordWriter · the row a question is written into", () => {
  it("keeps the row the first question opened for the second, though the stream was emptied between them", async () => {
    // Two questions in one breath. The row is settled when each is asked, so «+ НОВИЙ ЧАТ»
    // reaching the writer in between cannot leave the second one standing without a record.
    const { sent, release } = machine([OPEN_RUN_CHANNEL]);
    const { result } = writer();
    const second = ledger("walk-2");

    act(() => result.current.askQuestion(ledger("walk-1"), "/tmp", EDITOR, "Перше", "walk-1"));
    act(() => result.current.askQuestion(second, "/tmp", EDITOR, "Друге", "walk-2"));
    act(() => result.current.forgetOpening());
    act(() => release(OPEN_RUN_CHANNEL));

    await waitFor(() => expect(sent[ASK_AGAIN_CHANNEL]).toHaveLength(1));

    expect(sent[ASK_AGAIN_CHANNEL]?.[0]).toMatchObject({
      runId: "run-1",
      asked: "Друге",
    });
    expect(second.runId).toBe("run-1");
  });
});

describe("useRecordWriter · what a walk waits for", () => {
  it("waits for its own writes and not for another conversation's", async () => {
    // A repeat reads the record of its own walk. A row of another conversation still closing is none of
    // its business — waiting for it would hold the repeat for as long as that conversation goes on writing.
    const { release } = machine([CLOSE_RUN_CHANNEL]);
    const { result } = writer();
    let isOtherSettled = false;

    act(() => result.current.closeWalk(ledger("walk-1", "run-1"), "walk-1", 1_000));
    act(() => result.current.askQuestion(ledger("walk-2", "run-2"), "/tmp", EDITOR, "Друге", "walk-2"));
    void result.current.settled("walk-1").then(() => {
      isOtherSettled = true;
    });

    await result.current.settled("walk-2");

    // Its own writes are through while the other conversation's closing is still held by the machine.
    expect(isOtherSettled).toBe(false);

    act(() => release(CLOSE_RUN_CHANNEL));

    // And the other one is not forgotten either — it settles the moment its own write comes back.
    await waitFor(() => expect(isOtherSettled).toBe(true));
  });
});
