import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { breakWords, saysBreak } from "./step-break";
import { CHAT_STEP_BROKEN_NOTE } from "./chat-notes.constant";
import type { ChatMessage } from "./chat-message.interface";

function said(patch: Partial<ChatMessage> = {}): ChatMessage {
  return {
    id: "said-1",
    agentId: "agent-1",
    from: "agent",
    text: "- Починай з малого",
    note: null,
    at: new Date("2026-08-31T15:41:00").toISOString(),
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
    asked: null,
    fedBy: [],
    attached: [],
    compressed: null,
    ...patch,
  };
}

/** A turn that ended without words of its own, carrying only the app's rule about it. */
function broke(note: string, id: string, walkId = "walk-1"): ChatMessage {
  return said({
    id,
    text: "",
    note,
    walkId,
  });
}

describe("saysBreak", () => {
  it("speaks at a turn that broke alone", () => {
    assert.equal(saysBreak([broke("Зупинено", "one")], 0), true);
  });

  it("keeps quiet at every turn of a break but the last of them", () => {
    // A broken step says its word once, at the end of the turns that broke together.
    const messages = [broke("Зупинено", "one"), broke("Зупинено", "two"), broke("Зупинено", "three")];

    assert.equal(saysBreak(messages, 0), false);
    assert.equal(saysBreak(messages, 1), false);
    assert.equal(saysBreak(messages, 2), true);
  });

  it("speaks at every walk of its own, so a repeat is counted and not folded into the try before it", () => {
    // One word per step; a repeat is its own step, so three tries read as three.
    const messages = [
      broke("Зупинено", "one", "walk-1"),
      broke("Зупинено", "two", "walk-2"),
      broke("Зупинено", "three", "walk-3"),
    ];

    assert.equal(saysBreak(messages, 0), true);
    assert.equal(saysBreak(messages, 1), true);
    assert.equal(saysBreak(messages, 2), true);
  });

  it("speaks where the turn after it said something of its own, since that ends the break", () => {
    assert.equal(saysBreak([broke("Зупинено", "one"), said()], 0), true);
  });

  it("speaks where the turn itself said something, whatever follows", () => {
    const messages = [
      said({
        note: "Зупинено",
      }),
      broke("Зупинено", "two"),
    ];

    assert.equal(saysBreak(messages, 0), true);
  });
});

describe("breakWords", () => {
  it("says the end where a turn broke alone", () => {
    assert.equal(breakWords([broke("Зупинено", "one")], 0), "Зупинено");
  });

  it("says the end the turns share, since it is true of all of them", () => {
    const messages = [broke("Зупинено", "one"), broke("Зупинено", "two")];

    assert.equal(breakWords(messages, 1), "Зупинено");
  });

  it("says the general word where the turns came to different ends", () => {
    // Differing ends give the general word, not the last one's.
    const messages = [broke("Зупинено", "one"), broke("Модель не сказала нічого", "two")];

    assert.equal(breakWords(messages, 1), CHAT_STEP_BROKEN_NOTE);
  });

  it("counts back only over the turns of this break, and not past one that spoke", () => {
    const messages = [
      broke("Модель не сказала нічого", "one"),
      said(),
      broke("Зупинено", "three"),
      broke("Зупинено", "four"),
    ];

    // A turn that spoke separates breaks: what is above it belongs to another break.
    assert.equal(breakWords(messages, 3), "Зупинено");
  });
});
