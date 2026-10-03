import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";
import { useAgentChat } from "./use-agent-chat";
import { useLiveAnswer } from "../use-live-answer";
import { ASK_AGENT_CHANNEL, STOP_AGENT_CHANNEL } from "../../../../../../contracts";
import type { AskAgain, OpenRun } from "../../../../../../contracts";
import {
  ADD_RUN_STEP_CHANNEL,
  ASK_AGAIN_CHANNEL,
  CLOSE_RUN_CHANNEL,
  OPEN_RUN_CHANNEL,
  READ_RUN_CHANNEL,
  SHARED_MEMORY_CHANNEL,
} from "../../../../../../contracts";
import { CHAT_SAID_NOTHING_NOTE, NOT_STARTED_ENDS } from "../../constants";
import { answerCeilingNote } from "../../words";

import type { Agent, OpenProject, ProviderState, LiveCall } from "../../../../interfaces";
import type { ChatMessage, SaidTurn } from "../../interfaces";
import type { WholeRun, WholeStep, WrittenStep } from "../../../record";
import { aConfig, aLink, aModel, anAgent, recordStandIn, standInBridge } from "../../../../testing";

function agent(id: string, name: string, x: number): Agent {
  return anAgent({
    id,
    name,
    color: "#b18aff",
    x,
    y: 0,
    maxCalls: 5,
    temperature: 0.3,
  });
}

/** Known providers as the renderer holds them. */
const PROVIDERS: ProviderState[] = [
  {
    id: "anthropic",
    name: "Anthropic",
    kind: "remote",
    needs: ["key"],
    takesTools: true,
    customaryAddress: null,
    keyHint: null,
    address: null,
  },
];

/** A project that declares no server, so no look ever stands. */
const NO_SERVERS = {};
/** These walks pick nothing, so no refusals. */
const NO_REFUSALS = () => undefined;

/** Receives what each turn heard at the provider's address; no case reads it back. */
const heard = vi.fn();

const PROJECT: OpenProject = {
  directory: "/tmp/project",
  config: aConfig({
    models: [
      aModel({
        title: "claude-sonnet-4.5",
        provider: "anthropic",
        contextCeiling: 200000,
      }),
    ],
    agents: [agent("agent-1", "EDITOR", 0), agent("agent-2", "REVIEWER", 200)],
    links: [aLink()],
  }),
  print: "print-1",
  view: null,
};

/** Project with no line drawn: one question is one turn and one step. */
const ALONE: OpenProject = {
  ...PROJECT,
  config: {
    ...PROJECT.config,
    links: [],
  },
};

/** Project with a third agent, so the line continues past the one spoken to. */
const CHAIN: OpenProject = {
  ...PROJECT,
  config: {
    ...PROJECT.config,
    agents: [...PROJECT.config.agents, agent("agent-3", "SHIPPER", 400)],
    links: [
      ...PROJECT.config.links,
      aLink({
        id: "link-2",
        from: "agent-2",
        to: "agent-3",
      }),
    ],
  },
};

/** Makes the next turn asked of the machine fall; the record's own calls (row, question, step) are untouched. */
function fallsOnce(invoke: Mock, error: Error): void {
  const answering = <(channel: string, payload?: unknown) => Promise<unknown>>invoke.getMockImplementation();
  let standing: Error | null = error;

  invoke.mockImplementation(async (channel: string, payload?: unknown) => {
    if (channel === ASK_AGENT_CHANNEL && standing !== null) {
      const falling = standing;

      standing = null;

      throw falling;
    }

    return answering(channel, payload);
  });
}

/** Every turn answers with the same words; every ask is kept for assertions. */
function held(answer = "Готово, тест зелений.") {
  const record = recordStandIn();
  const invoke = vi.fn(async (channel: string, payload?: unknown) =>
    channel === ASK_AGENT_CHANNEL
      ? {
          text: answer,
          isStopped: false,
          isCallsExhausted: false,
          inputTokens: 10,
          outputTokens: 20,
        }
      : record.answer(channel, payload),
  );

  standInBridge({
    invoke,
  });

  return invoke;
}

/** The calls of one turn as its card reads them. */
function liveCalls(turnId: string): LiveCall[] {
  const { result } = renderHook(() => useLiveAnswer(turnId));

  return result.current.calls;
}

/** What was sent to the model on the nth ask. */
function asked(invoke: ReturnType<typeof held>, nth: number) {
  const calls = invoke.mock.calls.filter(([channel]) => channel === ASK_AGENT_CHANNEL);

  return <{ messages: { from: string; text: string }[] }>calls[nth]?.[1];
}

/** A turn that came back unfinished: the fields say how, `text` is what got through. */
function ending(said: { text?: string; isStopped?: boolean; isCallsExhausted?: boolean; isCeilingHit?: boolean }) {
  const record = recordStandIn();
  const invoke = vi.fn(async (channel: string, payload?: unknown) =>
    channel === ASK_AGENT_CHANNEL
      ? {
          text: "",
          isStopped: false,
          isCallsExhausted: false,
          isCeilingHit: false,
          inputTokens: 10,
          outputTokens: 20,
          ...said,
        }
      : record.answer(channel, payload),
  );

  standInBridge({
    invoke,
  });

  return invoke;
}

/** The last row said in the stream, where «СПИТАТИ ЩЕ РАЗ» lives. */
function broken(messages: ChatMessage[]): ChatMessage {
  return <ChatMessage>messages.at(-1);
}

/** A row with no stream, naming a walk and question the record never held. */
function row(walkId: string): ChatMessage {
  return {
    id: "said-1",
    agentId: "agent-1",
    from: "agent",
    text: "",
    at: new Date().toISOString(),
    questionId: "question-1",
    askedAt: Date.now(),
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
    walkId,
    note: null,
    asked: null,
    fedBy: [],
    attached: [],
  };
}

