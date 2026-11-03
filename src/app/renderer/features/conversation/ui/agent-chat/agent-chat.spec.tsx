import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AgentChat } from "./agent-chat";
import { sayPiece, useOpenCalls } from "../../hooks";
import { moneyLabel, tokensLabel } from "../../../../utils/numbers";
import { timeLabel } from "../../../../utils/dates";
import { HANDOFF_ROW_STOPPED_LABEL } from "./components/handoff-row/constants";
import { WORK_CARD_LABEL } from "./components/work-card/constants";
import { SAID_ROW_AGAIN_LABEL } from "./components/said-row/constants";
import {
  NOT_STARTED_ENDS,
  NOT_STARTED_DRAFT_NOTE,
  CHAT_FAILED_NOTE,
  CHAT_SAID_NOTHING_NOTE,
  CHAT_STEP_BROKEN_NOTE,
  CHAT_STOP_REASON_LABELS,
  CHAT_STOPPED_NOTE,
} from "../../constants";
import { answerCeilingNote } from "../../words";
import { RUN_STATE_LABELS } from "../../../record";
import {
  AGENT_CHAT_OPENED_FAILED_NOTE,
  AGENT_CHAT_FIELD_PLACEHOLDER_PREFIX,
  AGENT_CHAT_NO_AIM_HINT,
  AGENT_CHAT_NO_AIM_PLACEHOLDER,
  AGENT_CHAT_OFF_HINT,
  AGENT_CHAT_OFF_PLACEHOLDER,
  AGENT_CHAT_SEND_LABEL,
  AGENT_CHAT_STOP_LABEL,
  AGENT_CHAT_STOP_BLINK_CLASS,
  AGENT_CHAT_FIELD_GROUNDS,
  AGENT_CHAT_WALKING_PLACEHOLDER,
} from "./constants";
import {
  CALL_ROW_FROM_MODEL_LABEL,
  CALL_ROW_NO_OUTPUT_YET_LABEL,
  CALL_ROW_PINNED_LABEL,
  CALL_ROW_CODE_LABEL,
  CALL_ROW_REFUSED_LABEL,
  CALL_ROW_RUNNING_LABEL,
} from "./components/call-row/constants";
import { DEBUG_BAND_LABEL } from "../../../projection/ui/debug-band/constants";
import type { WorkingAgent } from "../../../../interfaces";
import type { AgentChatProps, ChatActs, ChatAimed, ChatBand, ChatField, ChatSaid } from "./interfaces";
import { anAgent } from "../../../../testing";

/** What one case changes; everything left out stands as the fixture sets it. */
interface ChatOverrides {
  aimed?: Partial<ChatAimed>;
  said?: Partial<ChatSaid>;
  field?: Partial<ChatField>;
  band?: Partial<ChatBand>;
  acts?: Partial<ChatActs>;
}

/**
 * The chat's own state holds the open-calls memory and the catalogue reaches the same one, so presses on a row work.
 */
function Chat(props: AgentChatProps) {
  const openCalls = useOpenCalls();

  return (
    <AgentChat
      {...props}
      said={{
        ...props.said,
        openCalls,
      }}
    />
  );
}

function renderChat(overrides: ChatOverrides = {}) {
  return render(
    <Chat
      aimed={{
        id: "agent-1",
        name: "EDITOR",
        color: "#38a3ff",
        isActive: true,
        waiting: null,
        ...overrides.aimed,
      }}
      said={{
        messages: [],
        agents: [],
        working: [],
        // The wrapper hands over the real memory; this one exists only because the part requires it.
        openCalls: {
          isOpen: () => false,
          toggle: () => {},
          open: () => {},
        },
        saidAgain: [],
        foundId: null,
        ...overrides.said,
      }}
      field={{
        draft: "Прогони тести",
        height: null,
        isWalking: false,
        onDraftChange: () => {},
        onHeight: () => {},
        attachments: [],
        onAttach: () => {},
        onDetach: () => {},
        onSend: () => {},
        onStop: () => {},
        repeats: 1,
        onRepeats: () => {},
        repeating: null,
        ...overrides.field,
      }}
      band={{
        head: null,
        onExport: null,
        search: {
          query: "",
          isTyping: false,
          at: 0,
          found: 0,
          onQuery: () => {},
          onOpen: () => {},
          onClose: () => {},
          onNext: () => {},
          onPrevious: () => {},
        },
        ...overrides.band,
      }}
      acts={{
        onOpenProviders: () => {},
        onOpenSettings: () => {},
        onOpenPrompt: () => {},
        onOpenGrants: () => {},
        onOpenModel: () => {},
        onShowConsent: () => {},
        onAskAgain: () => {},
        onOpenDebug: null,
        ...overrides.acts,
      }}
    />,
  );
}

/** One turn still out, in the block of the given question. */
function working(turnId: string, questionId = "question-0", askedAt = 0): WorkingAgent {
  return {
    turnId,
    agentId: "agent-1",
    startedAt: Date.now(),
    questionId,
    askedAt,
  };
}

/** The person's question one live turn stands under; a card needs its block. */
function asked(questionId: string) {
  return {
    id: `asked-${questionId}`,
    agentId: "agent-1",
    from: "person" as const,
    text: "Прогони тести",
    note: null,
    at: new Date().toISOString(),
    questionId,
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
    asked: null,
    fedBy: [],
    attached: [],
    compressed: null,
  };
}

