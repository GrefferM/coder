import { describe, expect, it } from "vitest";
import { breakWords, saysBreak } from "./step-break";
import { CHAT_STEP_BROKEN_NOTE } from "../constants";
import type { ChatMessage } from "../interfaces";

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
    expect(saysBreak([broke("Зупинено", "one")], 0)).toBe(true);
  });

  it("keeps quiet at every turn of a break but the last of them", () => {
    // A step that broke says its word once, at the end of the turns that broke together.
    const messages = [broke("Зупинено", "one"), broke("Зупинено", "two"), broke("Зупинено", "three")];

    expect(saysBreak(messages, 0)).toBe(false);
    expect(saysBreak(messages, 1)).toBe(false);
    expect(saysBreak(messages, 2)).toBe(true);
  });

  it("speaks at every walk of its own, so a repeat is counted and not folded into the try before it", () => {
    // One word per step, and a repeat is a step of its own — three tries read as three.
    const messages = [
      broke("Зупинено", "one", "walk-1"),
      broke("Зупинено", "two", "walk-2"),
      broke("Зупинено", "three", "walk-3"),
    ];

    expect(saysBreak(messages, 0)).toBe(true);
    expect(saysBreak(messages, 1)).toBe(true);
    expect(saysBreak(messages, 2)).toBe(true);
  });

  it("speaks where the turn after it said something of its own, since that ends the break", () => {
    expect(saysBreak([broke("Зупинено", "one"), said()], 0)).toBe(true);
  });

  it("speaks where the turn itself said something, whatever follows", () => {
    const messages = [
      said({
        note: "Зупинено",
      }),
      broke("Зупинено", "two"),
    ];

    expect(saysBreak(messages, 0)).toBe(true);
  });
});

describe("breakWords", () => {
  it("says the end where a turn broke alone", () => {
    expect(breakWords([broke("Зупинено", "one")], 0)).toBe("Зупинено");
  });

  it("says the end the turns share, since it is true of all of them", () => {
    const messages = [broke("Зупинено", "one"), broke("Зупинено", "two")];

    expect(breakWords(messages, 1)).toBe("Зупинено");
  });

  it("says the general word where the turns came to different ends", () => {
    // One of three, picked because it came last, would not be true of the step.
    const messages = [broke("Зупинено", "one"), broke("Модель не сказала нічого", "two")];

    expect(breakWords(messages, 1)).toBe(CHAT_STEP_BROKEN_NOTE);
  });

  it("counts back only over the turns of this break, and not past one that spoke", () => {
    const messages = [
      broke("Модель не сказала нічого", "one"),
      said(),
      broke("Зупинено", "three"),
      broke("Зупинено", "four"),
    ];

    // The turn that spoke stands between: what is above it belongs to another break, not this one.
    expect(breakWords(messages, 3)).toBe("Зупинено");
  });
});
