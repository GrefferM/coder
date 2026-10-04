import { describe, expect, it } from "vitest";
import { walkBroke } from "./walk-broke";
import { begunWalk } from "./begun-walk";
import type { ChatMessage, Walk } from "../interfaces";

function said(patch: Partial<ChatMessage>): ChatMessage {
  return {
    id: "said-1",
    agentId: "editor",
    from: "agent",
    text: "Готово",
    at: "2026-09-02T15:41:00.000Z",
    questionId: "question-1",
    askedAt: 1,
    cost: null,
    answerCeiling: null,
    otherAgentId: null,
    stopReason: null,
    isFailure: false,
    notStarted: null,
    wouldGo: null,
    calls: [],
    began: null,
    stepId: null,
    walkId: null,
    note: null,
    asked: null,
    fedBy: [],
    attached: [],
    ...patch,
  };
}

function walk(patch: Partial<Walk> = {}): Walk {
  return {
    ...begunWalk("question-1", 1),
    said: [
      said({
        from: "person",
        text: "Прогони тести",
      }),
      said({}),
    ],
    ...patch,
  };
}

describe("walkBroke", () => {
  it("lets a whole walk go on to the next repeat", () => {
    expect(walkBroke(walk())).toBe(false);
  });

  it("breaks on a walk that is gone, put away or stopped", () => {
    expect(walkBroke(null)).toBe(true);
    expect(
      walkBroke(
        walk({
          isPutAway: true,
        }),
      ),
    ).toBe(true);
    expect(
      walkBroke(
        walk({
          isStopped: true,
        }),
      ),
    ).toBe(true);
  });

  it("breaks where the record refused the end", () => {
    expect(
      walkBroke(
        walk({
          unclosed: {
            runId: "run-1",
            endedAt: 2,
          },
        }),
      ),
    ).toBe(true);
  });

  it("breaks on a turn that fell, never began or did not go", () => {
    expect(
      walkBroke(
        walk({
          said: [
            said({
              isFailure: true,
            }),
          ],
        }),
      ),
    ).toBe(true);
    expect(
      walkBroke(
        walk({
          said: [
            said({
              notStarted: "noKey",
            }),
          ],
        }),
      ),
    ).toBe(true);
    expect(
      walkBroke(
        walk({
          said: [
            said({
              from: "notSent",
            }),
          ],
        }),
      ),
    ).toBe(true);
  });
});