describe("AgentChat", () => {
  it("asks nothing of a switched-off agent: the field is shut and the line names the way back", () => {
    renderChat({
      aimed: {
        isActive: false,
      },
    });

    expect(screen.getByLabelText(`${AGENT_CHAT_FIELD_PLACEHOLDER_PREFIX}EDITOR`)).toBeDisabled();
    expect(screen.getByPlaceholderText(AGENT_CHAT_OFF_PLACEHOLDER)).toBeInTheDocument();
    expect(screen.getByText(AGENT_CHAT_OFF_HINT)).toBeInTheDocument();
  });

  it("does not send what was already typed when the agent is off", async () => {
    const onSend = vi.fn();

    renderChat({
      aimed: {
        isActive: false,
      },
      field: {
        onSend: onSend,
      },
    });
    await userEvent.click(screen.getByLabelText(AGENT_CHAT_SEND_LABEL));

    expect(onSend).not.toHaveBeenCalled();
  });

  it("sends what was typed while the agent is on", async () => {
    const onSend = vi.fn();

    renderChat({
      field: {
        onSend: onSend,
      },
    });

    await userEvent.click(screen.getByLabelText(AGENT_CHAT_SEND_LABEL));

    expect(onSend).toHaveBeenCalled();
  });

  it("sends nothing while this conversation walks: the hand under the field is the stop", async () => {
    const onSend = vi.fn();

    renderChat({
      said: {
        working: [working("turn-1")],
      },
      field: {
        onSend: onSend,
        isWalking: true,
      },
    });
    await userEvent.click(screen.getByLabelText(AGENT_CHAT_SEND_LABEL));

    // One button under the field, «ЗУПИНИТИ» while something is out; typed text waits.
    expect(onSend).not.toHaveBeenCalled();
    expect(screen.getByText(AGENT_CHAT_STOP_LABEL)).toBeInTheDocument();
    expect(screen.getByLabelText(`${AGENT_CHAT_FIELD_PLACEHOLDER_PREFIX}EDITOR`)).toHaveValue("Прогони тести");
  });

  it("shows work that arrived under the sender's name, with what that turn cost", () => {
    renderChat({
      said: {
        agents: [
          anAgent({
            id: "collector",
            name: "ЗБИРАЧ",
            modelId: "model",
            color: "#b18aff",
            x: 0,
            y: 0,
            temperature: 0.3,
          }),
        ],
        messages: [
          {
            id: "arrived",
            agentId: "agent-1",
            from: "supplier",
            text: "ЗІБРАНО: 5 файлів",
            at: new Date().toISOString(),
            questionId: "question-0",
            askedAt: 0,
            cost: {
              inputTokens: 3947,
              outputTokens: 232,
              money: 0.00031,
            },
            answerCeiling: null,
            otherAgentId: "collector",
            stopReason: null,
            isFailure: false,
            notStarted: null,
            wouldGo: null,
            waitsFor: null,
            began: null,
            stepId: null,
            walkId: null,
            asked: null,
            fedBy: [],
            attached: [],
            compressed: null,
            note: null,
            calls: [],
          },
        ],
      },
    });

    expect(screen.getByText("ЗБИРАЧ")).toBeInTheDocument();
    expect(screen.getByText(new RegExp(tokensLabel(3947, 232)))).toBeInTheDocument();
    expect(screen.getByText((text) => text.includes(moneyLabel(0.00031)))).toBeInTheDocument();
  });

  it("says the run ended at a switched-off neighbour instead of leaving the line silent", () => {
    renderChat({
      said: {
        agents: [
          anAgent({
            id: "reporter",
            name: "ЗВІТАР",
            modelId: "model",
            isActive: false,
            x: 0,
            y: 0,
            temperature: 0.3,
          }),
        ],
        messages: [
          {
            id: "not-sent",
            agentId: "agent-1",
            from: "handoff",
            text: "",
            at: new Date().toISOString(),
            questionId: "question-0",
            askedAt: 0,
            cost: null,
            answerCeiling: null,
            otherAgentId: "reporter",
            stopReason: "off",
            isFailure: false,
            notStarted: null,
            wouldGo: null,
            waitsFor: null,
            began: null,
            stepId: null,
            walkId: null,
            asked: null,
            fedBy: [],
            attached: [],
            compressed: null,
            note: null,
            calls: [],
          },
        ],
      },
    });

    expect(screen.getByText(HANDOFF_ROW_STOPPED_LABEL)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(CHAT_STOP_REASON_LABELS.off))).toBeInTheDocument();
  });

  it("stands a refused call and a running one as rows of the running card, newest last", async () => {
    // Calls arrive at the turn piece by piece and its card reads them.
    sayPiece("turn-calls", "", {
      id: "call-1",
      source: "command",
      name: "find_deep",
      arguments: {
        depth: "швидко",
      },
      pinned: [],
      line: "",
      output: "",
      refusal: "[find_deep не запустилась: depth — має бути числом, прийшло «швидко»]",
      exitCode: null,
      serverId: null,
      serverName: "",
      isFailed: false,
      startedAt: 1,
      endedAt: 2,
      state: "refused",
    });
    sayPiece("turn-calls", "", {
      id: "call-2",
      source: "command",
      name: "find_deep",
      arguments: {
        depth: "2",
        root: "src/",
      },
      pinned: ["root"],
      line: "",
      output: "",
      refusal: "",
      exitCode: null,
      serverId: null,
      serverName: "",
      isFailed: false,
      startedAt: Date.now(),
      endedAt: 0,
      state: "running",
    });
    renderChat({
      said: {
        messages: [asked("question-0")],
        working: [working("turn-calls")],
      },
    });

    // Both stand as lines, the one still out included; a dozen calls make a dozen lines.
    expect(screen.getByText(CALL_ROW_REFUSED_LABEL)).toBeInTheDocument();
    expect(
      screen.getByText(CALL_ROW_RUNNING_LABEL, {
        exact: false,
      }),
    ).toBeInTheDocument();
    expect(screen.queryByText(CALL_ROW_NO_OUTPUT_YET_LABEL)).not.toBeInTheDocument();

    await userEvent.click(
      screen.getByText(CALL_ROW_RUNNING_LABEL, {
        exact: false,
      }),
    );

    // Opened by hand, the call still out shows what it was called with and whose each argument is.
    expect(screen.getByText(CALL_ROW_NO_OUTPUT_YET_LABEL)).toBeInTheDocument();
    expect(screen.getByText(CALL_ROW_PINNED_LABEL)).toBeInTheDocument();
    expect(screen.getAllByText(CALL_ROW_FROM_MODEL_LABEL)).toHaveLength(1);
  });

  it("opens a call the person clicks, and says what it was refused with", async () => {
    sayPiece("turn-refused", "", {
      id: "call-1",
      source: "command",
      name: "find_deep",
      arguments: {
        depth: "швидко",
      },
      pinned: [],
      line: "",
      output: "",
      refusal: "[find_deep не запустилась: depth — має бути числом, прийшло «швидко»]",
      exitCode: null,
      serverId: null,
      serverName: "",
      isFailed: false,
      startedAt: 1,
      endedAt: 2,
      state: "refused",
    });
    renderChat({
      said: {
        messages: [asked("question-0")],
        working: [working("turn-refused")],
      },
    });

    expect(screen.queryByText(/не запустилась: depth/)).not.toBeInTheDocument();

    await userEvent.click(screen.getByText(CALL_ROW_REFUSED_LABEL));

    expect(screen.getByText(/не запустилась: depth/)).toBeInTheDocument();
  });

  it("keeps the calls of a finished turn in the stream, folded into their lines", async () => {
    renderChat({
      said: {
        messages: [
          {
            id: "message-1",
            agentId: "agent-1",
            from: "agent",
            text: "ЗНАЙДЕНО\n- report.md",
            at: new Date().toISOString(),
            questionId: "question-0",
            askedAt: 0,
            cost: null,
            answerCeiling: null,
            otherAgentId: null,
            stopReason: null,
            isFailure: false,
            notStarted: null,
            wouldGo: null,
            waitsFor: null,
            began: null,
            stepId: null,
            walkId: null,
            asked: null,
            fedBy: [],
            attached: [],
            compressed: null,
            note: null,
            calls: [
              {
                id: "call-1",
                source: "command",
                name: "find_deep",
                arguments: {
                  depth: "2",
                },
                pinned: [],
                line: "find . -maxdepth 2",
                output: "report.md",
                refusal: "",
                exitCode: 0,
                serverId: null,
                serverName: "",
                isFailed: false,
                startedAt: 1,
                endedAt: 9,
              },
            ],
          },
        ],
      },
    });

    // The card has burned down; the call remains, folded, and opens to what it ran.
    expect(screen.getByText(`${CALL_ROW_CODE_LABEL}0`)).toBeInTheDocument();
    expect(screen.queryByText(/maxdepth/)).not.toBeInTheDocument();

    await userEvent.click(screen.getByText(`${CALL_ROW_CODE_LABEL}0`));

    expect(screen.getByText(/maxdepth/)).toBeInTheDocument();
  });

  it("stands with the stream and no aim when nobody was asked yet", () => {
    renderChat({
      aimed: {
        id: null,
        name: "",
        isActive: false,
      },
    });

    expect(screen.getByPlaceholderText(AGENT_CHAT_NO_AIM_PLACEHOLDER)).toBeDisabled();
    expect(screen.getByText(AGENT_CHAT_NO_AIM_HINT)).toBeInTheDocument();
  });

  it("keeps the field while a run of the history is open, since it is a conversation to go on with", () => {
    renderChat({
      band: {
        head: {
          at: new Date("2026-08-22T19:27:00"),
          state: "done",
          isOpened: true,
          isFailed: false,
        },
      },
    });

    // A run opened from the history is not a page to read; the way out is the tabs'. The stream has a second field, so
    // this one is named: the composer must still be there.
    expect(screen.getByLabelText(`${AGENT_CHAT_FIELD_PLACEHOLDER_PREFIX}EDITOR`)).toBeInTheDocument();
    expect(screen.getByText(RUN_STATE_LABELS.done)).toBeInTheDocument();
  });

  it("says when the run it was told to open could not be read, rather than standing empty", () => {
    renderChat({
      band: {
        head: {
          at: new Date("2026-08-22T19:27:00"),
          state: "done",
          isOpened: true,
          isFailed: true,
        },
      },
    });

    expect(screen.getByText(AGENT_CHAT_OPENED_FAILED_NOTE)).toBeInTheDocument();
  });

  it("stands the app's own words on the rule and keeps the card for the model's", () => {
    renderChat({
      said: {
        messages: [
          {
            id: "cut",
            agentId: "agent-1",
            from: "agent",
            text: "Половина відповіді",
            note: "Зупинено",
            at: new Date().toISOString(),
            questionId: "question-0",
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
            asked: null,
            fedBy: [],
            attached: [],
            compressed: null,
          },
        ],
      },
    });

    // What the model said keeps its card; what the app said stands outside every card.
    expect(screen.getByText("Половина відповіді")).toBeInTheDocument();
    expect(screen.getByText("Зупинено")).toHaveClass("font-monospace", "text-uppercase");
  });

  it.each([CHAT_FAILED_NOTE, CHAT_STOPPED_NOTE, CHAT_SAID_NOTHING_NOTE, answerCeilingNote(4096)])(
    "offers the repeat under «%s», since it is a turn that happened and came back with nothing",
    (note) => {
      const onAskAgain = vi.fn();

      renderChat({
        said: {
          messages: [
            {
              id: "fell",
              agentId: "agent-1",
              from: "agent",
              text: "",
              note,
              at: new Date().toISOString(),
              questionId: "question-0",
              askedAt: 0,
              cost: null,
              answerCeiling: null,
              otherAgentId: null,
              stopReason: null,
              isFailure: note === CHAT_FAILED_NOTE,
              notStarted: null,
              wouldGo: null,
              waitsFor: null,
              calls: [],
              began: null,
              stepId: null,
              walkId: null,
              asked: "Підсумуй, що змінилось",
              fedBy: [],
              attached: [],
              compressed: null,
            },
          ],
        },
        acts: {
          onAskAgain: onAskAgain,
        },
      });

      // The repeat stands under one sentence; the act is the same for all of them.
      screen.getByText(SAID_ROW_AGAIN_LABEL).click();

      expect(onAskAgain).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "fell",
        }),
      );
    },
  );

  it("says one word about a step that broke, however many agents were working on it", () => {
    // They broke together, so they share one walk.
    const cut = (id: string, agentId: string) => ({
      id,
      agentId,
      walkId: "walk-1",
      from: "agent" as const,
      text: "",
      note: CHAT_STOPPED_NOTE,
      at: new Date().toISOString(),
      questionId: "question-0",
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
      asked: "Підсумуй, що змінилось",
      fedBy: [],
      attached: [],
      compressed: null,
    });

    renderChat({
      said: {
        messages: [cut("one", "agent-1"), cut("other", "agent-2")],
      },
    });

    // A step of the walk breaks, not one turn of it: the word and the act are one, and the word is the end every turn
    // came to.
    expect(screen.getAllByText(CHAT_STOPPED_NOTE)).toHaveLength(1);
    expect(screen.getAllByText(SAID_ROW_AGAIN_LABEL)).toHaveLength(1);
  });

  it("says the general word about a step whose turns ended differently, not one end of the three", () => {
    const cut = (id: string, agentId: string, note: string) => ({
      id,
      agentId,
      walkId: "walk-1",
      from: "agent" as const,
      text: "",
      note,
      at: new Date().toISOString(),
      questionId: "question-0",
      askedAt: 0,
      cost: null,
      answerCeiling: null,
      otherAgentId: null,
      stopReason: null,
      isFailure: note === CHAT_FAILED_NOTE,
      notStarted: null,
      wouldGo: null,
      waitsFor: null,
      calls: [],
      began: null,
      stepId: null,
      asked: "Підсумуй, що змінилось",
      fedBy: [],
      attached: [],
      compressed: null,
    });

    renderChat({
      said: {
        messages: [
          cut("fell", "agent-1", CHAT_FAILED_NOTE),
          cut("silent", "agent-2", CHAT_SAID_NOTHING_NOTE),
          cut("ceiling", "agent-3", answerCeilingNote(4096)),
        ],
      },
    });

    // No end is true of all three, so the general word is said and the ends stay in the step's record.
    expect(screen.getByText(CHAT_STEP_BROKEN_NOTE)).toBeInTheDocument();
    expect(screen.queryByText(CHAT_FAILED_NOTE)).not.toBeInTheDocument();
    expect(screen.queryByText(answerCeilingNote(4096))).not.toBeInTheDocument();
    expect(screen.getAllByText(SAID_ROW_AGAIN_LABEL)).toHaveLength(1);
  });

  it("offers the repeat under every turn that never began, the ceiling's own among them", () => {
    const onAskAgain = vi.fn();
    const unbegun = (id: string, reason: "noKey" | "tooLong") => ({
      id,
      agentId: "agent-1",
      from: "agent" as const,
      text: "У провайдера немає ключа",
      note: null,
      at: new Date().toISOString(),
      questionId: "question-0",
      askedAt: 0,
      cost: null,
      answerCeiling: null,
      otherAgentId: null,
      stopReason: null,
      isFailure: false,
      notStarted: reason,
      wouldGo: null,
      waitsFor: null,
      calls: [],
      began: null,
      stepId: null,
      walkId: null,
      asked: "Підсумуй, що змінилось",
      fedBy: [],
      attached: [],
      compressed: null,
    });

    renderChat({
      said: {
        messages: [unbegun("no-key", "noKey")],
      },
      acts: {
        onAskAgain: onAskAgain,
      },
    });

    // The walk reached an agent it cannot ask: a break like any other with the same act; the card's own act is about
    // the cause, this one about the turn.
    screen.getByText(SAID_ROW_AGAIN_LABEL).click();
    expect(onAskAgain).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "no-key",
      }),
    );

    cleanup();
    renderChat({
      said: {
        messages: [unbegun("too-long", "tooLong")],
      },
      acts: {
        onAskAgain: onAskAgain,
      },
    });

    // No exception remains: the card's own act raises the ceiling and the same words go through.
    screen.getByText(SAID_ROW_AGAIN_LABEL).click();
    expect(onAskAgain).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "too-long",
      }),
    );
  });

  it("trims a turn that never began to its own words once a step went after it", () => {
    const unbegun = {
      id: "no-key",
      agentId: "agent-1",
      from: "agent" as const,
      text: "Модель hy-mt2 належить провайдеру OpenAI, а ключа до нього немає.",
      note: null,
      at: new Date().toISOString(),
      questionId: "question-0",
      askedAt: 0,
      cost: null,
      answerCeiling: null,
      otherAgentId: null,
      stopReason: null,
      isFailure: false,
      notStarted: "noKey" as const,
      wouldGo: null,
      waitsFor: null,
      calls: [],
      began: null,
      stepId: null,
      walkId: null,
      asked: "Підсумуй, що змінилось",
      fedBy: [],
      attached: [],
      compressed: null,
    };
    const answered = {
      ...unbegun,
      id: "answered",
      text: "ІННОВАЦІЇ, СЕРВІС, КОМАНДА",
      notStarted: null,
    };

    renderChat({
      said: {
        messages: [unbegun, answered],
      },
    });

    // The card keeps its own words as written.
    expect(screen.getByText(unbegun.text)).toBeInTheDocument();
    // The step went on, so neither act stands.
    expect(screen.queryByText(SAID_ROW_AGAIN_LABEL)).not.toBeInTheDocument();
    expect(screen.queryByText(NOT_STARTED_ENDS.noKey.actLabel)).not.toBeInTheDocument();
  });

  it("«ПОКАЗАТИ, ЩО ЗАПУСТИТЬСЯ» opens the window over the very server the turn waited on, by its id", async () => {
    const onShowConsent = vi.fn();
    const waited = {
      id: "no-consent",
      agentId: "agent-1",
      from: "agent" as const,
      text: "exa-mcp ще не запускали на цій машині — його рядок запуску чекає вашої згоди.",
      note: null,
      at: new Date().toISOString(),
      questionId: "question-0",
      askedAt: 0,
      cost: null,
      answerCeiling: null,
      otherAgentId: null,
      stopReason: null,
      isFailure: false,
      notStarted: "noConsent" as const,
      wouldGo: null,
      waitsFor: "99999999-9999-4999-8999-999999999999",
      calls: [],
      began: null,
      stepId: null,
      walkId: null,
      asked: "Знайди статті",
      fedBy: [],
      attached: [],
      compressed: null,
    };

    renderChat({
      said: {
        messages: [waited],
      },
      acts: {
        onShowConsent,
      },
    });

    await userEvent.click(screen.getByText("ПОКАЗАТИ, ЩО ЗАПУСТИТЬСЯ"));

    expect(onShowConsent).toHaveBeenCalledWith("99999999-9999-4999-8999-999999999999");
    // The turn can still be asked again once the line is agreed to.
    expect(screen.getByText(SAID_ROW_AGAIN_LABEL)).toBeInTheDocument();
  });

  it("stands a turn whose provider is off under its own word, and its act opens the providers", async () => {
    const onOpenProviders = vi.fn();
    const off = {
      id: "provider-off",
      agentId: "agent-1",
      from: "agent" as const,
      text: "Провайдер Anthropic вимкнено на цій машині. Увімкніть його в розділі «Провайдери», і агент піде.",
      note: null,
      at: new Date().toISOString(),
      questionId: "question-0",
      askedAt: 0,
      cost: null,
      answerCeiling: null,
      otherAgentId: null,
      stopReason: null,
      isFailure: false,
      notStarted: "providerOff" as const,
      wouldGo: null,
      waitsFor: null,
      calls: [],
      began: null,
      stepId: null,
      walkId: null,
      asked: "Підсумуй, що змінилось",
      fedBy: [],
      attached: [],
      compressed: null,
    };

    renderChat({
      said: {
        messages: [off],
      },
      acts: {
        onOpenProviders,
      },
    });

    expect(screen.getByText("ПРОВАЙДЕР ВИМКНЕНО")).toBeInTheDocument();
    expect(screen.getByText(off.text)).toBeInTheDocument();

    await userEvent.click(screen.getByText(NOT_STARTED_ENDS.providerOff.actLabel));

    expect(onOpenProviders).toHaveBeenCalledTimes(1);
  });

  it("says the words are back in the field only while the field holds them", () => {
    const unbegun = {
      id: "no-key",
      agentId: "agent-1",
      from: "agent" as const,
      text: "Модель hy-mt2 належить провайдеру OpenAI, а ключа до нього немає.",
      note: null,
      at: new Date().toISOString(),
      questionId: "question-0",
      askedAt: 0,
      cost: null,
      answerCeiling: null,
      otherAgentId: null,
      stopReason: null,
      isFailure: false,
      notStarted: "noKey" as const,
      wouldGo: null,
      waitsFor: null,
      calls: [],
      began: null,
      stepId: null,
      walkId: null,
      asked: "Прогони тести",
      fedBy: [],
      attached: [],
      compressed: null,
    };

    renderChat({
      said: {
        messages: [unbegun],
      },
      field: {
        draft: unbegun.asked,
      },
    });

    // Nothing went, so the words stay in the field and the card says so.
    expect(screen.getByText(NOT_STARTED_DRAFT_NOTE)).toBeInTheDocument();

    cleanup();
    renderChat({
      said: {
        messages: [unbegun],
      },
      field: {
        draft: "",
      },
    });

    // The same card read back from the record put nothing in the field, so it promises nothing.
    expect(screen.queryByText(NOT_STARTED_DRAFT_NOTE)).not.toBeInTheDocument();
  });

  it("takes the card's own act away the moment the turn is asked again, not when the answer lands", () => {
    const unbegun = {
      id: "no-key",
      agentId: "agent-1",
      from: "agent" as const,
      text: "Модель hy-mt2 належить провайдеру OpenAI, а ключа до нього немає.",
      note: null,
      at: new Date().toISOString(),
      questionId: "question-0",
      askedAt: 0,
      cost: null,
      answerCeiling: null,
      otherAgentId: null,
      stopReason: null,
      isFailure: false,
      notStarted: "noKey" as const,
      wouldGo: null,
      waitsFor: null,
      calls: [],
      began: null,
      stepId: null,
      walkId: null,
      asked: "Прогони тести",
      fedBy: [],
      attached: [],
      compressed: null,
    };

    renderChat({
      said: {
        messages: [unbegun],
        saidAgain: ["no-key"],
      },
      field: {
        draft: unbegun.asked,
      },
    });

    // The asking answered the turn, so the repeat, the card's act and the field line all go; the new turn is already
    // out.
    expect(screen.queryByText(SAID_ROW_AGAIN_LABEL)).not.toBeInTheDocument();
    expect(screen.queryByText(NOT_STARTED_ENDS.noKey.actLabel)).not.toBeInTheDocument();
    expect(screen.queryByText(NOT_STARTED_DRAFT_NOTE)).not.toBeInTheDocument();
    // The card keeps its words as written.
    expect(screen.getByText(unbegun.text)).toBeInTheDocument();
  });

  it("stands a turn still out at the end of its own question, not at the end of the stream", () => {
    const card = (
      id: string,
      from: "person" | "agent",
      text: string,
      askedAt: number,
      walkId: string | null = null,
    ) => ({
      id,
      agentId: "agent-1",
      from,
      text,
      note: null,
      at: new Date().toISOString(),
      questionId: `question-${askedAt}`,
      askedAt,
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
      walkId,
      asked: null,
      fedBy: [],
      attached: [],
      compressed: null,
    });

    renderChat({
      said: {
        messages: [
          card("asked-1", "person", "Перше питання", 1, "walk-1"),
          card("said-1", "agent", "Перша відповідь", 1, "walk-1"),
          card("asked-2", "person", "Друге питання", 2),
        ],
        working: [
          {
            turnId: "turn-1",
            agentId: "agent-2",
            startedAt: Date.now(),
            questionId: "question-1",
            askedAt: 1,
          },
        ],
      },
    });

    // The turn belongs to the first question; the second stands below it.
    const out = screen.getByText(WORK_CARD_LABEL, {
      exact: false,
    });
    const asked = screen.getByText("Друге питання");

    expect(out.compareDocumentPosition(asked) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("stands a turn in each question's block when two walks run at once", () => {
    // One agent works in both walks; neither block is the only one saying so.
    const card = (id: string, text: string, askedAt: number) => ({
      id,
      agentId: "agent-1",
      from: "person" as const,
      text,
      note: null,
      at: new Date().toISOString(),
      questionId: `question-${askedAt}`,
      askedAt,
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
      asked: null,
      fedBy: [],
      attached: [],
      compressed: null,
    });

    sayPiece("turn-first", "Перша робота", null);
    sayPiece("turn-second", "Друга робота", null);
    renderChat({
      said: {
        messages: [card("asked-1", "Перше питання", 1), card("asked-2", "Друге питання", 2)],
        working: [working("turn-first", "question-1", 1), working("turn-second", "question-2", 2)],
      },
    });

    expect(
      screen.getAllByText(WORK_CARD_LABEL, {
        exact: false,
      }),
    ).toHaveLength(2);
    expect(screen.getByText("Перша робота")).toBeInTheDocument();
    expect(screen.getByText("Друга робота")).toBeInTheDocument();
  });

  it("draws no card for a turn whose question is no word of this stream", () => {
    // A run opened from the history shows its own walks; work of another run shows on the canvas, not at the end of
    // this stream.
    sayPiece("turn-elsewhere", "Робота іншої розмови", null);
    renderChat({
      said: {
        messages: [asked("question-1")],
        working: [working("turn-elsewhere", "question-2", 2)],
      },
    });

    expect(
      screen.queryByText(WORK_CARD_LABEL, {
        exact: false,
      }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Робота іншої розмови")).not.toBeInTheDocument();
  });

  it("heads a live turn with its step and hour, the same as one read out of a run", () => {
    // Live and read streams are one stream; a live card says no less.
    const began = new Date("2026-08-22T19:27:00");
    const card = (id: string, from: "person" | "agent", text: string, fedBy: string[] = []) => ({
      id,
      agentId: "agent-1",
      from,
      text,
      note: null,
      at: new Date("2026-08-22T19:27:04").toISOString(),
      questionId: "question-1",
      askedAt: 1,
      cost:
        from === "agent"
          ? {
              inputTokens: 3947,
              outputTokens: 232,
              money: 0.00031,
            }
          : null,
      answerCeiling: from === "agent" ? 4096 : null,
      otherAgentId: null,
      stopReason: null,
      isFailure: false,
      notStarted: null,
      wouldGo: null,
      waitsFor: null,
      calls: [],
      // A live turn is not written yet, so it has no step id, only when it began.
      began: from === "agent" ? began.toISOString() : null,
      stepId: null,
      walkId: null,
      asked: null,
      fedBy,
      attached: [],
      compressed: null,
    });

    renderChat({
      said: {
        messages: [card("asked-1", "person", "Знайди файли"), card("said-1", "agent", "Знайшов")],
      },
    });

    expect(screen.getByText(`КРОК 1 · ${timeLabel(began)}`)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(tokensLabel(3947, 232)))).toBeInTheDocument();
  });

  it("opens the projection from the question whose pass it is, and only where that pass has turns", () => {
    const onOpenDebug = vi.fn();
    const card = (
      id: string,
      from: "person" | "agent",
      text: string,
      askedAt: number,
      walkId: string | null = null,
    ) => ({
      id,
      agentId: "agent-1",
      from,
      text,
      note: null,
      at: new Date().toISOString(),
      questionId: `question-${askedAt}`,
      askedAt,
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
      walkId,
      asked: null,
      fedBy: [],
      attached: [],
      compressed: null,
    });

    renderChat({
      said: {
        messages: [
          card("asked-1", "person", "Перше питання", 1, "walk-1"),
          card("said-1", "agent", "Перша відповідь", 1, "walk-1"),
          // This one went nowhere, so it has no pass to look into.
          card("asked-2", "person", "Друге питання", 2),
        ],
      },
      acts: {
        onOpenDebug: onOpenDebug,
      },
    });

    // One way in, on the question that walked, naming the question by its own id.
    const ways = screen.getAllByText(DEBUG_BAND_LABEL);

    expect(ways).toHaveLength(1);
    ways[0].click();
    expect(onOpenDebug).toHaveBeenCalledWith("question-1");
  });

  it("keeps the act under a break of an older question, since a newer one is no answer to it", () => {
    const onAskAgain = vi.fn();
    const card = (id: string, from: "person" | "agent", text: string, note: string | null, askedAt: number) => ({
      id,
      agentId: "agent-1",
      from,
      text,
      note,
      at: new Date().toISOString(),
      questionId: `question-${askedAt}`,
      askedAt,
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
      asked: from === "agent" ? "Прогони тести" : null,
      fedBy: [],
      attached: [],
      compressed: null,
    });

    renderChat({
      said: {
        messages: [
          card("asked-1", "person", "Перше питання", null, 1),
          card("broke", "agent", "", CHAT_STOPPED_NOTE, 1),
          card("asked-2", "person", "Друге питання", null, 2),
        ],
      },
      acts: {
        onAskAgain: onAskAgain,
      },
    });

    // The person asked the second question before seeing the break, so the act stands under the last thing said in its
    // own question.
    screen.getByText(SAID_ROW_AGAIN_LABEL).click();
    expect(onAskAgain).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "broke",
      }),
    );
  });

  it("offers the repeat under a link the work could not go down, since the walk ended there", () => {
    const onAskAgain = vi.fn();

    renderChat({
      said: {
        messages: [
          {
            id: "not-handed",
            agentId: "agent-1",
            from: "handoff" as const,
            text: "",
            note: null,
            at: new Date().toISOString(),
            questionId: "question-3",
            askedAt: 3,
            cost: null,
            answerCeiling: null,
            otherAgentId: "agent-2",
            stopReason: "off" as const,
            isFailure: false,
            notStarted: null,
            wouldGo: null,
            waitsFor: null,
            calls: [],
            began: null,
            stepId: null,
            walkId: null,
            asked: null,
            fedBy: [],
            attached: [],
            compressed: null,
          },
        ],
      },
      acts: {
        onAskAgain: onAskAgain,
      },
    });

    // The row already says what happened, so the act needs no sentence.
    screen.getByText(SAID_ROW_AGAIN_LABEL).click();
    expect(onAskAgain).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "not-handed",
      }),
    );
  });

  it("takes the repeat away from a turn already asked again", () => {
    renderChat({
      said: {
        messages: [
          {
            id: "silent",
            agentId: "agent-1",
            from: "agent",
            text: "",
            note: CHAT_SAID_NOTHING_NOTE,
            at: new Date().toISOString(),
            questionId: "question-0",
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
            asked: "Підсумуй, що змінилось",
            fedBy: [],
            attached: [],
            compressed: null,
          },
        ],
        saidAgain: ["silent"],
      },
    });

    // The act is spent; its answer stands lower in the stream.
    expect(screen.queryByText(SAID_ROW_AGAIN_LABEL)).not.toBeInTheDocument();
  });

  it("takes the repeat away from a turn something was asked after — only the fact of it stays", () => {
    renderChat({
      said: {
        messages: [
          {
            id: "stopped",
            agentId: "agent-1",
            from: "agent",
            text: "",
            note: CHAT_STOPPED_NOTE,
            at: new Date().toISOString(),
            questionId: "question-0",
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
            asked: "Підсумуй, що змінилось",
            fedBy: [],
            attached: [],
            compressed: null,
          },
          {
            id: "next",
            agentId: "agent-1",
            from: "person",
            text: "Тоді порахуй файли",
            note: null,
            at: new Date().toISOString(),
            questionId: "question-0",
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
            asked: null,
            fedBy: [],
            attached: [],
            compressed: null,
          },
        ],
      },
    });

    // The person has gone on, so the sentence stays as the plain fact.
    expect(screen.queryByText(SAID_ROW_AGAIN_LABEL)).not.toBeInTheDocument();
  });

  it("offers the repeat under a turn cut mid-answer, though the card kept no question of its own", () => {
    const onAskAgain = vi.fn();

    // The act takes its words from the record by question id; the card's copy is a convenience, and a card without it
    // is asked again like any other.
    renderChat({
      said: {
        messages: [
          {
            id: "cut",
            agentId: "agent-1",
            from: "agent",
            text: "Половина відповіді",
            note: CHAT_STOPPED_NOTE,
            at: new Date().toISOString(),
            questionId: "question-0",
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
            asked: null,
            fedBy: [],
            attached: [],
            compressed: null,
          },
        ],
      },
      acts: {
        onAskAgain: onAskAgain,
      },
    });

    screen.getByText(SAID_ROW_AGAIN_LABEL).click();
    expect(onAskAgain).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "cut",
      }),
    );
  });

  it("draws no card at all for a turn where only the app has anything to say", () => {
    const { container } = renderChat({
      said: {
        messages: [
          {
            id: "fell",
            agentId: "agent-1",
            from: "agent",
            text: "",
            note: "Відповідь не прийшла",
            at: new Date().toISOString(),
            questionId: "question-0",
            askedAt: 0,
            cost: null,
            answerCeiling: null,
            otherAgentId: null,
            stopReason: null,
            isFailure: true,
            notStarted: null,
            wouldGo: null,
            waitsFor: null,
            calls: [],
            began: null,
            stepId: null,
            walkId: null,
            asked: null,
            fedBy: [],
            attached: [],
            compressed: null,
          },
        ],
      },
    });

    expect(screen.getByText("Відповідь не прийшла")).toBeInTheDocument();
    // An empty card under the app's own sentence would be a card about nobody's words.
    expect(container.querySelectorAll('[style*="white-space: pre-wrap"]')).toHaveLength(0);
  });

  it("names the live chat over the stream the same way it names a run read back", () => {
    renderChat({
      said: {
        messages: [
          {
            id: "asked",
            agentId: "agent-1",
            from: "person",
            text: "привіт!",
            note: null,
            at: new Date().toISOString(),
            questionId: "question-0",
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
            asked: null,
            fedBy: [],
            attached: [],
            compressed: null,
          },
        ],
      },
      band: {
        head: {
          at: new Date("2026-08-22T19:27:00"),
          state: "done",
          isOpened: false,
          isFailed: false,
        },
      },
    });

    // Both are conversations, so the band has one way of saying so.
    expect(screen.getByText(RUN_STATE_LABELS.done)).toBeInTheDocument();
  });

  it("offers the stop while the walk is out, even with no card of it in this stream", () => {
    const onStop = vi.fn();

    // Over an opened run the stream shows a record with no live card, yet the walk is out, so the stop is here.
    renderChat({
      said: {
        working: [],
      },
      field: {
        isWalking: true,
        onStop: onStop,
      },
    });

    screen.getByText(AGENT_CHAT_STOP_LABEL).click();
    expect(onStop).toHaveBeenCalledTimes(1);
  });

  it("marks the field itself while the walk goes: a word in place of the name, a quieter edge and ground", () => {
    // The row under the field says what to press; the field says why nothing is going.
    renderChat({
      field: {
        draft: "",
        isWalking: true,
      },
    });

    const field = screen.getByPlaceholderText(AGENT_CHAT_WALKING_PLACEHOLDER);

    // Longhands, not shorthands: jsdom serializes «background» and «border» with more than was set.
    expect(field).toHaveStyle({
      backgroundColor: AGENT_CHAT_FIELD_GROUNDS.walking.background,
      borderColor: AGENT_CHAT_FIELD_GROUNDS.walking.border,
    });
    // The word keeps the app's placeholder colour; states differ by ground and edge alone.
    expect(field).not.toHaveClass(String(AGENT_CHAT_FIELD_GROUNDS.stitched.wordClass));
  });

  it("leaves the marked field writable: it is quieted, not stitched", () => {
    const onDraftChange = vi.fn();

    // A stitched field is only where nothing can be written; here something can, so it waits.
    renderChat({
      field: {
        draft: "",
        isWalking: true,
        onDraftChange: onDraftChange,
      },
    });

    const field = screen.getByPlaceholderText(AGENT_CHAT_WALKING_PLACEHOLDER);

    expect(field).not.toBeDisabled();
    field.focus();
    expect(field).toHaveFocus();
  });

  it("takes the field's own ground back the moment the walk is over", () => {
    // The mark is a state and lasts exactly as long as the walk.
    renderChat({
      field: {
        draft: "",
        isWalking: false,
      },
    });

    const field = screen.getByPlaceholderText(`${AGENT_CHAT_FIELD_PLACEHOLDER_PREFIX}EDITOR…`);

    expect(field).toHaveStyle({
      backgroundColor: AGENT_CHAT_FIELD_GROUNDS.open.background,
      borderColor: AGENT_CHAT_FIELD_GROUNDS.open.border,
    });
  });

  it("says the agent is off ahead of the walk: with nothing to write, there is nothing to wait for", () => {
    // A switched-off agent stitches the field shut, and that wins over walking.
    renderChat({
      aimed: {
        isActive: false,
      },
      field: {
        draft: "",
        isWalking: true,
      },
    });

    const field = screen.getByPlaceholderText(AGENT_CHAT_OFF_PLACEHOLDER);

    expect(field).toBeDisabled();
    expect(screen.queryByPlaceholderText(AGENT_CHAT_WALKING_PLACEHOLDER)).not.toBeInTheDocument();
    // A stitched field takes the deafer ground and its word in the quiet mark.
    expect(field).toHaveStyle({
      backgroundColor: AGENT_CHAT_FIELD_GROUNDS.stitched.background,
      borderColor: AGENT_CHAT_FIELD_GROUNDS.stitched.border,
    });
    expect(field).toHaveClass(String(AGENT_CHAT_FIELD_GROUNDS.stitched.wordClass));
  });

  it("stitches the field where nobody is aimed at: there is no one for a question to go to", () => {
    // The stream stands and a question has nowhere to go: the same ground as an agent switched off.
    renderChat({
      aimed: {
        id: null,
      },
      field: {
        draft: "",
      },
    });

    const field = screen.getByPlaceholderText(AGENT_CHAT_NO_AIM_PLACEHOLDER);

    expect(field).toBeDisabled();
    expect(field).toHaveStyle({
      backgroundColor: AGENT_CHAT_FIELD_GROUNDS.stitched.background,
    });
  });

  it("answers a press that could not go through with the stop itself, once", async () => {
    const onSend = vi.fn();

    // The answer stands where the button already is and leads to the one way out.
    renderChat({
      field: {
        draft: "А тести на цю гілку ти вже гнав?",
        isWalking: true,
        onSend: onSend,
      },
    });

    const stop = screen.getByText(AGENT_CHAT_STOP_LABEL);

    expect(stop).not.toHaveClass(AGENT_CHAT_STOP_BLINK_CLASS);

    await userEvent.type(
      screen.getByLabelText(`${AGENT_CHAT_FIELD_PLACEHOLDER_PREFIX}EDITOR`),
      "{Meta>}{Enter}{/Meta}",
    );

    expect(onSend).not.toHaveBeenCalled();
    expect(screen.getByText(AGENT_CHAT_STOP_LABEL)).toHaveClass(AGENT_CHAT_STOP_BLINK_CLASS);
  });

  it("answers nothing where nothing was asked: an empty field under a walk", async () => {
    // The answer is owed to a question that could not go; an empty field asked for none.
    renderChat({
      field: {
        draft: "",
        isWalking: true,
      },
    });

    await userEvent.type(
      screen.getByLabelText(`${AGENT_CHAT_FIELD_PLACEHOLDER_PREFIX}EDITOR`),
      "{Meta>}{Enter}{/Meta}",
    );

    expect(screen.getByText(AGENT_CHAT_STOP_LABEL)).not.toHaveClass(AGENT_CHAT_STOP_BLINK_CLASS);
  });

  it("offers no stop where nothing of this conversation is out", () => {
    // Another conversation may be walking; its work is neither drawn nor stopped from here.
    renderChat({
      said: {
        working: [],
      },
      field: {
        isWalking: false,
      },
    });

    expect(screen.queryByText(AGENT_CHAT_STOP_LABEL)).not.toBeInTheDocument();
    expect(screen.getByLabelText(AGENT_CHAT_SEND_LABEL)).toBeInTheDocument();
  });
});