describe("useAgentChat", () => {
  it("asks the model the person's question once, not once in the history and once again as the question", async () => {
    const invoke = held();
    const { result } = renderHook(() => useAgentChat(PROJECT, "agent-1", PROVIDERS, heard, NO_SERVERS, NO_REFUSALS));

    act(() => result.current.changeDraft("Полагодь падіння тесту"));
    act(() => result.current.send());

    await waitFor(() => expect(asked(invoke, 0)).toBeDefined());

    expect(asked(invoke, 0).messages).toEqual([
      {
        from: "person",
        text: "Полагодь падіння тесту",
      },
    ]);
  });

  it("empties the stream on a fresh chat, and leaves the aim and the draft where they were", async () => {
    const invoke = held();
    const { result } = renderHook(() => useAgentChat(PROJECT, "agent-1", PROVIDERS, heard, NO_SERVERS, NO_REFUSALS));

    act(() => result.current.changeDraft("Полагодь падіння тесту"));
    act(() => result.current.send());

    await waitFor(() => expect(asked(invoke, 0)).toBeDefined());
    await waitFor(() => expect(result.current.messages.length).toBeGreaterThan(0));

    act(() => result.current.fresh());

    // The stream empties, but every question that walked a line is kept as a run.
    expect(result.current.messages).toEqual([]);
    expect(result.current.aimedAgentId).toBe("agent-1");
  });

  it("says nothing into a stream the person put away, though the walk runs on and writes itself", async () => {
    const alone: OpenProject = {
      ...PROJECT,
      config: {
        ...PROJECT.config,
        links: [],
      },
    };
    const sent: Record<string, unknown[]> = {};
    let answer: (said: SaidTurn) => void = () => undefined;
    const record = recordStandIn();
    const invoke = vi.fn(async (channel: string, payload?: unknown) => {
      sent[channel] = [...(sent[channel] ?? []), payload];

      if (channel === ASK_AGENT_CHANNEL) {
        return await new Promise<SaidTurn>((resolve) => {
          answer = resolve;
        });
      }

      if (channel === OPEN_RUN_CHANNEL) {
        return {
          runId: "run-1",
          questionId: "question-1",
        };
      }

      if (channel === ADD_RUN_STEP_CHANNEL) {
        return "step-1";
      }

      return record.answer(channel, payload);
    });

    standInBridge({
      invoke,
    });

    const { result } = renderHook(() => useAgentChat(alone, "agent-1", PROVIDERS, heard, NO_SERVERS, NO_REFUSALS));

    act(() => result.current.changeDraft("Полагодь падіння тесту"));
    act(() => result.current.send());

    await waitFor(() => expect(result.current.messages.length).toBe(1));

    act(() => result.current.fresh());

    await act(async () => {
      answer({
        text: "Полагодив",
        isStopped: false,
        isCallsExhausted: false,
        isCeilingHit: false,
        inputTokens: 10,
        outputTokens: 20,
        calls: [],
      });
    });

    await waitFor(() => expect(sent[CLOSE_RUN_CHANNEL]?.length).toBe(1));

    // The walk ran to its end and wrote its step; the emptied stream stays empty.
    expect(sent[ADD_RUN_STEP_CHANNEL]?.length).toBe(1);
    expect(result.current.messages).toEqual([]);
  });

  it("keeps the chat aimed where the person put it when the sphere is let go", () => {
    held();

    const { result, rerender } = renderHook(
      ({ agentId }) => useAgentChat(PROJECT, agentId, PROVIDERS, heard, NO_SERVERS, NO_REFUSALS),
      {
        initialProps: {
          agentId: <string | null>"agent-1",
        },
      },
    );

    act(() => result.current.changeDraft("Полагодь падіння тесту"));

    rerender({
      agentId: null,
    });

    // The ring leaves the sphere; the question being written stays.
    expect(result.current.aimedAgentId).toBe("agent-1");
    expect(result.current.draft).toBe("Полагодь падіння тесту");
  });

  it("keeps what is written in the field when the aim moves to somebody else", () => {
    held();

    const { result } = renderHook(() => useAgentChat(PROJECT, "agent-1", PROVIDERS, heard, NO_SERVERS, NO_REFUSALS));

    act(() => result.current.changeDraft("Полагодь падіння тесту"));
    // Opening a run aims the chat at its agent and leaves the field alone.
    act(() => result.current.aim("agent-2"));

    expect(result.current.aimedAgentId).toBe("agent-2");
    expect(result.current.draft).toBe("Полагодь падіння тесту");
  });

  it("gives every stream a field of its own, and hands each back what was written in it", () => {
    held();

    const { result } = renderHook(() => useAgentChat(PROJECT, "agent-1", PROVIDERS, heard, NO_SERVERS, NO_REFUSALS));

    act(() => result.current.changeDraft("Полагодь падіння тесту"));
    // A run opened from history replaces the stream, with its own field.
    act(() => result.current.goOnIn("run-1"));

    expect(result.current.draft).toBe("");

    act(() => result.current.changeDraft("Перевір гілку"));
    act(() => result.current.goOnIn("run-2"));

    expect(result.current.draft).toBe("");

    act(() => result.current.goOnIn("run-1"));

    expect(result.current.draft).toBe("Перевір гілку");
  });

  it("opens a fresh chat with an empty field, and takes the words of the stream it ended", () => {
    held();

    const { result } = renderHook(() => useAgentChat(PROJECT, "agent-1", PROVIDERS, heard, NO_SERVERS, NO_REFUSALS));

    act(() => result.current.changeDraft("Полагодь падіння тесту"));
    // «+ НОВИЙ ЧАТ» starts clean; an unsent question is not carried over.
    act(() => result.current.fresh());

    expect(result.current.draft).toBe("");
  });

  it("sends to the agent it is aimed at, with no sphere selected at all", async () => {
    const invoke = held();
    const { result, rerender } = renderHook(
      ({ agentId }) => useAgentChat(PROJECT, agentId, PROVIDERS, heard, NO_SERVERS, NO_REFUSALS),
      {
        initialProps: {
          agentId: <string | null>"agent-2",
        },
      },
    );

    rerender({
      agentId: null,
    });

    act(() => result.current.changeDraft("Перевір гілку"));
    act(() => result.current.send());

    await waitFor(() => expect(asked(invoke, 0)).toBeDefined());

    const opened = invoke.mock.calls.find(([channel]) => channel === OPEN_RUN_CHANNEL);

    expect((<{ startedByAgentId: string }>opened?.[1]).startedByAgentId).toBe("agent-2");
  });

  it("aims at nobody when the agent it was aimed at is no longer in the project", () => {
    held();

    const { result, rerender } = renderHook(
      ({ opened }) => useAgentChat(opened, null, PROVIDERS, heard, NO_SERVERS, NO_REFUSALS),
      {
        initialProps: {
          opened: <OpenProject>{
            ...PROJECT,
            view: {
              pan: {
                x: 0,
                y: 0,
              },
              scale: 1,
              sectionId: "chat",
              isCollapsed: false,
              aimedAgentId: "agent-1",
            },
          },
        },
      },
    );

    expect(result.current.aimedAgentId).toBe("agent-1");

    rerender({
      opened: {
        ...PROJECT,
        config: {
          ...PROJECT.config,
          agents: PROJECT.config.agents.filter((standing) => standing.id !== "agent-1"),
        },
        view: null,
      },
    });

    expect(result.current.aimedAgentId).toBeNull();
  });

  it("hands the neighbour the answer as a block: who worked, what for, and what it said", async () => {
    const invoke = held();
    const { result, rerender } = renderHook(
      ({ agentId }) => useAgentChat(PROJECT, agentId, PROVIDERS, heard, NO_SERVERS, NO_REFUSALS),
      {
        initialProps: {
          agentId: "agent-1",
        },
      },
    );

    act(() => result.current.changeDraft("Полагодь падіння тесту"));
    act(() => result.current.send());

    await waitFor(() => expect(asked(invoke, 1)).toBeDefined());

    // Only the answer travels: none of the sender's conversation, prompt or history.
    expect(asked(invoke, 1).messages).toEqual([
      {
        from: "person",
        text: "Готово, тест зелений.",
      },
    ]);

    rerender({
      agentId: "agent-2",
    });

    // The handed words appear once in the stream, as the neighbour's own.
    const said = result.current.messages.filter((message) => message.text === "Готово, тест зелений.");

    expect(said.map((message) => [message.from, message.agentId])).toEqual([
      ["agent", "agent-1"],
      ["agent", "agent-2"],
    ]);
  });

  it("walks the drawn line to the end, not one step and no further", async () => {
    const invoke = held();
    const { result } = renderHook(() => useAgentChat(CHAIN, "agent-1", PROVIDERS, heard, NO_SERVERS, NO_REFUSALS));

    act(() => result.current.changeDraft("Полагодь падіння тесту"));
    act(() => result.current.send());

    await waitFor(() => expect(asked(invoke, 2)).toBeDefined());

    // The third agent is asked the second's answer, as the second was asked the first's.
    expect(asked(invoke, 2).messages).toEqual([
      {
        from: "person",
        text: "Готово, тест зелений.",
      },
    ]);

    // The last agent has no line out, so the walk ends on it.
    await act(async () => {
      await Promise.resolve();
    });

    expect(invoke.mock.calls.filter(([channel]) => channel === ASK_AGENT_CHANNEL)).toHaveLength(3);
  });

  it("ends the run where a turn fell: a fall does not travel down the line", async () => {
    const invoke = held();

    fallsOnce(invoke, new Error("постачальник не відповів"));

    const { result } = renderHook(() => useAgentChat(CHAIN, "agent-1", PROVIDERS, heard, NO_SERVERS, NO_REFUSALS));

    act(() => result.current.changeDraft("Полагодь падіння тесту"));
    act(() => result.current.send());

    await waitFor(() => expect(result.current.messages.at(-1)?.isFailure).toBe(true));
    await act(async () => {
      await Promise.resolve();
    });

    // The fall is the first agent's own; the neighbour is never asked the note about it.
    expect(invoke.mock.calls.filter(([channel]) => channel === ASK_AGENT_CHANNEL)).toHaveLength(1);
  });

  it("ends the run at the agent's own ceiling: a turn cut mid-word is not an answer", async () => {
    const invoke = ending({
      isCallsExhausted: true,
    });
    const { result } = renderHook(() => useAgentChat(CHAIN, "agent-1", PROVIDERS, heard, NO_SERVERS, NO_REFUSALS));

    act(() => result.current.changeDraft("Полагодь падіння тесту"));
    act(() => result.current.send());

    await waitFor(() => expect(result.current.messages).toHaveLength(2));
    await act(async () => {
      await Promise.resolve();
    });

    // The neighbour is never handed the ceiling note as work.
    expect(invoke.mock.calls.filter(([channel]) => channel === ASK_AGENT_CHANNEL)).toHaveLength(1);
  });

  it("says the answer broke off at the model's own ceiling, and sends that nowhere", async () => {
    const invoke = ending({
      text: "ФАЙЛИ\n- package.json",
      isCeilingHit: true,
    });
    const { result } = renderHook(() => useAgentChat(CHAIN, "agent-1", PROVIDERS, heard, NO_SERVERS, NO_REFUSALS));

    act(() => result.current.changeDraft("Полагодь падіння тесту"));
    act(() => result.current.send());

    await waitFor(() => expect(result.current.messages).toHaveLength(2));
    await act(async () => {
      await Promise.resolve();
    });

    // The model's words stay in the card; the rule's note is the ceiling.
    expect(result.current.messages.at(-1)?.note).toBe(answerCeilingNote(4096));
    expect(result.current.messages.at(-1)?.text).not.toContain(answerCeilingNote(4096));
    expect(invoke.mock.calls.filter(([channel]) => channel === ASK_AGENT_CHANNEL)).toHaveLength(1);
  });

  it("says the model said nothing rather than drawing an empty card", async () => {
    const invoke = ending({});
    const { result } = renderHook(() => useAgentChat(CHAIN, "agent-1", PROVIDERS, heard, NO_SERVERS, NO_REFUSALS));

    act(() => result.current.changeDraft("Полагодь падіння тесту"));
    act(() => result.current.send());

    await waitFor(() => expect(result.current.messages).toHaveLength(2));
    await act(async () => {
      await Promise.resolve();
    });

    // A card with a price and no words gets the rule's note.
    expect(result.current.messages.at(-1)?.note).toBe(CHAT_SAID_NOTHING_NOTE);
    expect(result.current.messages.at(-1)?.text).toBe("");
    expect(invoke.mock.calls.filter(([channel]) => channel === ASK_AGENT_CHANNEL)).toHaveLength(1);
  });
});

/** The same agent on its own model, so asks tell apart by recipient. */
function onModel(id: string, name: string, modelId: string): Agent {
  return {
    ...agent(id, name, 0),
    modelId,
  };
}

/** Two lines out of the first agent converging on the fourth. */
const FAN: OpenProject = {
  directory: "/tmp/project",
  config: aConfig({
    models: ["model-1", "model-2", "model-3", "model-4"].map((id) => ({
      id,
      title: id,
      provider: "anthropic",
      inputPrice: 3,
      outputPrice: 15,
      contextCeiling: 200000,
      answerCeiling: 4096,
    })),
    agents: [
      onModel("agent-1", "EDITOR", "model-1"),
      onModel("agent-2", "TESTER", "model-2"),
      onModel("agent-3", "LINTER", "model-3"),
      onModel("agent-4", "REVIEWER", "model-4"),
    ],
    links: [
      aLink(),
      aLink({
        id: "link-2",
        to: "agent-3",
      }),
      aLink({
        id: "link-3",
        from: "agent-2",
        to: "agent-4",
      }),
      aLink({
        id: "link-4",
        from: "agent-3",
        to: "agent-4",
      }),
    ],
  }),
  print: "print-1",
  view: null,
};

/** The same fan with one of the two suppliers switched off. */
const HALF_OFF: OpenProject = {
  ...FAN,
  config: {
    ...FAN.config,
    agents: FAN.config.agents.map((standing) =>
      standing.id === "agent-3"
        ? {
            ...standing,
            isActive: false,
          }
        : standing,
    ),
  },
};

/** The same fan with the converging point switched off between a break and the repeat. */
const POINT_OFF: OpenProject = {
  ...FAN,
  config: {
    ...FAN.config,
    agents: FAN.config.agents.map((standing) =>
      standing.id === "agent-4"
        ? {
            ...standing,
            isActive: false,
          }
        : standing,
    ),
  },
};

/** Every agent answers in its own words; models in `falls` never answer. */
function voices(falls: string[] = []) {
  const record = recordStandIn();
  const invoke = vi.fn(async (channel: string, payload?: unknown) => {
    if (channel !== ASK_AGENT_CHANNEL) {
      return record.answer(channel, payload);
    }

    const asking = <{ model: string }>payload;

    if (falls.includes(asking.model)) {
      throw new Error("постачальник не відповів");
    }

    return {
      text: `${asking.model} готовий`,
      isStopped: false,
      isCallsExhausted: false,
      isCeilingHit: false,
      inputTokens: 10,
      outputTokens: 20,
    };
  });

  standInBridge({
    invoke,
  });

  return invoke;
}

