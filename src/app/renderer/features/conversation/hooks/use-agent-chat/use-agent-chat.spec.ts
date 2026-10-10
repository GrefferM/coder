import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useAgentChat } from "./use-agent-chat";
import {
  CONFIGURE_WALKS_CHANNEL,
  FRESH_WALKS_CHANNEL,
  GO_ON_IN_WALKS_CHANNEL,
  LET_GO_WALKS_CHANNEL,
  OPEN_WALKS_CHANNEL,
  PUT_WALK_CHANNEL,
  SAY_WALK_AGAIN_CHANNEL,
  STOP_WALKS_CHANNEL,
  WALKS_CHANGED_CHANNEL,
  WALKS_HEARD_CHANNEL,
  WALKS_WRITTEN_CHANNEL,
} from "../../../../../../contracts";
import { begunWalk, emptyWalk } from "../../logic";
import type { WalkSnapshot } from "../../../../../../contracts";
import type { Agent, OpenProject, ProviderState } from "../../../../interfaces";
import type { ChatMessage } from "../../interfaces";
import { aConfig, aLink, aModel, anAgent, standInBridge } from "../../../../testing";

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

const NO_REFUSALS = () => undefined;

/** One card said in a walk, as the backend tells it. */
function said(patch: Partial<ChatMessage> = {}): ChatMessage {
  return {
    id: "said-1",
    agentId: "agent-1",
    from: "agent",
    text: "Готово, тест зелений.",
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
    walkId: "walk-1",
    note: null,
    asked: null,
    fedBy: [],
    attached: [],
    ...patch,
  };
}

/** The walks of a conversation: the named walk with its words, and a turn out when `isOut`. */
function walking(isOut: boolean, words: ChatMessage[] = [], patch: Partial<WalkSnapshot> = {}): WalkSnapshot {
  return {
    ...emptyWalk(),
    walks: {
      "walk-1": {
        ...begunWalk("question-1", 1),
        said: words,
      },
    },
    out: isOut
      ? {
          "turn-1": {
            turnId: "turn-1",
            agentId: "agent-1",
            startedAt: 5,
            viaLinkIds: [],
            runKey: "walk-1",
          },
        }
      : {},
    ...patch,
  };
}

/** A backend that takes every question under the next walk id; what it was sent is kept, and pushes can be made. */
function backend(answers: { opened?: WalkSnapshot; put?: (nth: number) => string | null } = {}) {
  const listeners: Record<string, ((pushed: unknown) => void)[]> = {};
  const sent: { channel: string; payload: unknown }[] = [];
  let puts = 0;
  const invoke = vi.fn(async (channel: string, payload?: unknown) => {
    sent.push({
      channel,
      payload,
    });

    if (channel === OPEN_WALKS_CHANNEL) {
      return answers.opened ?? emptyWalk();
    }

    if (channel === PUT_WALK_CHANNEL) {
      puts += 1;

      return answers.put === undefined ? `walk-${puts}` : answers.put(puts);
    }

    return undefined;
  });

  standInBridge({
    invoke,
    subscribe: (channel, listener) => {
      listeners[channel] = [...(listeners[channel] ?? []), <(pushed: unknown) => void>listener];

      return () => {
        listeners[channel] = (listeners[channel] ?? []).filter((one) => one !== listener);
      };
    },
  });

  return {
    /** What the screen sent on this channel, in order. */
    sentOn: (channel: string) => sent.filter((one) => one.channel === channel).map((one) => one.payload),
    push: (channel: string, pushed?: unknown) => {
      for (const listener of listeners[channel] ?? []) {
        listener(pushed);
      }
    },
  };
}

/** Opens the hook on a project and waits for the conversation to be opened in the backend. */
async function opened(project: OpenProject = PROJECT, heard = vi.fn()) {
  const rendered = renderHook(
    ({ held }: { held: OpenProject }) => useAgentChat(held, "agent-1", PROVIDERS, heard, NO_REFUSALS),
    {
      initialProps: {
        held: project,
      },
    },
  );

  await waitFor(() => expect(rendered.result.current).toBeDefined());

  return rendered;
}

