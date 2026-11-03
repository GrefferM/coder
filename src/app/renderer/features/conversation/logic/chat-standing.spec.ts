import { describe, expect, it } from "vitest";
import { chatStanding } from "./chat-standing";
import { CHAT_SAID_NOTHING_NOTE, CHAT_STOPPED_NOTE } from "../constants";
import { RUN_DONE, RUN_FAILED, RUN_NOT_SENT, RUN_STOPPED } from "../../record";
import type { ChatMessage } from "../interfaces";

function said(patch: Partial<ChatMessage> = {}): ChatMessage {
  return <ChatMessage>{
    id: "said-1",
    agentId: "agent-1",
    from: "agent",
    text: "- Починай з малого",
    at: "2026-09-07T23:41:00",
    questionId: "question-1",
    askedAt: 0,
    cost: null,
    answerCeiling: null,
    otherAgentId: null,
    stopReason: null,
    isFailure: false,
    notStarted: null,
    wouldGo: null,
    waitsFor: null,
    calls: [],
    began: null,
    stepId: null,
    walkId: null,
    note: null,
    asked: null,
    fedBy: [],
    ...patch,
  };
}

describe("chatStanding", () => {
  it("says done where the last word of the chat is an answer that came", () => {
    expect(chatStanding([said()])).toBe(RUN_DONE);
  });

  it("says done where no agent has spoken at all, nothing having fallen yet", () => {
    expect(
      chatStanding([
        said({
          from: "person",
        }),
      ]),
    ).toBe(RUN_DONE);
  });

  it("says nothing was sent where the last turn never began, since nothing fell either", () => {
    // Guards the live-stream band reading only `isFailure`, which left a green dot for a provider that never answered.
    expect(
      chatStanding([
        said({
          notStarted: "silent",
        }),
      ]),
    ).toBe(RUN_NOT_SENT);
  });

  it("says nothing was sent where the model answered with nothing", () => {
    expect(
      chatStanding([
        said({
          note: CHAT_SAID_NOTHING_NOTE,
        }),
      ]),
    ).toBe(RUN_NOT_SENT);
  });

  it("takes the worse word where the turns ended differently, a fall being worse than nothing sent", () => {
    // «УПАВ» outranks «НЕ ПІШОВ»; the row shows the worse.
    expect(
      chatStanding([
        said({
          id: "said-1",
          walkId: "walk-1",
          notStarted: "silent",
        }),
        said({
          id: "said-2",
          walkId: "walk-1",
          isFailure: true,
        }),
      ]),
    ).toBe(RUN_FAILED);
  });

  it("says failed where the last turn fell", () => {
    expect(
      chatStanding([
        said({
          isFailure: true,
        }),
      ]),
    ).toBe(RUN_FAILED);
  });

  it("says stopped where a hand stopped the turn, a stop being a person's act and no fall", () => {
    expect(
      chatStanding([
        said({
          note: CHAT_STOPPED_NOTE,
        }),
      ]),
    ).toBe(RUN_STOPPED);
  });

  it("reads the whole walk, so a turn that fell does not hide behind one that answered after it", () => {
    // Guards one agent handing to two, where the later-answering branch stood for the whole walk.
    expect(
      chatStanding([
        said({
          id: "said-1",
          walkId: "walk-1",
          isFailure: true,
        }),
        said({
          id: "said-2",
          walkId: "walk-1",
        }),
      ]),
    ).toBe(RUN_FAILED);
  });

  it("reads only the last walk, so a fall a repeat has mended is not read again", () => {
    // A repeat is a walk of its own, and the stream stands on it.
    expect(
      chatStanding([
        said({
          id: "said-1",
          walkId: "walk-1",
          isFailure: true,
        }),
        said({
          id: "said-2",
          walkId: "walk-2",
        }),
      ]),
    ).toBe(RUN_DONE);
  });

  it("says nothing was sent where a hand stopped one branch and another never left", () => {
    // A stop explains only what it stopped; a branch that never began still counts.
    expect(
      chatStanding([
        said({
          id: "said-1",
          walkId: "walk-1",
          note: CHAT_STOPPED_NOTE,
        }),
        said({
          id: "said-2",
          walkId: "walk-1",
          notStarted: "silent",
        }),
      ]),
    ).toBe(RUN_NOT_SENT);
  });

  it("reads the last agent's word and not the person's that came after it", () => {
    expect(
      chatStanding([
        said({
          isFailure: true,
        }),
        said({
          id: "asked-2",
          from: "person",
        }),
      ]),
    ).toBe(RUN_FAILED);
  });
});