/** What the agent on this model was asked, or `undefined` if never asked. */
function askedOf(invoke: { mock: { calls: [string, unknown?][] } }, model: string) {
  const call = invoke.mock.calls.find(
    ([channel, payload]) => channel === ASK_AGENT_CHANNEL && (<{ model: string }>payload).model === model,
  );

  return <{ messages: { from: string; text: string }[] } | undefined>call?.[1];
}

function turns(invoke: ReturnType<typeof voices>) {
  return invoke.mock.calls.filter(([channel]) => channel === ASK_AGENT_CHANNEL).length;
}

/** Lets every pending answer arrive; a turn waits on the record for its thread. */
async function stood() {
  await act(async () => {
    for (let step = 0; step < 30; step += 1) {
      await Promise.resolve();
    }
  });
}

describe("useAgentChat where lines converge", () => {
  it("waits for both suppliers and works once, on their answers together", async () => {
    const invoke = voices();
    const { result } = renderHook(() => useAgentChat(FAN, "agent-1", PROVIDERS, heard, NO_SERVERS, NO_REFUSALS));

    act(() => result.current.changeDraft("Перевір гілку перед мержем"));
    act(() => result.current.send());

    await waitFor(() => expect(askedOf(invoke, "model-4")).toBeDefined());

    // One turn holding both answers in arrival order, both whole.
    expect(askedOf(invoke, "model-4")?.messages).toEqual([
      {
        from: "person",
        text: "model-2 готовий\n\nmodel-3 готовий",
      },
    ]);

    await stood();

    // Four agents, four turns: the point does not run once per supplier.
    expect(turns(invoke)).toBe(4);
  });

  it("does not wait for a switched-off supplier, and asks with the one answer as it came", async () => {
    const invoke = voices();
    const { result } = renderHook(() => useAgentChat(HALF_OFF, "agent-1", PROVIDERS, heard, NO_SERVERS, NO_REFUSALS));

    act(() => result.current.changeDraft("Перевір гілку перед мержем"));
    act(() => result.current.send());

    await waitFor(() => expect(askedOf(invoke, "model-4")).toBeDefined());

    // One live supplier is not a converging point; the answer goes as said.
    expect(askedOf(invoke, "model-4")?.messages).toEqual([
      {
        from: "person",
        text: "model-2 готовий",
      },
    ]);

    await stood();

    expect(turns(invoke)).toBe(3);
  });

  it("ends the walk where a supplier fell, instead of working the point below it on half the work", async () => {
    const invoke = voices(["model-2"]);
    const { result } = renderHook(() => useAgentChat(FAN, "agent-1", PROVIDERS, heard, NO_SERVERS, NO_REFUSALS));

    act(() => result.current.changeDraft("Перевір гілку перед мержем"));
    act(() => result.current.send());
    await stood();

    // After a break nothing further begins: the waiting point is not asked with a supplier missing but left for the
    // repeat, and what arrived stays in the record.
    expect(askedOf(invoke, "model-4")).toBeUndefined();
    expect(turns(invoke)).toBe(3);
  });

  it("ends the run at the point when neither supplier answered", async () => {
    const invoke = voices(["model-2", "model-3"]);
    const { result } = renderHook(() => useAgentChat(FAN, "agent-1", PROVIDERS, heard, NO_SERVERS, NO_REFUSALS));

    act(() => result.current.changeDraft("Перевір гілку перед мержем"));
    act(() => result.current.send());

    await waitFor(() => expect(turns(invoke)).toBe(3));
    await stood();

    // Nothing arrived, so the point is not asked with an empty question.
    expect(askedOf(invoke, "model-4")).toBeUndefined();
  });
});

/** Every agent answers at once except those on the named models, which answer only when released. */
function voicesHolding(...models: string[]) {
  const releases: Record<string, () => void> = {};
  const gates: Record<string, Promise<void>> = {};

  for (const model of models) {
    gates[model] = new Promise<void>((resolve) => {
      releases[model] = resolve;
    });
  }

  const record = recordStandIn();
  const invoke = vi.fn(async (channel: string, payload?: unknown) => {
    if (channel !== ASK_AGENT_CHANNEL) {
      return record.answer(channel, payload);
    }

    const asking = <{ model: string }>payload;
    const gate = gates[asking.model];

    if (gate !== undefined) {
      await gate;
    }

    return {
      text: `${asking.model} готовий`,
      isStopped: false,
      isCallsExhausted: false,
      isCeilingHit: false,
      inputTokens: 10,
      outputTokens: 20,
    };
  });

  standInBridge({
    invoke,
  });

  return {
    invoke,
    release: (model: string) => releases[model]?.(),
  };
}

describe("useAgentChat while a converging point waits", () => {
  it("says whom it waits for and how many answered, and tells the two lines apart", async () => {
    const { invoke, release } = voicesHolding("model-3");
    const { result } = renderHook(() => useAgentChat(FAN, "agent-1", PROVIDERS, heard, NO_SERVERS, NO_REFUSALS));

    act(() => result.current.changeDraft("Перевір гілку перед мержем"));
    act(() => result.current.send());

    await waitFor(() => expect(result.current.waiting).toHaveLength(1));

    // Live suppliers in line-drawing order, with where each stands.
    expect(result.current.waiting[0]).toEqual({
      // The on-screen conversation's point is the one the canvas holds.
      agentId: "agent-4",
      // The walk is alive, so the point waits for a supplier, not a hand.
      isAwaitingRepeat: false,
      suppliers: [
        {
          agentId: "agent-2",
          state: "answered",
          seconds: expect.any(Number),
        },
        {
          agentId: "agent-3",
          state: "working",
          seconds: null,
        },
      ],
    });
    // The line still to answer is drawn as `awaited`; the one that answered is lit.
    expect(result.current.linkLives["link-4"]).toBe("awaited");
    expect(result.current.linkLives["link-3"]).toBe("answered");

    act(() => release("model-3"));
    await stood();

    // The wait ends when the last supplier speaks; the point takes its turn.
    expect(result.current.waiting).toHaveLength(0);
    expect(askedOf(invoke, "model-4")).toBeDefined();
  });

  it("keeps standing when the walk breaks under it, and waits for the repeat instead", async () => {
    const { invoke } = recording({}, ["model-3"]);
    const { result } = renderHook(() => useAgentChat(FAN, "agent-1", PROVIDERS, heard, NO_SERVERS, NO_REFUSALS));

    act(() => result.current.changeDraft("Перевір гілку перед мержем"));
    act(() => result.current.send());

    // A break leaves the point waiting and what arrived standing, for the repeat.
    await waitFor(() => expect(result.current.waiting[0]?.isAwaitingRepeat).toBe(true));

    expect(result.current.waiting[0].suppliers).toEqual([
      {
        agentId: "agent-2",
        state: "answered",
        seconds: expect.any(Number),
      },
      {
        agentId: "agent-3",
        state: "silent",
        seconds: null,
      },
    ]);
    // The fallen supplier's line says «нічого не приїде»; the answered one stays lit.
    expect(result.current.linkLives["link-4"]).toBe("silent");
    expect(result.current.linkLives["link-3"]).toBe("answered");
    // Nothing of the walk begins after the break, including the point's own turn.
    expect(askedOf(invoke, "model-4")).toBeUndefined();
  });

  it("puts a wait left by a break down when the next question begins a walk of its own", async () => {
    recording({}, ["model-3"]);

    const { result } = renderHook(() => useAgentChat(FAN, "agent-1", PROVIDERS, heard, NO_SERVERS, NO_REFUSALS));

    act(() => result.current.changeDraft("Перевір гілку перед мержем"));
    act(() => result.current.send());

    await waitFor(() => expect(result.current.waiting[0]?.isAwaitingRepeat).toBe(true));

    act(() => result.current.changeDraft("Перевір ще раз"));
    act(() => result.current.send());

    // What the point held belonged to the broken walk; a new walk brings its own.
    await waitFor(() => expect(result.current.waiting[0]?.isAwaitingRepeat).not.toBe(true));
  });

  it("sends nothing into a walk still out, and keeps the words in the field until it ends", async () => {
    const { release } = recording({}, [], ["model-4"]);
    const { result } = renderHook(() => useAgentChat(FAN, "agent-1", PROVIDERS, heard, NO_SERVERS, NO_REFUSALS));

    act(() => result.current.changeDraft("Перевір гілку перед мержем"));
    act(() => result.current.send());

    // The first walk's point is out; the conversation is walking.
    await waitFor(() => expect(result.current.working.some((one) => one.agentId === "agent-4")).toBe(true));

    act(() => result.current.changeDraft("Перевір ще одну гілку"));
    act(() => result.current.send());

    // Nothing went and the typed words stay in the field.
    expect(result.current.messages.filter((message) => message.from === "person")).toHaveLength(1);
    expect(result.current.draft).toBe("Перевір ще одну гілку");

    release();

    // A question goes only when the whole conversation walk is over, which is the gate `send` checks; the agent's own
    // turn ends on a different tick.
    await waitFor(() => expect(result.current.working).toEqual([]));

    act(() => result.current.send());

    // The walk is over, so the second question goes, in its own block below the first.
    await waitFor(() => expect(result.current.messages.filter((message) => message.from === "person")).toHaveLength(2));

    const said = result.current.messages;
    const asked = said.findIndex((message, at) => message.from === "person" && at > 0);
    const point = said.findIndex((message) => message.from === "agent" && message.agentId === "agent-4");

    expect(asked).toBeGreaterThan(0);
    expect(point).toBeLessThan(asked);
  });

  it("flows down every line the work arrived by, not only the last of them", async () => {
    const { release } = voicesHolding("model-3", "model-4");
    const { result } = renderHook(() => useAgentChat(FAN, "agent-1", PROVIDERS, heard, NO_SERVERS, NO_REFUSALS));

    act(() => result.current.changeDraft("Перевір гілку перед мержем"));
    act(() => result.current.send());

    await waitFor(() => expect(result.current.waiting).toHaveLength(1));

    act(() => release("model-3"));

    // The point's turn came in by both lines, so both carry work while it answers.
    await waitFor(() =>
      expect([result.current.linkLives["link-3"], result.current.linkLives["link-4"]]).toEqual(["running", "running"]),
    );
  });
});

