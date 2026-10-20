import { describe, expect, it } from "vitest";
import { foundInStream } from "./found-in-stream";
import type { ChatMessage } from "../interfaces";
import type { TurnCall } from "../../../interfaces";

function call(patch: Partial<TurnCall> = {}): TurnCall {
  return {
    id: "call-1",
    source: "command",
    name: "grep",
    arguments: {},
    pinned: [],
    line: "grep -rn ялина .",
    output: "нічого",
    refusal: "",
    exitCode: 0,
    serverId: null,
    serverName: "",
    isFailed: false,
    startedAt: 1_000,
    endedAt: 1_400,
    ...patch,
  };
}

function said(id: string, text: string, calls: TurnCall[] = [], patch: Partial<ChatMessage> = {}): ChatMessage {
  return {
    id,
    agentId: "agent-1",
    from: "agent",
    text,
    at: "2026-09-07T14:00:00.000Z",
    questionId: "question-1",
    askedAt: 0,
    cost: null,
    answerCeiling: null,
    otherAgentId: null,
    stopReason: null,
    isFailure: false,
    notStarted: null,
    wouldGo: null,
    calls,
    began: null,
    stepId: null,
    walkId: null,
    note: null,
    asked: null,
    fedBy: [],
    attached: [],
    compressed: null,
    ...patch,
  };
}

describe("foundInStream", () => {
  it("finds nothing on an empty word, an empty field being no search at all", () => {
    expect(foundInStream([said("one", "Ялина")], "")).toEqual([]);
    expect(foundInStream([said("one", "Ялина")], "   ")).toEqual([]);
  });

  it("names the messages the word stands in, freshest first, against the order the stream reads", () => {
    const messages = [said("one", "Ялина перша"), said("two", "Нічого"), said("three", "Ялина третя")];

    // Results run newest first, so «1» is the newest.
    expect(foundInStream(messages, "ялина")).toEqual(["three", "one"]);
  });

  it("names a message once however many times it says the word: the ride is to a card", () => {
    expect(foundInStream([said("one", "Ялина, ялина, ялина")], "ялина")).toEqual(["one"]);
  });

  it("looks inside a call's command and inside its output, as the record's search does", () => {
    const byLine = said("one", "Нічого", [call()]);
    const byOutput = said("two", "Нічого", [
      call({
        line: "ls",
        output: "ялина.md",
      }),
    ]);

    expect(foundInStream([byLine, byOutput], "ялина")).toEqual(["two", "one"]);
  });

  it("catches the word inside a word, and cares nothing for the case it was typed in", () => {
    const messages = [said("one", "Перевір сесії користувачів")];

    expect(foundInStream(messages, "сесі")).toEqual(["one"]);
    expect(foundInStream(messages, "СЕСІЇ")).toEqual(["one"]);
  });

  it("looks in what the person asked and in what an agent answered, and in nothing else", () => {
    const asked = said("one", "Ялина в питанні", [], {
      from: "person",
    });
    const answered = said("two", "Ялина у відповіді");

    expect(foundInStream([asked, answered], "ялина")).toEqual(["two", "one"]);
  });

  it("passes over a turn that never began: nobody was told that, the app was reporting", () => {
    // The app's own cards are never searched.
    const never = said("one", "Локальний провайдер не відповідає за своєю адресою", [], {
      notStarted: "noAddress",
    });

    expect(foundInStream([never], "провайдер")).toEqual([]);
  });

  it("passes over the app's own word on a rule", () => {
    const note = said("one", "Обірвано разом із ходьбою", [], {
      note: "Обірвано разом із ходьбою",
    });

    expect(foundInStream([note], "обірвано")).toEqual([]);
  });

  it("passes over the lines of a handoff and of work arriving, neither being a thing anybody said", () => {
    const handed = said("one", "СТИСЛЯР передає ЗАГОЛОВКАР", [], {
      from: "handoff",
    });
    const came = said("two", "Прийшло від СТИСЛЯР", [], {
      from: "supplier",
    });

    expect(foundInStream([handed, came], "стисляр")).toEqual([]);
  });
});
