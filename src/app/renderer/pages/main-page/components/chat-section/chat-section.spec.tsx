import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ChatSection } from "./chat-section";
import {
  CHAT_TABS_HISTORY_LABEL,
  CHAT_TABS_STREAM_LABEL,
} from "../../../../features/conversation/ui/chat-tabs/constants";
import { RUN_HISTORY_EMPTY_NOTE } from "../../../../features/record/ui/run-history/constants";
import { AGENT_CHAT_FIELD_PLACEHOLDER_PREFIX } from "../../../../features/conversation/ui/agent-chat/constants";
import type { AgentChatState } from "../../../../features/conversation";
import type { ShownStream } from "../../hooks/use-shown-stream";
import type { AgentDraft } from "../../../../features/agents";
import type { ChatSectionProps } from "./interfaces";
import { aDraft } from "../../../../testing";

const aimed: AgentDraft = aDraft({});

function chat(patch: Partial<AgentChatState> = {}): AgentChatState {
  return {
    fellAt: {},
    aimedAgentId: "agent-1",
    openCalls: {
      isOpen: () => false,
      toggle: () => {},
      open: () => {},
    },
    fieldHeight: null,
    setFieldHeight: () => {},
    aim: vi.fn(),
    fresh: vi.fn(),
    sayAgain: vi.fn(),
    saidAgain: [],
    runId: null,
    goOnIn: vi.fn(),
    letGo: vi.fn(),
    messages: [],
    draft: "",
    isWorking: false,
    isNewsElsewhere: false,
    readNews: vi.fn(),
    written: 0,
    startedAt: null,
    working: [],
    waiting: [],
    linkLives: {},
    changeDraft: vi.fn(),
    attachments: [],
    attach: vi.fn(),
    detach: vi.fn(),
    send: vi.fn(),
    stop: vi.fn(),
    ...patch,
  };
}

function stream(patch: Partial<ShownStream> = {}): ShownStream {
  return {
    tab: "stream",
    showTab: vi.fn(),
    messages: [],
    agents: [],
    head: null,
    shownRunId: null,
    runs: [],
    isFailed: false,
    endedRuns: [],
    doomedRun: null,
    armForget: vi.fn(),
    dismissForget: vi.fn(),
    forgetRun: vi.fn(async () => {}),
    doomedRuns: null,
    armForgetAll: vi.fn(),
    dismissForgetAll: vi.fn(),
    forgetAllRuns: vi.fn(async () => {}),
    fresh: vi.fn(),
    openRun: vi.fn(),
    query: "",
    search: vi.fn(),
    hits: [],
    drivenTo: null,
    isTyping: false,
    openSearch: vi.fn(),
    closeSearch: vi.fn(),
    inStream: [],
    standingAt: 0,
    foundId: null,
    toNextFound: vi.fn(),
    toPreviousFound: vi.fn(),
    ...patch,
  };
}

function props(patch: Partial<ChatSectionProps> = {}): ChatSectionProps {
  return {
    chat: chat(),
    stream: stream(),
    agents: [],
    aimed,
    onOpenDebug: null,
    onOpenProviders: vi.fn(),
    onOpenModel: vi.fn(),
    onOpenAgentAt: vi.fn(),
    ...patch,
  };
}

describe("ChatSection", () => {
  it("stands both faces of the chat over one of them", () => {
    // What is going on, and what has been — the tabs are always there, the face below changes.
    render(<ChatSection {...props()} />);

    expect(screen.getByText(CHAT_TABS_STREAM_LABEL)).toBeInTheDocument();
    expect(screen.getByText(CHAT_TABS_HISTORY_LABEL)).toBeInTheDocument();
  });

  it("shows the live stream where that tab stands, and the record where the other does", () => {
    const { rerender } = render(<ChatSection {...props()} />);

    expect(screen.getByLabelText(`${AGENT_CHAT_FIELD_PLACEHOLDER_PREFIX}Шукач`)).toBeInTheDocument();
    expect(screen.queryByText(RUN_HISTORY_EMPTY_NOTE)).not.toBeInTheDocument();

    rerender(
      <ChatSection
        {...props({
          stream: stream({
            tab: "history",
          }),
        })}
      />,
    );

    expect(screen.getByText(RUN_HISTORY_EMPTY_NOTE)).toBeInTheDocument();
    expect(screen.queryByLabelText(`${AGENT_CHAT_FIELD_PLACEHOLDER_PREFIX}Шукач`)).not.toBeInTheDocument();
  });

  it("goes to the face the tab names", async () => {
    const shown = stream();

    render(
      <ChatSection
        {...props({
          stream: shown,
        })}
      />,
    );
    await userEvent.click(screen.getByText(CHAT_TABS_HISTORY_LABEL));

    expect(shown.showTab).toHaveBeenCalledWith("history");
  });

  it("names the aimed agent in the field, and stands the field open where nobody is aimed at", () => {
    // The section is one; who it is aimed at is what the field says.
    render(
      <ChatSection
        {...props({
          aimed: null,
          chat: chat({
            aimedAgentId: null,
          }),
        })}
      />,
    );

    expect(screen.getByLabelText(AGENT_CHAT_FIELD_PLACEHOLDER_PREFIX.trim())).toBeDisabled();
  });

  it("counts the ended runs on the tab, since only those can be deleted", () => {
    // The number the tab wears is the number the forget-all question is about.
    render(<ChatSection {...props()} />);

    expect(screen.getByText(CHAT_TABS_HISTORY_LABEL)).toBeInTheDocument();
  });
});