describe("useAgentChat when a step breaks", () => {
  it("ends every turn still out, since a step is what breaks and not one turn of it", async () => {
    const stopped: string[] = [];
    const record = recordStandIn();
    const invoke = vi.fn(async (channel: string, payload?: unknown) => {
      if (channel === STOP_AGENT_CHANNEL) {
        stopped.push((<{ turnId: string }>payload).turnId);

        return undefined;
      }

      if (channel !== ASK_AGENT_CHANNEL) {
        return record.answer(channel, payload);
      }

      const asking = <{ model: string }>payload;

      // One supplier falls; the other is still out and never answers by itself.
      if (asking.model === "model-2") {
        throw new Error("нема зв'язку");
      }

      if (asking.model === "model-3") {
        await new Promise(() => undefined);
      }

      return {
        text: `${asking.model} готовий`,
        isStopped: false,
        isCallsExhausted: false,
        isCeilingHit: false,
        inputTokens: 10,
        outputTokens: 20,
      };
    });

    standInBridge({
      invoke,
    });

    const { result } = renderHook(() => useAgentChat(FAN, "agent-1", PROVIDERS, heard, NO_SERVERS, NO_REFUSALS));

    act(() => result.current.changeDraft("Перевір гілку перед мержем"));
    act(() => result.current.send());

    // The walk ends as soon as one turn breaks.
    await waitFor(() => expect(stopped).toHaveLength(1));
    expect(askedOf(invoke, "model-4")).toBeUndefined();
  });
});

describe("useAgentChat when a turn never began", () => {
  it("says which of the five it was, and does not call it a fall", async () => {
    const invoke = held();

    fallsOnce(invoke, new Error("LLM_NO_KEY"));

    const { result } = renderHook(() => useAgentChat(PROJECT, "agent-1", PROVIDERS, heard, NO_SERVERS, NO_REFUSALS));

    act(() => result.current.changeDraft("Полагодь падіння тесту"));
    act(() => result.current.send());

    await waitFor(() => expect(result.current.messages.at(-1)?.notStarted).toBe("noKey"));

    // «упав» means something was tried; nothing was, so the fallen mark stays off.
    expect(result.current.messages.at(-1)?.isFailure).toBe(false);
    expect(result.current.fellAt["agent-1"]).toBeUndefined();
  });

  it("names the model and the provider in the card's own sentence", async () => {
    const invoke = held();

    fallsOnce(invoke, new Error("LLM_NO_KEY"));

    const { result } = renderHook(() => useAgentChat(PROJECT, "agent-1", PROVIDERS, heard, NO_SERVERS, NO_REFUSALS));

    act(() => result.current.changeDraft("Полагодь падіння тесту"));
    act(() => result.current.send());

    await waitFor(() => expect(result.current.messages.at(-1)?.notStarted).toBe("noKey"));

    // The sentence names this model and provider.
    expect(result.current.messages.at(-1)?.text).toBe(
      "Модель claude-sonnet-4.5 належить провайдеру Anthropic, а ключа до нього немає.",
    );
  });

  it("names the provider that arrived after the first render, not the id it stood without", async () => {
    const invoke = held();

    fallsOnce(invoke, new Error("LLM_NO_KEY"));

    // Providers are read over the bridge, so the first render has none.
    const { result, rerender } = renderHook(
      ({ list }) => useAgentChat(PROJECT, "agent-1", list, heard, NO_SERVERS, NO_REFUSALS),
      {
        initialProps: {
          list: <ProviderState[]>[],
        },
      },
    );

    rerender({
      list: PROVIDERS,
    });
    act(() => result.current.changeDraft("Полагодь падіння тесту"));
    act(() => result.current.send());

    await waitFor(() => expect(result.current.messages.at(-1)?.notStarted).toBe("noKey"));

    expect(result.current.messages.at(-1)?.text).toContain("провайдеру Anthropic");
  });

  it("leaves the field empty: the words stand in the stream and in the record, and a third copy is work for the hand", async () => {
    const invoke = held();

    fallsOnce(invoke, new Error("LLM_PROVIDER_SILENT"));

    const { result } = renderHook(() => useAgentChat(PROJECT, "agent-1", PROVIDERS, heard, NO_SERVERS, NO_REFUSALS));

    act(() => result.current.changeDraft("Полагодь падіння тесту"));
    act(() => result.current.send());

    await waitFor(() => expect(result.current.messages.at(-1)?.notStarted).toBe("silent"));

    // The field empties when the question goes and is not refilled.
    expect(result.current.draft).toBe("");
    expect(result.current.messages.some((message) => message.text === "Полагодь падіння тесту")).toBe(true);
  });

  it("hands nothing on: a turn that never began said nothing to hand", async () => {
    const invoke = held();

    fallsOnce(invoke, new Error("LLM_NO_KEY"));

    const { result } = renderHook(() => useAgentChat(PROJECT, "agent-1", PROVIDERS, heard, NO_SERVERS, NO_REFUSALS));

    act(() => result.current.changeDraft("Полагодь падіння тесту"));
    act(() => result.current.send());

    await waitFor(() => expect(result.current.messages.at(-1)?.notStarted).toBe("noKey"));

    // The app's own missing-key sentence is not work; the line stays dark.
    expect(result.current.messages.some((message) => message.from === "handoff")).toBe(false);
    expect(invoke.mock.calls.filter(([channel]) => channel === ASK_AGENT_CHANNEL)).toHaveLength(1);
  });

  it("keeps calling a turn that was tried and failed a fall", async () => {
    const invoke = held();

    fallsOnce(invoke, new Error("нічого не вийшло"));

    const { result } = renderHook(() => useAgentChat(PROJECT, "agent-1", PROVIDERS, heard, NO_SERVERS, NO_REFUSALS));

    act(() => result.current.changeDraft("Полагодь падіння тесту"));
    act(() => result.current.send());

    await waitFor(() => expect(result.current.messages.at(-1)?.isFailure).toBe(true));

    expect(result.current.messages.at(-1)?.notStarted).toBeNull();
  });
});

/** Project with a ceiling shorter than the typed question. */
const LOW_CEILING: OpenProject = {
  ...PROJECT,
  config: {
    ...PROJECT.config,
    models: PROJECT.config.models.map((model) => ({
      ...model,
      contextCeiling: 10,
      answerCeiling: 4096,
    })),
  },
};

describe("useAgentChat against the model's ceiling", () => {
  it("does not go at all when the turn is longer than the model takes", async () => {
    const invoke = held();
    const { result } = renderHook(() =>
      useAgentChat(LOW_CEILING, "agent-1", PROVIDERS, heard, NO_SERVERS, NO_REFUSALS),
    );

    act(() => result.current.changeDraft("Полагодь падіння тесту"));
    act(() => result.current.send());

    await waitFor(() => expect(result.current.messages.at(-1)?.notStarted).toBe("tooLong"));

    // Measured before sending: nothing asked, nothing fell, nothing spent.
    expect(invoke).not.toHaveBeenCalledWith(ASK_AGENT_CHANNEL, expect.anything());
    expect(result.current.messages.at(-1)?.isFailure).toBe(false);
    expect(result.current.messages.at(-1)?.cost).toBeNull();
    // The field empties; the words stay in the stream above the card.
    expect(result.current.draft).toBe("");
  });

  it("shows what would have gone, part by part, against the number on the model", async () => {
    held();

    const { result } = renderHook(() =>
      useAgentChat(LOW_CEILING, "agent-1", PROVIDERS, heard, NO_SERVERS, NO_REFUSALS),
    );

    act(() => result.current.changeDraft("Полагодь падіння тесту"));
    act(() => result.current.send());

    await waitFor(() => expect(result.current.messages.at(-1)?.wouldGo).not.toBeNull());

    expect(result.current.messages.at(-1)?.wouldGo).toEqual({
      prompt: 0,
      asked: 22,
      memory: 0,
      total: 22,
      ceiling: 10,
    });
  });

  it("does not go on a model whose price nobody wrote, the same as one missing a ceiling", async () => {
    const invoke = held();
    const unpriced: OpenProject = {
      ...PROJECT,
      config: {
        ...PROJECT.config,
        models: PROJECT.config.models.map((model) => ({
          ...model,
          outputPrice: null,
        })),
      },
    };
    const { result } = renderHook(() => useAgentChat(unpriced, "agent-1", PROVIDERS, heard, NO_SERVERS, NO_REFUSALS));

    act(() => result.current.changeDraft("Полагодь падіння тесту"));
    act(() => result.current.send());

    await waitFor(() => expect(result.current.messages.at(-1)?.notStarted).toBe("notFilled"));

    // The card names the field the form will open on; nothing was asked.
    expect(result.current.messages.at(-1)?.text).toContain("«Вихідна ціна»");
    expect(invoke).not.toHaveBeenCalledWith(ASK_AGENT_CHANNEL, expect.anything());
  });

  it("does not go while the agent's own number is empty, and names that field rather than the model's", async () => {
    const invoke = held();
    const unnumbered: OpenProject = {
      ...PROJECT,
      config: {
        ...PROJECT.config,
        agents: PROJECT.config.agents.map((one) => ({
          ...one,
          maxCalls: null,
        })),
      },
    };
    const { result } = renderHook(() => useAgentChat(unnumbered, "agent-1", PROVIDERS, heard, NO_SERVERS, NO_REFUSALS));

    act(() => result.current.changeDraft("Полагодь падіння тесту"));
    act(() => result.current.send());

    await waitFor(() => expect(result.current.messages.at(-1)?.notStarted).toBe("notFilledAgent"));

    expect(result.current.messages.at(-1)?.text).toContain("«Максимум викликів»");
    expect(invoke).not.toHaveBeenCalledWith(ASK_AGENT_CHANNEL, expect.anything());
  });

  it("does not go on a prompt the project has lost, rather than quietly going without one", async () => {
    const invoke = held();
    const lost: OpenProject = {
      ...PROJECT,
      config: {
        ...PROJECT.config,
        agents: PROJECT.config.agents.map((one) => ({
          ...one,
          promptId: "prompt-gone",
        })),
      },
    };
    const { result } = renderHook(() => useAgentChat(lost, "agent-1", PROVIDERS, heard, NO_SERVERS, NO_REFUSALS));

    act(() => result.current.changeDraft("Полагодь падіння тесту"));
    act(() => result.current.send());

    await waitFor(() => expect(result.current.messages.at(-1)?.notStarted).toBe("lostPrompt"));

    // Nothing is asked: working not as agreed is worse than not working.
    expect(invoke).not.toHaveBeenCalledWith(ASK_AGENT_CHANNEL, expect.anything());
  });

  it("does not go while a grant stands on a command the project has lost", async () => {
    const invoke = held();
    const lost: OpenProject = {
      ...PROJECT,
      config: {
        ...PROJECT.config,
        agents: PROJECT.config.agents.map((one) => ({
          ...one,
          tools: [
            {
              id: "grant-1",
              source: "command" as const,
              commandId: "command-gone",
              pinned: [],
            },
          ],
        })),
      },
    };
    const { result } = renderHook(() => useAgentChat(lost, "agent-1", PROVIDERS, heard, NO_SERVERS, NO_REFUSALS));

    act(() => result.current.changeDraft("Полагодь падіння тесту"));
    act(() => result.current.send());

    await waitFor(() => expect(result.current.messages.at(-1)?.notStarted).toBe("lostFunction"));

    // The pill said the agent would not start, and it does not.
    expect(invoke).not.toHaveBeenCalledWith(ASK_AGENT_CHANNEL, expect.anything());
  });

  it("lets a turn under the ceiling through untouched", async () => {
    const invoke = held();
    const { result } = renderHook(() => useAgentChat(PROJECT, "agent-1", PROVIDERS, heard, NO_SERVERS, NO_REFUSALS));

    act(() => result.current.changeDraft("Полагодь падіння тесту"));
    act(() => result.current.send());

    await waitFor(() => expect(result.current.messages.some((message) => message.from === "agent")).toBe(true));

    expect(invoke).toHaveBeenCalledWith(ASK_AGENT_CHANNEL, expect.anything());
    expect(result.current.messages.find((message) => message.from === "agent")?.notStarted).toBeNull();
  });
});

