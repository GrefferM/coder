import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { chatFileName, chatText } from "./chat-text";
import { CHAT_EXPORT_HEADING, CHAT_EXPORT_RULE } from "./chat-export.constant";
import type { ChatMessage } from "./chat-message.interface";
import type { NamedAgent } from "../project";
import type { TurnCall } from "../runs";

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
    compressed: null,
    ...patch,
  };
}

function call(patch: Partial<TurnCall> = {}): TurnCall {
  return {
    id: "c1",
    source: "mcp",
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

    assert.match(head, new RegExp(`^${CHAT_EXPORT_HEADING} · \\d{2}\\.\\d{2}\\.\\d{4}$`));
    assert.equal(rule, CHAT_EXPORT_RULE);
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

    assert.ok(out.includes("[14:05] ВИ:"));
    assert.ok(out.includes("Що це?"));
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

    assert.ok(out.includes("[14:05] Рецензент:"));
    assert.ok(out.includes("Готово"));
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

    assert.ok(out.includes("Прикріплено: notes.txt, src/"));
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

    assert.ok(out.includes("→ fetch"));
    assert.ok(out.includes("url: https://x"));
    assert.ok(out.includes("результат:"));
    assert.ok(out.includes("200 OK"));
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

    assert.ok(out.includes("команда: ls -a"));
    assert.ok(out.includes("a"));
    assert.ok(out.includes("b"));
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

    assert.ok(out.includes("відмовлено"));
    assert.ok(out.includes("ні"));
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

    assert.ok(out.includes("[14:05] Редактор (робота):"));
    assert.ok(out.includes("ось"));
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

    assert.ok(out.includes("роботу передано: Рецензент → Редактор"));
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

    assert.ok(out.includes("не надіслано до: Редактор"));
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

    assert.ok(!out.includes("Рецензент"));
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

    assert.ok(!out.includes("111"));
    assert.ok(!out.includes("222"));
    assert.ok(!out.includes("3.5"));
  });
});

describe("chatFileName", () => {
  it("writes a turn that fell: marked, with the app's word and the provider's sentence", () => {
    const out = chatText(
      [
        message({
          isFailure: true,
          note: "Відповідь не прийшла · ключ відхилено",
        }),
      ],
      AGENTS,
    );

    assert.ok(out.includes("[14:05] Рецензент (упав):"));
    assert.ok(out.includes("  ! Відповідь не прийшла · ключ відхилено"));
  });

  it("writes a turn that never began, marked, with the card's sentence", () => {
    const out = chatText(
      [
        message({
          notStarted: "noKey",
          text: "Модель m належить провайдеру p, а ключа до нього немає.",
        }),
      ],
      AGENTS,
    );

    assert.ok(out.includes("[14:05] Рецензент (хід не почався):"));
    assert.ok(out.includes("Модель m належить провайдеру p, а ключа до нього немає."));
  });

  it("says a step broke once, for the turns that broke together", () => {
    const out = chatText(
      [
        message({
          id: "m1",
          agentId: "a1",
          walkId: "w1",
          note: "Крок обірвався",
        }),
        message({
          id: "m2",
          agentId: "a2",
          walkId: "w1",
          note: "Крок обірвався",
        }),
      ],
      AGENTS,
    );

    assert.ok(!out.includes("Рецензент"));
    assert.ok(out.includes("[14:05] Редактор:"));
    assert.equal(out.match(/Крок обірвався/g)?.length, 1);
  });

  it("writes a line the work did not go down, with the reason", () => {
    const out = chatText(
      [
        message({
          from: "handoff",
          agentId: "a1",
          otherAgentId: "a2",
          stopReason: "off",
        }),
      ],
      AGENTS,
    );

    assert.ok(out.includes("[14:05] роботу не передано: Рецензент → Редактор (вимкнений)"));
  });

  it("is «розмова-РРРР-ММ-ДД.txt» by the day it is written", () => {
    assert.equal(chatFileName(new Date(2026, 8, 7)), "розмова-2026-09-07.txt");
  });
});