describe("useAgentChat", () => {
  it("opens the project's conversation in the backend with its directory and config, once", async () => {
    const door = backend();

    await opened();

    await waitFor(() => expect(door.sentOn(OPEN_WALKS_CHANNEL)).toHaveLength(1));
    expect(door.sentOn(OPEN_WALKS_CHANNEL)[0]).toEqual({
      directory: "/tmp/project",
      config: PROJECT.config,
    });
    expect(door.sentOn(CONFIGURE_WALKS_CHANNEL)).toEqual([]);
  });

  it("shows the walks the backend already holds when it opens", async () => {
    backend({
      opened: walking(false, [said()]),
    });

    const { result } = await opened();

    await waitFor(() => expect(result.current.messages.map((one) => one.text)).toEqual(["Готово, тест зелений."]));
  });

  it("shows what the backend pushes and stands working while a turn is out", async () => {
    const door = backend();
    const { result } = await opened();

    act(() => door.push(WALKS_CHANGED_CHANNEL, walking(true)));

    expect(result.current.isWorking).toBe(true);
    expect(result.current.startedAt).toBe(5);

    act(() => door.push(WALKS_CHANGED_CHANNEL, walking(false, [said()])));

    expect(result.current.isWorking).toBe(false);
    expect(result.current.messages).toHaveLength(1);
  });

  it("tells the backend a new config when the screen's changes, and not before", async () => {
    const door = backend();
    const { rerender } = await opened();
    const changed = {
      ...PROJECT,
      config: {
        ...PROJECT.config,
        links: [],
      },
    };

    await waitFor(() => expect(door.sentOn(OPEN_WALKS_CHANNEL)).toHaveLength(1));
    rerender({
      held: changed,
    });

    await waitFor(() =>
      expect(door.sentOn(CONFIGURE_WALKS_CHANNEL)).toEqual([
        {
          config: changed.config,
        },
      ]),
    );
  });

  it("puts the typed question to the aimed agent and clears the field", async () => {
    const door = backend();
    const { result } = await opened();

    act(() => result.current.changeDraft("  Зроби це  "));
    act(() => result.current.send());

    await waitFor(() =>
      expect(door.sentOn(PUT_WALK_CHANNEL)).toEqual([
        {
          agentId: "agent-1",
          text: "Зроби це",
          attached: [],
        },
      ]),
    );
    expect(result.current.draft).toBe("");
  });

  it("sends nothing for an empty field", async () => {
    const door = backend();
    const { result } = await opened();

    act(() => result.current.changeDraft("   "));
    act(() => result.current.send());

    expect(door.sentOn(PUT_WALK_CHANNEL)).toEqual([]);
  });

  it("sends nothing while a turn of the conversation is out, and keeps what was typed", async () => {
    const door = backend();
    const { result } = await opened();

    act(() => door.push(WALKS_CHANGED_CHANNEL, walking(true)));
    act(() => result.current.changeDraft("Ще одне"));
    act(() => result.current.send());

    expect(door.sentOn(PUT_WALK_CHANNEL)).toEqual([]);
    expect(result.current.draft).toBe("Ще одне");
  });

  it("sends a second question only after the backend has answered the first", async () => {
    const door = backend();
    const { result } = await opened();

    act(() => result.current.changeDraft("Перше"));
    act(() => result.current.send());
    // The backend has not named the walk yet, so the screen holds nothing walking.
    act(() => result.current.changeDraft("Друге"));
    act(() => result.current.send());

    await waitFor(() => expect(door.sentOn(PUT_WALK_CHANNEL)).toHaveLength(1));
  });

  it("gives the question back to the field when the backend took none", async () => {
    backend({
      put: () => null,
    });

    const { result } = await opened();

    act(() => result.current.changeDraft("Зроби це"));
    act(() => result.current.send());

    await waitFor(() => expect(result.current.draft).toBe("Зроби це"));
  });

  it("sends the same question again after each whole walk until the count is reached", async () => {
    const door = backend();
    const { result } = await opened();

    act(() => result.current.setRepeats(2));
    act(() => result.current.changeDraft("Зроби це"));
    act(() => result.current.send());

    await waitFor(() => expect(door.sentOn(PUT_WALK_CHANNEL)).toHaveLength(1));
    expect(result.current.repeating).toEqual({
      sent: 1,
      total: 2,
    });

    // The walk is out: the field stays shut.
    act(() => door.push(WALKS_CHANGED_CHANNEL, walking(true)));
    expect(door.sentOn(PUT_WALK_CHANNEL)).toHaveLength(1);

    // Its end: the next goes.
    act(() => door.push(WALKS_CHANGED_CHANNEL, walking(false, [said()])));

    await waitFor(() => expect(door.sentOn(PUT_WALK_CHANNEL)).toHaveLength(2));
    expect(door.sentOn(PUT_WALK_CHANNEL)[1]).toEqual({
      agentId: "agent-1",
      text: "Зроби це",
      attached: [],
    });
  });

  it("ends the repeats when a walk fell", async () => {
    const door = backend();
    const { result } = await opened();

    act(() => result.current.setRepeats(3));
    act(() => result.current.changeDraft("Зроби це"));
    act(() => result.current.send());

    await waitFor(() => expect(door.sentOn(PUT_WALK_CHANNEL)).toHaveLength(1));
    act(() =>
      door.push(
        WALKS_CHANGED_CHANNEL,
        walking(false, [
          said({
            isFailure: true,
          }),
        ]),
      ),
    );

    await waitFor(() => expect(result.current.repeating).toBeNull());
    expect(door.sentOn(PUT_WALK_CHANNEL)).toHaveLength(1);
  });

  it("ends the repeats and tells the backend on «ЗУПИНИТИ»", async () => {
    const door = backend();
    const { result } = await opened();

    act(() => result.current.setRepeats(3));
    act(() => result.current.changeDraft("Зроби це"));
    act(() => result.current.send());
    await waitFor(() => expect(door.sentOn(PUT_WALK_CHANNEL)).toHaveLength(1));

    act(() => result.current.stop());

    expect(result.current.repeating).toBeNull();
    await waitFor(() => expect(door.sentOn(STOP_WALKS_CHANNEL)).toHaveLength(1));
  });

  it("empties the stream on «+ НОВИЙ ЧАТ», telling the backend", async () => {
    const door = backend();
    const { result } = await opened();

    act(() => result.current.changeDraft("недописане"));
    act(() => result.current.fresh());

    expect(result.current.draft).toBe("");
    await waitFor(() => expect(door.sentOn(FRESH_WALKS_CHANNEL)).toHaveLength(1));
  });

  it("keeps what was typed in a run's stream apart from the fresh stream", async () => {
    const door = backend();
    const { result } = await opened();

    act(() => result.current.changeDraft("у новому"));
    act(() =>
      door.push(
        WALKS_CHANGED_CHANNEL,
        walking(false, [], {
          flowRunId: "run-1",
        }),
      ),
    );

    expect(result.current.runId).toBe("run-1");
    expect(result.current.draft).toBe("");

    act(() => result.current.changeDraft("у run-1"));
    act(() => door.push(WALKS_CHANGED_CHANNEL, emptyWalk()));

    expect(result.current.draft).toBe("у новому");
  });

  it("asks the backend to go on in a run opened from the history", async () => {
    const door = backend();
    const { result } = await opened();

    act(() => result.current.goOnIn("run-1"));

    await waitFor(() =>
      expect(door.sentOn(GO_ON_IN_WALKS_CHANNEL)).toEqual([
        {
          runId: "run-1",
        },
      ]),
    );
  });

  it("lets go of a run only when the conversation writes into it", async () => {
    const door = backend();
    const { result } = await opened();

    act(() =>
      door.push(
        WALKS_CHANGED_CHANNEL,
        walking(false, [], {
          flowRunId: "run-1",
        }),
      ),
    );
    act(() => result.current.changeDraft("у run-1"));
    act(() => result.current.letGo("run-2"));

    expect(result.current.draft).toBe("у run-1");

    act(() => result.current.letGo("run-1"));
    // The backend empties the conversation and tells so; what was typed under the run stays with the run.
    act(() => door.push(WALKS_CHANGED_CHANNEL, emptyWalk()));

    expect(result.current.runId).toBeNull();
    expect(result.current.draft).toBe("");
    await waitFor(() => expect(door.sentOn(LET_GO_WALKS_CHANNEL)).toHaveLength(2));
  });

  it("asks the backend to say a card again", async () => {
    const door = backend();
    const { result } = await opened();
    const card = said();

    act(() => result.current.sayAgain(card));

    await waitFor(() =>
      expect(door.sentOn(SAY_WALK_AGAIN_CHANNEL)).toEqual([
        {
          said: card,
        },
      ]),
    );
  });

  it("counts a write to the record and passes on a provider that answered", async () => {
    const door = backend();
    const heard = vi.fn();
    const { result } = await opened(PROJECT, heard);

    act(() => door.push(WALKS_WRITTEN_CHANNEL));
    act(() => door.push(WALKS_WRITTEN_CHANNEL));
    act(() =>
      door.push(WALKS_HEARD_CHANNEL, {
        providerId: "anthropic",
        isAnswering: true,
      }),
    );

    expect(result.current.written).toBe(2);
    expect(heard).toHaveBeenCalledWith("anthropic", true);
  });
});