/** A turn that stays out until released, with the reverse channel held open. */
function heldWithVoice() {
  let release = () => {};
  const out = new Promise<void>((resolve) => {
    release = resolve;
  });
  let heard: ((piece: AgentPiece) => void) | null = null;
  const record = recordStandIn();
  const invoke = vi.fn(async (channel: string, payload?: unknown) => {
    if (channel !== ASK_AGENT_CHANNEL) {
      return record.answer(channel, payload);
    }

    await out;

    return {
      text: "Знайшов три файли.",
      isStopped: false,
      isCallsExhausted: false,
      isCeilingHit: false,
      inputTokens: 10,
      outputTokens: 20,
      calls: [],
    };
  });

  standInBridge<AgentPiece>({
    invoke,
    subscribe: (_channel, listener) => {
      heard = listener;
    },
  });

  return {
    /** The turn now out, by the id the hook sent with it. */
    turnId: () =>
      <string>(<{ turnId: string }>invoke.mock.calls.find(([channel]) => channel === ASK_AGENT_CHANNEL)?.[1]).turnId,
    say: (piece: AgentPiece) => heard?.(piece),
    release: () => release(),
  };
}

/** One piece of an answer, as the main process sends it. */
interface AgentPiece {
  turnId: string;
  text: string;
  call: LiveCall | null;
}

/** One call as the main process says it: going out, then over. */
function standing(state: string, patch: Partial<LiveCall> = {}): LiveCall {
  return {
    id: "call-1",
    source: "command",
    name: "find_deep",
    arguments: {
      depth: "швидко",
    },
    pinned: [],
    line: "",
    output: "",
    refusal: "",
    exitCode: null,
    serverId: null,
    serverName: "",
    isFailed: false,
    startedAt: 1,
    endedAt: 0,
    state,
    ...patch,
  };
}

describe("useAgentChat while a turn is making calls", () => {
  it("says the same call over rather than twice, and keeps it for the rest of the turn", async () => {
    const voice = heldWithVoice();
    const { result } = renderHook(() => useAgentChat(PROJECT, "agent-1", PROVIDERS, heard, NO_SERVERS, NO_REFUSALS));

    act(() => result.current.changeDraft("Знайди файли глибше"));
    act(() => result.current.send());
    await waitFor(() => expect(result.current.isWorking).toBe(true));

    const turnId = voice.turnId();

    act(() =>
      voice.say({
        turnId,
        text: "",
        call: standing("running"),
      }),
    );

    expect(liveCalls(turnId).map((call) => [call.id, call.state])).toEqual([["call-1", "running"]]);

    act(() =>
      voice.say({
        turnId,
        text: "",
        call: standing("ran", {
          line: "find . -maxdepth 2",
          output: "report.md",
          exitCode: 0,
          serverId: null,
          serverName: "",
          isFailed: false,
          endedAt: 9,
        }),
      }),
    );
    act(() =>
      voice.say({
        turnId,
        text: "",
        call: standing("refused", {
          id: "call-2",
          source: "command",
          refusal: "[find_deep не запустилась: depth — має бути числом, прийшло «швидко»]",
        }),
      }),
    );

    expect(liveCalls(turnId).map((call) => [call.id, call.state, call.exitCode])).toEqual([
      ["call-1", "ran", 0],
      ["call-2", "refused", null],
    ]);

    voice.release();
    await waitFor(() => expect(result.current.isWorking).toBe(false));

    // The card goes with the turn; the answer they belong to keeps the rows.
    expect(result.current.working).toEqual([]);
  });
});

/** The run as the record would return it, built from the steps the stand-in was told. */
function recorded(sent: Record<string, unknown[]>): WholeRun {
  const written = <WrittenStep[]>(sent[ADD_RUN_STEP_CHANNEL] ?? []);
  const walk: WholeStep[] = written.map((step, index) => ({
    ...step,
    id: `step-${index + 1}`,
    place: index + 1,
    startedAt: new Date(step.startedAt),
    endedAt: new Date(step.endedAt),
    calls: [],
  }));

  return {
    id: "run-1",
    startedByAgentId: "agent-1",
    startedByAgentName: walk[0]?.agentName ?? "",
    startedByAgentColor: walk[0]?.agentColor ?? "",
    askedAgentId: "agent-1",
    askedAgentName: walk[0]?.agentName ?? "",
    asked: "Прогони тести",
    state: "done",
    startedAt: new Date(),
    askedAt: new Date(),
    endedAt: new Date(),
    // Questions as asked, each with the id it came with.
    questions: [
      ...(<OpenRun[]>(sent[OPEN_RUN_CHANNEL] ?? [])).map((one) => ({
        id: one.questionId,
        asked: one.asked,
        askedAt: new Date(one.startedAt),
        askedAgentId: "agent-1",
        attached: one.attached,
      })),
      ...(<AskAgain[]>(sent[ASK_AGAIN_CHANNEL] ?? [])).map((one) => ({
        id: one.questionId,
        asked: one.asked,
        askedAt: new Date(one.askedAt),
        askedAgentId: "agent-1",
        attached: one.attached,
      })),
    ].map((question, index) => ({
      ...question,
      place: index + 1,
    })),
    steps: walk.length,
    money: 0,
    worked: 0,
    walk,
  };
}

/** What the record says of a question to an agent with the shared memory. */
const SHARED_WORDS = "ЗАГАЛЬНА ПАМ'ЯТЬ\n\nПИТАННЯ ЛЮДИНИ → EDITOR:\nПрогони тести\n\nТВОЄ ЗАВДАННЯ:\n";

/** Every channel's payloads in send order, to read the record back. */
function recording(answer: Partial<SaidTurn> = {}, fallsOnce: string[] = [], holds: string[] = []) {
  const sent: Record<string, unknown[]> = {};
  const falling = new Set(fallsOnce);
  const releases: (() => void)[] = [];
  const gates = new Map(
    holds.map((model) => [
      model,
      new Promise<void>((resolve) => {
        releases.push(resolve);
      }),
    ]),
  );
  const invoke = vi.fn(async (channel: string, payload?: unknown) => {
    sent[channel] = [...(sent[channel] ?? []), payload];

    if (channel === ASK_AGENT_CHANNEL) {
      const asking = <{ model: string }>payload;

      // A model named as falling falls on its first ask and answers the next.
      if (falling.has(asking.model)) {
        falling.delete(asking.model);

        throw new Error("нема зв'язку");
      }

      // A model named as held stays out until the test lets it answer.
      await gates.get(asking.model);

      return {
        text: "Готово, тест зелений.",
        isStopped: false,
        isCallsExhausted: false,
        isCeilingHit: false,
        inputTokens: 10,
        outputTokens: 20,
        calls: [],
        ...answer,
      };
    }

    if (channel === OPEN_RUN_CHANNEL) {
      return {
        runId: "run-1",
        questionId: "question-1",
      };
    }

    if (channel === ADD_RUN_STEP_CHANNEL) {
      return `step-${(sent[channel] ?? []).length}`;
    }

    if (channel === ASK_AGAIN_CHANNEL) {
      return "question-2";
    }

    if (channel === READ_RUN_CHANNEL) {
      return recorded(sent);
    }

    if (channel === SHARED_MEMORY_CHANNEL) {
      return SHARED_WORDS;
    }

    return undefined;
  });

  standInBridge({
    invoke,
  });

  return {
    sent,
    invoke,
    release: () => {
      for (const let_go of releases) {
        let_go();
      }
    },
  };
}

/** The same line with the reviewer on its own model, so a stand-in can hold the reviewer alone. */
const REVIEWER_APART: OpenProject = {
  ...PROJECT,
  config: {
    ...PROJECT.config,
    models: [
      ...PROJECT.config.models,
      aModel({
        id: "model-2",
        title: "reviewer-model",
        provider: "anthropic",
        contextCeiling: 200000,
      }),
    ],
    agents: [
      agent("agent-1", "EDITOR", 0),
      {
        ...agent("agent-2", "REVIEWER", 200),
        modelId: "model-2",
      },
    ],
  },
};

