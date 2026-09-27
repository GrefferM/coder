import { describe, expect, it } from "vitest";
import { chatFileName, chatText } from "./chat-text";
import { CHAT_EXPORT_HEADING, CHAT_EXPORT_RULE } from "../constants";
import type { ChatMessage } from "../interfaces";
import type { NamedAgent, TurnCall } from "../../../interfaces";

const AT = new Date(2026, 8, 27, 14, 5).toISOString();

const AGENTS: NamedAgent[] = [
  {
    id: "a1",
    name: "Рецензент",
    color: "#fff",
  },
  {
    id: "a2",
    name: "Редактор",
    color: "#000",
  },
];

function message(patch: Partial<ChatMessage> = {}): ChatMessage {
  return {
    id: "m1",
    agentId: "a1",
    from: "agent",
    text: "",
    at: AT,
    questionId: "q1",
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

function call(patch: Partial<TurnCall> = {}): TurnCall {
  return {
    id: "c1",
    name: "fetch",
    arguments: {},
    pinned: [],
    line: "",
    output: "",
    refusal: "",
    exitCode: 0,
    serverId: "s1",
    serverName: "web",
    isFailed: false,
    startedAt: 0,
    endedAt: 1,
    ...patch,
  };
}

describe("chatText", () => {
  it("opens with the heading, a dated line and a rule", () => {
    const out = chatText(
      [
        message({
          from: "person",
          text: "Привіт",
        }),
      ],
      AGENTS,
    );
    const [head, rule] = out.split("\n");

    expect(head).toMatch(new RegExp(`^${CHAT_EXPORT_HEADING} · \\d{2}\\.\\d{2}\\.\\d{4}$`));
    expect(rule).toBe(CHAT_EXPORT_RULE);
  });

  it("names the person and the hour, then the words", () => {
    const out = chatText(
      [
        message({
          from: "person",
          text: "Що це?",
        }),
      ],
      AGENTS,
    );

    expect(out).toContain("[14:05] ВИ:");
    expect(out).toContain("Що це?");
  });

  it("names an agent by its own name", () => {
    const out = chatText(
      [
        message({
          from: "agent",
          agentId: "a1",
          text: "Готово",
        }),
      ],
      AGENTS,
    );

    expect(out).toContain("[14:05] Рецензент:");
    expect(out).toContain("Готово");
  });

  it("lists a question's attached files, a folder with a trailing slash", () => {
    const out = chatText(
      [
        message({
          from: "person",
          text: "гляньте",
          attached: [
            {
              name: "notes.txt",
              kind: "file",
            },
            {
              name: "src",
              kind: "folder",
            },
          ],
        }),
      ],
      AGENTS,
    );

    expect(out).toContain("Прикріплено: notes.txt, src/");
  });

  it("writes a tool call — what went in and what came back", () => {
    const out = chatText(
      [
        message({
          from: "agent",
          text: "шукаю",
          calls: [
            call({
              name: "fetch",
              arguments: {
                url: "https://x",
              },
              output: "200 OK",
            }),
          ],
        }),
      ],
      AGENTS,
    );

    expect(out).toContain("→ fetch");
    expect(out).toContain("url: https://x");
    expect(out).toContain("результат:");
    expect(out).toContain("200 OK");
  });

  it("writes a command's own line, and its result", () => {
    const out = chatText(
      [
        message({
          from: "agent",
          calls: [
            call({
              name: "ls",
              serverId: null,
              serverName: "",
              line: "ls -a",
              output: "a\nb",
            }),
          ],
        }),
      ],
      AGENTS,
    );

    expect(out).toContain("команда: ls -a");
    expect(out).toContain("a");
    expect(out).toContain("b");
  });

  it("says a call was refused with the refusal in place of the result", () => {
    const out = chatText(
      [
        message({
          from: "agent",
          calls: [
            call({
              refusal: "ні",
            }),
          ],
        }),
      ],
      AGENTS,
    );

    expect(out).toContain("відмовлено");
    expect(out).toContain("ні");
  });

  it("names a supplier turn by the neighbour it came from", () => {
    const out = chatText(
      [
        message({
          from: "supplier",
          otherAgentId: "a2",
          text: "ось",
        }),
      ],
      AGENTS,
    );

    expect(out).toContain("[14:05] Редактор (робота):");
    expect(out).toContain("ось");
  });

  it("writes a handoff as one line, from one agent to another", () => {
    const out = chatText(
      [
        message({
          from: "handoff",
          agentId: "a1",
          otherAgentId: "a2",
        }),
      ],
      AGENTS,
    );

    expect(out).toContain("роботу передано: Рецензент → Редактор");
  });

  it("writes a question that never went as one line, named by whom it was for", () => {
    const out = chatText(
      [
        message({
          from: "notSent",
          otherAgentId: "a2",
        }),
      ],
      AGENTS,
    );

    expect(out).toContain("не надіслано до: Редактор");
  });

  it("keeps out an agent beat with nothing said, attached or called", () => {
    const out = chatText(
      [
        message({
          from: "agent",
          text: "",
        }),
      ],
      AGENTS,
    );

    expect(out).not.toContain("Рецензент");
  });

  it("carries nothing of tokens or price, even when the turn holds a cost", () => {
    const out = chatText(
      [
        message({
          from: "agent",
          text: "done",
          cost: {
            inputTokens: 111,
            outputTokens: 222,
            money: 3.5,
          },
        }),
      ],
      AGENTS,
    );

    expect(out).not.toContain("111");
    expect(out).not.toContain("222");
    expect(out).not.toContain("3.5");
  });
});

describe("chatFileName", () => {
  it("is «розмова-РРРР-ММ-ДД.txt» by the day it is written", () => {
    expect(chatFileName(new Date(2026, 8, 7))).toBe("розмова-2026-09-07.txt");
  });
});
