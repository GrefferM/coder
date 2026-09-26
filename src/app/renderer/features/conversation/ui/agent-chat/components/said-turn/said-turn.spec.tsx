import type { OpenCalls } from "../../../../hooks";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SaidTurn } from "./said-turn";
import { sayPiece } from "../../../../hooks";
import { AGENT_CHAT_ASKED_AGAIN_LABEL, AGENT_CHAT_FOUND_EDGE } from "../../constants";
import { FOUND_WORDS_BACKGROUND_COLOR } from "../../../../../../components/found-words/constants";
import { TODAY_LABEL } from "../../../../../../utils/dates/constants";
import type { Agent } from "../../../../../../interfaces";
import type { ChatMessage } from "../../../../interfaces";
import { anAgent } from "../../../../../../testing";

const AGENTS: Agent[] = [
  anAgent({
    id: "editor",
    name: "EDITOR",
    color: "#b18aff",
    x: 0,
    y: 0,
    temperature: 0.3,
  }),
  anAgent({
    id: "tester",
    name: "TESTER",
    color: "#e8c46a",
    x: 0,
    y: 0,
    temperature: 0.3,
  }),
];

function said(patch: Partial<ChatMessage> = {}): ChatMessage {
  return {
    id: "said-1",
    agentId: "editor",
    from: "agent",
    text: "Готово",
    at: new Date().toISOString(),
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

function draw(message: ChatMessage, patch: Partial<Parameters<typeof SaidTurn>[0]> = {}) {
  return render(
    <SaidTurn
      openCalls={standInOpenCalls()}
      message={message}
      agents={AGENTS}
      agentName="EDITOR"
      agentColor="#b18aff"
      isNewDay={false}
      isAskedAgain={false}
      step={null}
      onAskAgain={null}
      words={null}
      act={null}
      isAsked={false}
      onDebug={null}
      live={[]}
      isFound={false}
      looked=""
      {...patch}
    />,
  );
}

/** The chat's own memory of open calls, standing in — here nothing is open, since nobody pressed. */
function standInOpenCalls(): OpenCalls {
  return {
    isOpen: () => false,
    toggle: () => {},
    open: () => {},
  };
}

describe("SaidTurn", () => {
  it("lights the card the press drove to, and lets it go again", () => {
    // The light is what the eye finds the message by; it is not a part of the card, so it goes.
    // The shadow is inset rather than a border: a border would move the card's own by a pixel for every card here.
    const { container, rerender } = draw(said(), {
      isFound: true,
    });

    expect(container.querySelector(`[style*="${AGENT_CHAT_FOUND_EDGE}"]`)).not.toBeNull();

    rerender(
      <SaidTurn
        openCalls={standInOpenCalls()}
        message={said()}
        agents={AGENTS}
        agentName="EDITOR"
        agentColor="#b18aff"
        isNewDay={false}
        isAskedAgain={false}
        step={null}
        onAskAgain={null}
        words={null}
        act={null}
        isAsked={false}
        onDebug={null}
        live={[]}
        isFound={false}
        looked=""
      />,
    );

    expect(container.querySelector(`[style*="${AGENT_CHAT_FOUND_EDGE}"]`)).toBeNull();
  });

  it("stands the calls above the word the app says about the turn", () => {
    // A stop or a break is the end of the turn — the calls went out before it, so they stand above it.
    const { container } = draw(
      said({
        text: "",
        calls: [
          {
            id: "call-1",
            name: "browser_navigate",
            arguments: {},
            pinned: [],
            line: "",
            output: "",
            refusal: "",
            exitCode: null,
            serverId: "server-1",
            serverName: "playwright-mcp",
            isFailed: false,
            startedAt: 1_000,
            endedAt: 2_510,
          },
        ],
      }),
      {
        words: "ЗУПИНЕНО",
      },
    );

    const drawn = [...(container.querySelector("[data-said]")?.children ?? [])];
    const callAt = drawn.findIndex((one) => one.textContent?.includes("browser_navigate"));
    const wordAt = drawn.findIndex((one) => one.textContent?.includes("ЗУПИНЕНО"));

    expect(callAt).toBeGreaterThanOrEqual(0);
    expect(wordAt).toBeGreaterThan(callAt);
  });

  it("names every card by its message, so the stream has somewhere to ride to", () => {
    // The press promised that message, and the stream finds it by the id the record gave it.
    const { container } = draw(said());

    expect(container.querySelector('[data-said="said-1"]')).not.toBeNull();
  });

  it("draws an agent's own words as its card", () => {
    draw(said());

    expect(screen.getByText("Готово")).toBeInTheDocument();
    expect(screen.getByText("EDITOR")).toBeInTheDocument();
  });

  it("draws the person's own words, and no card at all where an agent said nothing", () => {
    draw(
      said({
        from: "person",
        text: "Додай кешування",
      }),
    );

    expect(screen.getByText("Додай кешування")).toBeInTheDocument();

    const { container } = draw(
      said({
        text: "",
      }),
    );

    expect(container.textContent).toBe("");
  });

  it("draws a link as a row naming both ends", () => {
    draw(
      said({
        from: "handoff",
        otherAgentId: "tester",
      }),
    );

    expect(screen.getByText("EDITOR")).toBeInTheDocument();
    expect(screen.getByText("TESTER")).toBeInTheDocument();
  });

  it("says the day over the first turn of it, and names a question asked again", () => {
    draw(said(), {
      isNewDay: true,
      isAskedAgain: true,
    });

    expect(screen.getByText(TODAY_LABEL)).toBeInTheDocument();
    expect(screen.getByText(AGENT_CHAT_ASKED_AGAIN_LABEL)).toBeInTheDocument();
  });

  it("draws nothing at all for a turn whose word the step said for it, so no hole stands in the stream", () => {
    // The rule stands at the last of the turns that broke together; the ones before it are not empty rows.
    const { container } = draw(
      said({
        text: "",
        note: "ВІДПОВІДЬ УПЕРЛАСЯ В СТЕЛЮ · 10 ТКН",
      }),
      {
        words: null,
      },
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("draws a turn that says nothing of its own but carries the step's word", () => {
    draw(
      said({
        text: "",
        note: "ВІДПОВІДЬ УПЕРЛАСЯ В СТЕЛЮ · 10 ТКН",
      }),
      {
        words: "ВІДПОВІДЬ УПЕРЛАСЯ В СТЕЛЮ · 10 ТКН",
      },
    );

    expect(screen.getByText("ВІДПОВІДЬ УПЕРЛАСЯ В СТЕЛЮ · 10 ТКН")).toBeInTheDocument();
  });

  it("puts the app's own word on the rule under the card, never inside it", () => {
    draw(
      said({
        note: "МОДЕЛЬ НЕ СКАЗАЛА НІЧОГО",
      }),
      {
        words: "МОДЕЛЬ НЕ СКАЗАЛА НІЧОГО",
      },
    );

    expect(screen.getByText("МОДЕЛЬ НЕ СКАЗАЛА НІЧОГО")).toBeInTheDocument();
  });

  it("stands the turns still out of this question at the end of its block, in their own names", () => {
    sayPiece("turn-1", "Пишу…", null);
    draw(said(), {
      live: [
        {
          turnId: "turn-1",
          agentId: "tester",
          startedAt: Date.now(),
          questionId: "question-1",
          askedAt: 1,
        },
      ],
    });

    // The turn out is another agent's, and what it has said so far stands in that agent's own name.
    expect(screen.getByText("TESTER")).toBeInTheDocument();
    expect(screen.getByText("Пишу…")).toBeInTheDocument();
  });

  it("lights the searched word inside an agent's own answer", () => {
    // Every match in the stream wears the accent, and not the one the stream stands on alone.
    draw(
      said({
        text: "Поклав кешування у fetchUser",
      }),
      {
        looked: "кеш",
      },
    );

    expect(screen.getByText("кеш")).toHaveStyle({
      background: FOUND_WORDS_BACKGROUND_COLOR,
    });
  });

  it("lights it inside the person's own question too", () => {
    draw(
      said({
        from: "person",
        text: "Перевір, чи не тримає кеш старі сесії",
      }),
      {
        looked: "кеш",
      },
    );

    expect(screen.getByText("кеш")).toHaveStyle({
      background: FOUND_WORDS_BACKGROUND_COLOR,
    });
  });

  it("lights nothing in a card the search counts no place in", () => {
    // The app's own words are no place to walk to, so lighting them would promise one.
    const { container } = draw(
      said({
        notStarted: "noAddress",
        text: "Локальний провайдер не відповідає за своєю адресою",
      }),
      {
        looked: "провайдер",
      },
    );

    expect(container.querySelector(`[style*="${FOUND_WORDS_BACKGROUND_COLOR}"]`)).toBeNull();
  });
});