describe("useAgentChat · the memory a turn goes with", () => {
  /** The same line with the reviewer given the shared memory, or none at all. */
  function reviewerWith(memory: "shared" | "none"): OpenProject {
    return {
      ...PROJECT,
      config: {
        ...PROJECT.config,
        agents: PROJECT.config.agents.map((one) =>
          one.id === "agent-2"
            ? {
                ...one,
                memory,
              }
            : one,
        ),
      },
    };
  }

  it("opens the words of an agent with the shared memory with what the record says of the question", async () => {
    const { sent } = recording();
    const { result } = renderHook(() =>
      useAgentChat(reviewerWith("shared"), "agent-1", PROVIDERS, heard, NO_SERVERS, NO_REFUSALS),
    );

    act(() => result.current.changeDraft("Прогони тести"));
    act(() => result.current.send());

    await waitFor(() => expect(sent[CLOSE_RUN_CHANNEL]?.length).toBe(1));

    const [opened] = <{ questionId: string }[]>sent[OPEN_RUN_CHANNEL];
    const asks = <{ messages: { from: string; text: string }[] }[]>sent[ASK_AGENT_CHANNEL];
    const steps = <{ memoryLength: number }[]>sent[ADD_RUN_STEP_CHANNEL];

    // Read by the question the turn works under, from the row the walk writes into.
    expect(sent[SHARED_MEMORY_CHANNEL]).toEqual([
      {
        runId: "run-1",
        questionId: opened.questionId,
      },
    ]);
    // The turn names its row and question, for an agent it calls with the shared memory.
    expect(asks[1]).toMatchObject({
      runId: "run-1",
      questionId: opened.questionId,
    });
    // One input: the memory, then the work that came down the line.
    expect(asks[1].messages).toEqual([
      {
        from: "person",
        text: `${SHARED_WORDS}Готово, тест зелений.`,
      },
    ]);
    // The record keeps how much memory went, counted as the ceiling counts it.
    expect(steps.map((step) => step.memoryLength)).toEqual([0, [...SHARED_WORDS].length]);
  });

  it("reads nothing for an agent whose memory is switched off, and sends it the work alone", async () => {
    const { sent } = recording();
    const { result } = renderHook(() =>
      useAgentChat(reviewerWith("none"), "agent-1", PROVIDERS, heard, NO_SERVERS, NO_REFUSALS),
    );

    act(() => result.current.changeDraft("Прогони тести"));
    act(() => result.current.send());

    await waitFor(() => expect(sent[CLOSE_RUN_CHANNEL]?.length).toBe(1));

    const asks = <{ messages: { from: string; text: string }[] }[]>sent[ASK_AGENT_CHANNEL];

    // Only the editor, whose memory is its own, read the record.
    expect(sent[READ_RUN_CHANNEL]).toHaveLength(1);
    expect(sent[SHARED_MEMORY_CHANNEL]).toBeUndefined();
    expect(asks[1].messages).toEqual([
      {
        from: "person",
        text: "Готово, тест зелений.",
      },
    ]);
  });

  it("lets the turn fall with the record's words where the shared memory cannot be read", async () => {
    const { sent, invoke } = recording();
    const answering = <(channel: string, payload?: unknown) => Promise<unknown>>invoke.getMockImplementation();

    (<Mock>invoke).mockImplementation(async (channel: string, payload?: unknown) => {
      if (channel === SHARED_MEMORY_CHANNEL) {
        throw new Error("SQLITE_IOERR: disk I/O error");
      }

      return answering(channel, payload);
    });

    const { result } = renderHook(() =>
      useAgentChat(reviewerWith("shared"), "agent-1", PROVIDERS, heard, NO_SERVERS, NO_REFUSALS),
    );

    act(() => result.current.changeDraft("Прогони тести"));
    act(() => result.current.send());

    await waitFor(() => expect(sent[CLOSE_RUN_CHANNEL]?.length).toBe(1));

    // The reviewer was never asked: no memory stood in for the one that could not be read.
    expect(sent[ASK_AGENT_CHANNEL]).toHaveLength(1);
    expect(
      result.current.messages.find((message) => message.from === "agent" && message.agentId === "agent-2")?.note,
    ).toContain("SQLITE_IOERR: disk I/O error");
  });
});

describe("useAgentChat writing the record of a run", () => {
  it("closes the row with the walk that was in it, and not before that walk is back", async () => {
    // A conversation walks one walk at a time and its row stays open while the walk is out; the reviewer is held, so
    // the editor's step is written with no end.
    const { sent, invoke, release } = recording({}, [], ["reviewer-model"]);
    const { result } = renderHook(() =>
      useAgentChat(REVIEWER_APART, "agent-1", PROVIDERS, heard, NO_SERVERS, NO_REFUSALS),
    );

    act(() => result.current.changeDraft("Прогони тести"));
    act(() => result.current.send());

    await waitFor(() => expect(invoke.mock.calls.filter(([channel]) => channel === ASK_AGENT_CHANNEL)).toHaveLength(2));
    await waitFor(() => expect(sent[ADD_RUN_STEP_CHANNEL]?.length).toBe(1));

    expect(sent[CLOSE_RUN_CHANNEL]).toBeUndefined();

    release();

    await waitFor(() => expect(sent[CLOSE_RUN_CHANNEL]?.length).toBe(1));
  });

  it("keeps the row on screen where the person put it, though another conversation writes its steps", async () => {
    // A run opened from history while the first walk is out; another conversation's walk writing its step and closing
    // its row must not move the screen.
    const { sent, invoke, release } = recording({}, [], ["reviewer-model"]);
    const { result } = renderHook(() =>
      useAgentChat(REVIEWER_APART, "agent-1", PROVIDERS, heard, NO_SERVERS, NO_REFUSALS),
    );

    act(() => result.current.changeDraft("Прогони тести"));
    act(() => result.current.send());

    // The editor has answered and the reviewer is held: the walk is out and its row is on screen.
    await waitFor(() => expect(invoke.mock.calls.filter(([channel]) => channel === ASK_AGENT_CHANNEL)).toHaveLength(2));
    await waitFor(() => expect(result.current.runId).toBe("run-1"));

    act(() => result.current.goOnIn("run-9"));

    expect(result.current.runId).toBe("run-9");

    release();

    // The other conversation's walk runs to its end and writes everything into its own row.
    await waitFor(() => expect(sent[CLOSE_RUN_CHANNEL]?.length).toBe(1));
    expect((<{ runId: string }[]>sent[CLOSE_RUN_CHANNEL])[0].runId).toBe("run-1");
    expect(result.current.runId).toBe("run-9");
  });

  it("writes a turn that never began as a step of its own, with nothing spent on it", async () => {
    const { sent, invoke } = recording();

    fallsOnce(invoke, new Error("LLM_NO_KEY"));

    const { result } = renderHook(() => useAgentChat(PROJECT, "agent-1", PROVIDERS, heard, NO_SERVERS, NO_REFUSALS));

    act(() => result.current.changeDraft("Прогони тести"));
    act(() => result.current.send());

    await waitFor(() => expect(sent[CLOSE_RUN_CHANNEL]?.length).toBe(1));

    const [written] = <WrittenStep[]>sent[ADD_RUN_STEP_CHANNEL];

    // The walk met a wall before it began; the record says which.
    expect(written.state).toBe(NOT_STARTED_ENDS.noKey.state);
    expect(written.said).toBe(result.current.messages.at(-1)?.text);
    expect(written.inputTokens).toBe(0);
    expect(written.outputTokens).toBe(0);
    expect(written.money).toBe(0);
    // Nothing went, so the turn took no time at all.
    expect(written.endedAt).toBe(written.startedAt);
    // The run's row is written too; it carries the card past an app close.
    expect(sent[OPEN_RUN_CHANNEL]?.length).toBe(1);
  });

  it("writes the question the moment it is asked, even where no turn of it begins", async () => {
    // The stand-in holds by the model's own title, which an ask carries.
    const { sent, release } = recording({}, [], ["claude-sonnet-4.5"]);
    const { result } = renderHook(() => useAgentChat(ALONE, "agent-1", PROVIDERS, heard, NO_SERVERS, NO_REFUSALS));

    act(() => result.current.changeDraft("Прогони тести"));
    act(() => result.current.send());

    // The row exists before any turn ends, so a flow reaching nobody is kept.
    await waitFor(() => expect(sent[OPEN_RUN_CHANNEL]?.length).toBe(1));
    expect(sent[ADD_RUN_STEP_CHANNEL]).toBeUndefined();

    act(() => result.current.changeDraft("Ще раз те саме"));
    act(() => result.current.send());

    // This conversation's walk is still out: nothing went, nothing was written.
    expect(sent[ASK_AGAIN_CHANNEL]).toBeUndefined();
    expect(sent[ASK_AGENT_CHANNEL]).toHaveLength(1);

    release();

    await waitFor(() => expect(sent[ADD_RUN_STEP_CHANNEL]?.length).toBe(1));
    // A question goes only after `CLOSE_RUN_CHANNEL`: the walk is over, writes settled, and the closed row's id is
    // known.
    await waitFor(() => expect(sent[CLOSE_RUN_CHANNEL]?.length).toBe(1));

    act(() => result.current.send());

    // The second question goes on in the standing row. Longest wait in the file (three answers over the bridge, then
    // the close), so it has an extended timeout.
    await waitFor(() => expect(sent[ASK_AGAIN_CHANNEL]?.length).toBe(1), {
      timeout: 5000,
    });
    expect(sent[ASK_AGENT_CHANNEL]).toHaveLength(2);
    expect(sent[OPEN_RUN_CHANNEL]).toHaveLength(1);
    expect(result.current.messages.filter((message) => message.from === "person")).toHaveLength(2);
  });

  it("says why a question aimed at an agent switched off stayed, and closes its row at once", async () => {
    const { sent } = recording();
    const { result } = renderHook(() =>
      useAgentChat(
        {
          ...ALONE,
          config: {
            ...ALONE.config,
            agents: ALONE.config.agents.map((one) => ({
              ...one,
              isActive: false,
            })),
          },
        },
        "agent-1",
        PROVIDERS,
        heard,
        NO_SERVERS,
        NO_REFUSALS,
      ),
    );

    act(() => result.current.changeDraft("Прогони тести"));
    act(() => result.current.send());

    // The words stay in the stream, the row says why they stayed, nobody was asked.
    await waitFor(() => expect(sent[CLOSE_RUN_CHANNEL]?.length).toBe(1));

    expect(sent[ASK_AGENT_CHANNEL]).toBeUndefined();
    expect(sent[ADD_RUN_STEP_CHANNEL]).toBeUndefined();
    expect(sent[OPEN_RUN_CHANNEL]).toHaveLength(1);
    expect(result.current.draft).toBe("");
    expect(result.current.messages.filter((message) => message.from === "person")).toHaveLength(1);
    expect(result.current.messages.at(-1)).toMatchObject({
      from: "notSent",
      agentId: "agent-1",
      stopReason: "off",
    });
  });

  it("opens one run for the whole walk, writes a step for each turn and closes it once", async () => {
    const { sent } = recording();
    const { result } = renderHook(() => useAgentChat(CHAIN, "agent-1", PROVIDERS, heard, NO_SERVERS, NO_REFUSALS));

    act(() => result.current.changeDraft("Прогони тести"));
    act(() => result.current.send());

    await waitFor(() => expect(sent[CLOSE_RUN_CHANNEL]?.length).toBe(1));

    const [opened] = <{ directory: string; startedByAgentId: string; asked: string; startedAt: number }[]>(
      sent[OPEN_RUN_CHANNEL]
    );

    expect(opened.directory).toBe("/tmp/project");
    expect(opened.startedByAgentId).toBe("agent-1");
    expect(opened.asked).toBe("Прогони тести");
    // The run starts with the question, not with the step that opened its row.
    expect(opened.startedAt).toBeLessThanOrEqual((<{ startedAt: number }[]>sent[ADD_RUN_STEP_CHANNEL])[0].startedAt);
    expect((<{ agentName: string }[]>sent[ADD_RUN_STEP_CHANNEL]).map((step) => step.agentName)).toEqual([
      "EDITOR",
      "REVIEWER",
      "SHIPPER",
    ]);
    const [closed] = <{ runId: string; endedAt: number }[]>sent[CLOSE_RUN_CHANNEL];

    expect(closed.runId).toBe("run-1");
    expect(closed.endedAt).toBeGreaterThanOrEqual(opened.startedAt);
  });

  it("names the step the work came from, so the walk can be drawn from the record alone", async () => {
    const { sent } = recording();
    const { result } = renderHook(() => useAgentChat(CHAIN, "agent-1", PROVIDERS, heard, NO_SERVERS, NO_REFUSALS));

    act(() => result.current.changeDraft("Прогони тести"));
    act(() => result.current.send());

    await waitFor(() => expect(sent[CLOSE_RUN_CHANNEL]?.length).toBe(1));

    expect((<{ fromStepIds: string[] }[]>sent[ADD_RUN_STEP_CHANNEL]).map((step) => step.fromStepIds)).toEqual([
      [],
      ["step-1"],
      ["step-2"],
    ]);
  });

  it("keeps what the turn ran with, since a prompt changes and a step must still say what it said", async () => {
    const { sent } = recording();
    const { result } = renderHook(() => useAgentChat(CHAIN, "agent-1", PROVIDERS, heard, NO_SERVERS, NO_REFUSALS));

    act(() => result.current.changeDraft("Прогони тести"));
    act(() => result.current.send());

    await waitFor(() => expect(sent[CLOSE_RUN_CHANNEL]?.length).toBe(1));

    // The prompt verbatim and the two numbers the person set, as they stood then.
    const [first] = <
      { prompt: string; promptId: string | null; modelId: string; temperature: number; maxCalls: number }[]
    >sent[ADD_RUN_STEP_CHANNEL];

    expect(first.temperature).toBe(0.3);
    expect(first.maxCalls).toBe(5);
    // The snapshot keeps the id of the thing it is a snapshot of.
    expect(first.modelId).toBe("model-1");
    expect(first.promptId).toBeNull();
    // These agents carry no prompt, so an agent without one ran with empty words.
    expect(first.prompt).toBe("");
  });

  it("writes the links the turn made, the one it could not take among them", async () => {
    const { sent } = recording();
    const { result } = renderHook(() => useAgentChat(HALF_OFF, "agent-1", PROVIDERS, heard, NO_SERVERS, NO_REFUSALS));

    act(() => result.current.changeDraft("Прогони тести"));
    act(() => result.current.send());

    await waitFor(() => expect(sent[CLOSE_RUN_CHANNEL]?.length).toBe(1));

    // A link not taken leaves no step, so the step that made it keeps it, e.g. «НЕ ПЕРЕДАЄ ⇢ LINTER · ВИМКНЕНИЙ» is in
    // the record, not only on screen.
    const [first] = <{ handoffs: { toAgentId: string; stopReason: string | null }[] }[]>sent[ADD_RUN_STEP_CHANNEL];

    expect(first.handoffs).toEqual([
      {
        toAgentId: "agent-2",
        stopReason: null,
      },
      {
        toAgentId: "agent-3",
        stopReason: "off",
      },
    ]);
  });

  it("keeps the agent as it stood, and what the turn counted", async () => {
    const { sent } = recording();
    const { result } = renderHook(() => useAgentChat(PROJECT, "agent-1", PROVIDERS, heard, NO_SERVERS, NO_REFUSALS));

    act(() => result.current.changeDraft("Прогони тести"));
    act(() => result.current.send());

    await waitFor(() => expect(sent[CLOSE_RUN_CHANNEL]?.length).toBe(1));

    const [step] = <Record<string, unknown>[]>sent[ADD_RUN_STEP_CHANNEL];

    expect(step.agentColor).toBe("#b18aff");
    expect(step.model).toBe("claude-sonnet-4.5");
    expect(step.providerId).toBe("anthropic");
    expect(step.state).toBe("done");
    expect(step.inputTokens).toBe(10);
    expect(step.outputTokens).toBe(20);
    expect(step.said).toBe("Готово, тест зелений.");
  });

  it("writes a call that ran and a call the check refused, each by the end it came to", async () => {
    const { sent } = recording({
      calls: [
        {
          id: "call-1",
          source: "command",
          name: "find_deep",
          pinned: [],
          arguments: {
            depth: "швидко",
          },
          line: "",
          output: "",
          refusal: "[find_deep не запустилась: depth — має бути числом, прийшло «швидко»]",
          exitCode: null,
          serverId: null,
          serverName: "",
          isFailed: false,
          startedAt: 1,
          endedAt: 2,
        },
        {
          id: "call-2",
          source: "command",
          name: "find_deep",
          pinned: [],
          arguments: {
            depth: "2",
          },
          line: "find . -maxdepth 2",
          output: "report.md",
          refusal: "",
          exitCode: 0,
          serverId: null,
          serverName: "",
          isFailed: false,
          startedAt: 3,
          endedAt: 9,
        },
      ],
    });
    const { result } = renderHook(() => useAgentChat(PROJECT, "agent-1", PROVIDERS, heard, NO_SERVERS, NO_REFUSALS));

    act(() => result.current.changeDraft("Знайди md-файли"));
    act(() => result.current.send());

    await waitFor(() => expect(sent[CLOSE_RUN_CHANNEL]?.length).toBe(1));

    const [step] = <{ calls: { name: string; end: string; exitCode: number | null }[] }[]>sent[ADD_RUN_STEP_CHANNEL];

    expect(step.calls.map((call) => [call.name, call.end, call.exitCode])).toEqual([
      ["find_deep", "refused", null],
      ["find_deep", "ran", 0],
    ]);

    // The two calls stay in the chat with the answer after the card is gone.
    expect(result.current.messages.find((message) => message.from === "agent")?.calls.map((call) => call.id)).toEqual([
      "call-1",
      "call-2",
    ]);
  });

  it("writes the fall on the step it happened in, and closes the run all the same", async () => {
    const { sent, invoke } = recording();

    fallsOnce(invoke, new Error("мережа мовчить"));

    const { result } = renderHook(() => useAgentChat(PROJECT, "agent-1", PROVIDERS, heard, NO_SERVERS, NO_REFUSALS));

    act(() => result.current.changeDraft("Прогони тести"));
    act(() => result.current.send());

    await waitFor(() => expect(sent[CLOSE_RUN_CHANNEL]?.length).toBe(1));

    // The step carries its ending word; the run's state is counted from the steps.
    expect((<{ state: string }[]>sent[ADD_RUN_STEP_CHANNEL])[0].state).toBe("failed");
  });
});

