import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { walkBroke } from "./walk-broke";
import { aWalk } from "../testing";
import type { ChatMessage } from "./chat-message.interface";
import type { Walk } from "./walk.interface";

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
    ...aWalk("question-1", 1),
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
    assert.equal(walkBroke(walk()), false);
  });

  it("breaks on a walk that is gone, put away or stopped", () => {
    assert.equal(walkBroke(null), true);
    assert.equal(
      walkBroke(
        walk({
          isPutAway: true,
        }),
      ),
      true,
    );
    assert.equal(
      walkBroke(
        walk({
          isStopped: true,
        }),
      ),
      true,
    );
  });

  it("breaks where the record refused the end", () => {
    assert.equal(
      walkBroke(
        walk({
          unclosed: {
            runId: "run-1",
            endedAt: 2,
          },
        }),
      ),
      true,
    );
  });

  it("breaks on a turn that fell, never began or did not go", () => {
    assert.equal(
      walkBroke(
        walk({
          said: [
            said({
              isFailure: true,
            }),
          ],
        }),
      ),
      true,
    );
    assert.equal(
      walkBroke(
        walk({
          said: [
            said({
              notStarted: "noKey",
            }),
          ],
        }),
      ),
      true,
    );
    assert.equal(
      walkBroke(
        walk({
          said: [
            said({
              from: "notSent",
            }),
          ],
        }),
      ),
      true,
    );
  });
});