describe("useAgentChat as one stream", () => {
  it("holds every agent's turns in one flow, each saying whose it is", async () => {
    const { sent } = recording();
    const { result } = renderHook(() => useAgentChat(CHAIN, "agent-1", PROVIDERS, heard, NO_SERVERS, NO_REFUSALS));

    act(() => result.current.changeDraft("Прогони тести"));
    act(() => result.current.send());

    await waitFor(() => expect(sent[CLOSE_RUN_CHANNEL]?.length).toBe(1));

    // Question, answer, handoff and the next agent's turn stand in one stream.
    expect(
      result.current.messages.filter((message) => message.from === "agent").map((message) => message.agentId),
    ).toEqual(["agent-1", "agent-2", "agent-3"]);
    expect(result.current.messages.every((message) => message.agentId !== "")).toBe(true);
  });

  it("keeps the stream in the order things happened, whichever agent said them", async () => {
    const { sent } = recording();
    const { result } = renderHook(() => useAgentChat(CHAIN, "agent-1", PROVIDERS, heard, NO_SERVERS, NO_REFUSALS));

    act(() => result.current.changeDraft("Прогони тести"));
    act(() => result.current.send());

    await waitFor(() => expect(sent[CLOSE_RUN_CHANNEL]?.length).toBe(1));

    const said = result.current.messages.map((message) => message.at);

    expect([...said].sort((one, other) => one.localeCompare(other))).toEqual(said);
  });

  it("goes on in the record it already has when the same conversation is asked again", async () => {
    const { sent } = recording();
    const { result } = renderHook(() => useAgentChat(ALONE, "agent-1", PROVIDERS, heard, NO_SERVERS, NO_REFUSALS));

    act(() => result.current.changeDraft("Прогони тести"));
    act(() => result.current.send());

    await waitFor(() => expect(sent[CLOSE_RUN_CHANNEL]?.length).toBe(1));

    act(() => result.current.changeDraft("Додай опис і постав рев'ювера"));
    act(() => result.current.send());

    await waitFor(() => expect(sent[ASK_AGAIN_CHANNEL]?.length).toBe(1));

    // One conversation is one row; the second question goes on in it.
    expect(sent[OPEN_RUN_CHANNEL]).toHaveLength(1);
    expect(sent[ASK_AGAIN_CHANNEL]?.[0]).toMatchObject({
      runId: "run-1",
      asked: "Додай опис і постав рев'ювера",
    });

    // Every step names its question by the id the question was asked with.
    const written = <{ questionId: string }[]>sent[ADD_RUN_STEP_CHANNEL];
    const [opened] = <{ questionId: string }[]>sent[OPEN_RUN_CHANNEL];
    const [again] = <{ questionId: string }[]>sent[ASK_AGAIN_CHANNEL];

    expect(written[0].questionId).toBe(opened.questionId);
    expect(written.at(-1)?.questionId).toBe(again.questionId);
    expect(again.questionId).not.toBe(opened.questionId);
  });

  it("opens a record of its own after a fresh chat, since that is where one conversation ends", async () => {
    const { sent } = recording();
    const { result } = renderHook(() => useAgentChat(ALONE, "agent-1", PROVIDERS, heard, NO_SERVERS, NO_REFUSALS));

    act(() => result.current.changeDraft("Прогони тести"));
    act(() => result.current.send());

    await waitFor(() => expect(sent[CLOSE_RUN_CHANNEL]?.length).toBe(1));

    act(() => result.current.fresh());
    act(() => result.current.changeDraft("Зовсім інше питання"));
    act(() => result.current.send());

    await waitFor(() => expect(sent[OPEN_RUN_CHANNEL]?.length).toBe(2));

    expect(sent[ASK_AGAIN_CHANNEL]).toBeUndefined();
  });

  it("sets no turn going after the walk was stopped, whoever would have started it", async () => {
    const sent: Record<string, unknown[]> = {};
    let answer: (said: SaidTurn) => void = () => undefined;
    const record = recordStandIn();
    const invoke = vi.fn(async (channel: string, payload?: unknown) => {
      sent[channel] = [...(sent[channel] ?? []), payload];

      if (channel === ASK_AGENT_CHANNEL) {
        return await new Promise<SaidTurn>((resolve) => {
          answer = resolve;
        });
      }

      if (channel === OPEN_RUN_CHANNEL) {
        return {
          runId: "run-1",
          questionId: "question-1",
        };
      }

      return channel === ADD_RUN_STEP_CHANNEL ? "step-1" : record.answer(channel, payload);
    });

    standInBridge({
      invoke,
    });

    const { result } = renderHook(() => useAgentChat(CHAIN, "agent-1", PROVIDERS, heard, NO_SERVERS, NO_REFUSALS));

    act(() => result.current.changeDraft("Прогони тести"));
    act(() => result.current.send());

    await waitFor(() => expect(sent[ASK_AGENT_CHANNEL]?.length).toBe(1));

    act(() => result.current.stop());

    await act(async () => {
      answer({
        text: "Готово, тест зелений.",
        isStopped: false,
        isCallsExhausted: false,
        isCeilingHit: false,
        inputTokens: 10,
        outputTokens: 20,
        calls: [],
      });
    });

    // A stop ends the walk, not one turn: the hand-off does not start the next.
    expect(sent[ASK_AGENT_CHANNEL]).toHaveLength(1);
  });

  it("asks the same agent the same question again, as a turn of its own in the same conversation", async () => {
    const { sent } = recording({
      text: "",
    });
    const { result } = renderHook(() => useAgentChat(ALONE, "agent-1", PROVIDERS, heard, NO_SERVERS, NO_REFUSALS));

    act(() => result.current.changeDraft("Підсумуй, що змінилось"));
    act(() => result.current.send());

    await waitFor(() => expect(sent[CLOSE_RUN_CHANNEL]?.length).toBe(1));

    // The model said nothing; the app's one repeat asks the same turn again.
    expect(result.current.messages.at(-1)?.note).toBe(CHAT_SAID_NOTHING_NOTE);

    const said = result.current.messages.length;

    act(() => result.current.sayAgain(broken(result.current.messages)));

    await waitFor(() => expect(sent[ASK_AGENT_CHANNEL]?.length).toBe(2));

    // The broken turn reruns verbatim, read back from the record.
    expect((<{ messages: { text: string }[] }>sent[ASK_AGENT_CHANNEL]?.[1]).messages[0].text).toBe(
      "Підсумуй, що змінилось",
    );
    // The walk is picked up, not begun: nothing of the person's is said twice.
    await waitFor(() => expect(result.current.messages.length).toBe(said + 1));
    expect(result.current.messages.filter((message) => message.from === "person")).toHaveLength(1);
    // It goes on in the standing record and is not a question of the person's.
    expect(sent[OPEN_RUN_CHANNEL]).toHaveLength(1);
    expect(sent[ASK_AGAIN_CHANNEL]).toBeUndefined();

    const written = <{ questionId: string; fromStepIds: string[] }[]>sent[ADD_RUN_STEP_CHANNEL];
    const [opened] = <{ questionId: string }[]>sent[OPEN_RUN_CHANNEL];

    expect(written.at(-1)?.questionId).toBe(opened.questionId);
  });

  it("hands the point what had already arrived, and runs the broken turn again beside it", async () => {
    const { sent, invoke, release } = recording({}, ["model-2"], ["model-4"]);
    const { result } = renderHook(() => useAgentChat(FAN, "agent-1", PROVIDERS, heard, NO_SERVERS, NO_REFUSALS));

    act(() => result.current.changeDraft("Перевір гілку перед мержем"));
    act(() => result.current.send());
    await stood();

    // The walk broke on the fallen supplier; the point below it was never asked.
    expect(askedOf(invoke, "model-4")).toBeUndefined();

    act(() => result.current.sayAgain(broken(result.current.messages)));
    await waitFor(() => expect(askedOf(invoke, "model-4")).toBeDefined());

    // The point got both works: the one in the record since the break and the one the repeat brought.
    const asked = askedOf(invoke, "model-4")?.messages[0].text ?? "";

    expect(asked.match(/Готово, тест зелений\./g)).toHaveLength(2);
    // While the point works, both lines its work came by carry it, including the one picked up from the record.
    const flowing = () =>
      Object.entries(result.current.linkLives)
        .filter(([, life]) => life === "running")
        .map(([linkId]) => linkId)
        .sort();

    await waitFor(() => expect(flowing()).toHaveLength(2));
    expect(flowing()).toEqual(["link-3", "link-4"]);

    act(() => release());
    await stood();

    // Nothing of this is a question of the person's.
    expect(sent[ASK_AGAIN_CHANNEL]).toBeUndefined();
  });

  it("says the link a repeat cannot take, instead of passing the neighbour over without a word", async () => {
    const { sent, invoke } = recording({}, ["model-2"]);
    const { result, rerender } = renderHook(
      ({ project }) => useAgentChat(project, "agent-1", PROVIDERS, heard, NO_SERVERS, NO_REFUSALS),
      {
        initialProps: {
          project: FAN,
        },
      },
    );

    act(() => result.current.changeDraft("Перевір гілку перед мержем"));
    act(() => result.current.send());

    await waitFor(() => expect(sent[CLOSE_RUN_CHANNEL]?.length).toBe(1));

    // The person switches the point off between the break and the repeat.
    rerender({
      project: POINT_OFF,
    });
    act(() => result.current.sayAgain(broken(result.current.messages)));

    // The work read back from the record has nowhere to go; the stream says so.
    await waitFor(() =>
      expect(
        result.current.messages.some(
          (message) =>
            message.from === "handoff" &&
            message.agentId === "agent-3" &&
            message.otherAgentId === "agent-4" &&
            message.stopReason === "off",
        ),
      ).toBe(true),
    );

    expect(askedOf(invoke, "model-4")).toBeUndefined();
  });

  it("asks nobody when there is no record to pick a walk up out of", async () => {
    const { sent } = recording();
    const { result } = renderHook(() => useAgentChat(ALONE, "agent-1", PROVIDERS, heard, NO_SERVERS, NO_REFUSALS));

    act(() => result.current.sayAgain(row("walk-nobody-holds")));

    expect(sent[READ_RUN_CHANNEL]).toBeUndefined();
    expect(sent[ASK_AGENT_CHANNEL]).toBeUndefined();
    expect(result.current.messages).toEqual([]);
  });

  it("asks nobody where the walk of that row names a question the record does not hold", async () => {
    const { sent } = recording();
    const { result } = renderHook(() => useAgentChat(ALONE, "agent-1", PROVIDERS, heard, NO_SERVERS, NO_REFUSALS));

    act(() => result.current.changeDraft("Прогони тести"));
    act(() => result.current.send());
    await waitFor(() => expect(sent[CLOSE_RUN_CHANNEL]?.length).toBe(1));

    const asked = sent[ASK_AGENT_CHANNEL]?.length ?? 0;

    act(() => result.current.sayAgain(row("walk-nobody-holds")));
    await waitFor(() => expect(sent[READ_RUN_CHANNEL]?.length).toBe(1));

    // The id found no question, so the repeat stands still rather than speak under a neighbour.
    expect(sent[ASK_AGENT_CHANNEL]?.length ?? 0).toBe(asked);
  });

  it("writes into the record the person opened, and not into the one the stream held before", async () => {
    const { sent } = recording();
    const { result } = renderHook(() => useAgentChat(ALONE, "agent-1", PROVIDERS, heard, NO_SERVERS, NO_REFUSALS));

    act(() => result.current.changeDraft("Прогони тести"));
    act(() => result.current.send());

    await waitFor(() => expect(sent[CLOSE_RUN_CHANNEL]?.length).toBe(1));

    // An older run opened from history replaces the stream and takes the words.
    act(() => result.current.goOnIn("run-9"));
    act(() => result.current.changeDraft("Додай опис"));
    act(() => result.current.send());

    await waitFor(() => expect(sent[ASK_AGAIN_CHANNEL]?.length).toBe(1));

    expect(sent[ASK_AGAIN_CHANNEL]?.[0]).toMatchObject({
      runId: "run-9",
      asked: "Додай опис",
    });
    expect(sent[OPEN_RUN_CHANNEL]).toHaveLength(1);
  });

  it("lets the conversation go when the record it writes into is deleted", async () => {
    const { sent } = recording();
    const { result } = renderHook(() => useAgentChat(ALONE, "agent-1", PROVIDERS, heard, NO_SERVERS, NO_REFUSALS));

    act(() => result.current.changeDraft("Прогони тести"));
    act(() => result.current.send());

    await waitFor(() => expect(sent[CLOSE_RUN_CHANNEL]?.length).toBe(1));

    act(() => result.current.letGo("run-1"));

    // The stream was that record read out, so it goes with it and the next question is new.
    expect(result.current.messages).toEqual([]);

    act(() => result.current.changeDraft("Зовсім інше питання"));
    act(() => result.current.send());

    await waitFor(() => expect(sent[OPEN_RUN_CHANNEL]?.length).toBe(2));

    expect(sent[ASK_AGAIN_CHANNEL]).toBeUndefined();
  });

  it("keeps the stream standing when the record deleted is somebody else's", async () => {
    const { sent } = recording();
    const { result } = renderHook(() => useAgentChat(ALONE, "agent-1", PROVIDERS, heard, NO_SERVERS, NO_REFUSALS));

    act(() => result.current.changeDraft("Прогони тести"));
    act(() => result.current.send());

    await waitFor(() => expect(sent[CLOSE_RUN_CHANNEL]?.length).toBe(1));

    act(() => result.current.letGo("run-2"));

    expect(result.current.messages.length).toBeGreaterThan(0);
  });

  it("says each answer once: what came down a line is the supplier's own words, already standing", async () => {
    const { sent } = recording();
    const { result } = renderHook(() => useAgentChat(CHAIN, "agent-1", PROVIDERS, heard, NO_SERVERS, NO_REFUSALS));

    act(() => result.current.changeDraft("Прогони тести"));
    act(() => result.current.send());

    await waitFor(() => expect(sent[CLOSE_RUN_CHANNEL]?.length).toBe(1));

    // Otherwise the same words would stand three times: as EDITOR's answer and in both chats it fed.
    expect(result.current.messages.filter((message) => message.from === "supplier")).toEqual([]);
    expect(result.current.messages.filter((message) => message.text === "Готово, тест зелений.")).toHaveLength(3);
  });
});
