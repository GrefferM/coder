import { useEffect, useState } from "react";
import {
  chatFileName,
  chatStanding,
  chatText,
  foundInStream,
  foundMessage,
  openedStream,
  saveChatText,
  standingIn,
} from "../../../../features/conversation";
import { RUN_DONE, runAgents, useOpenedRun, useRunHistory, useRunSearch } from "../../../../features/record";
import type { AgentChatState, ChatHead, ChatMessage, ChatTab } from "../../../../features/conversation";
import type { NamedAgent } from "../../../../interfaces";
import type { RunHit, RunRow } from "../../../../features/record";
import type { ShownStream } from "./interfaces";

/**
 * Which stream is shown, the live conversation or a run opened from history, and what the history list can do to a run.
 * An opened run takes the stream's place: questions continue its own record, and deleting it deletes the conversation.
 */
export function useShownStream(
  directory: string,
  agents: NamedAgent[],
  chat: AgentChatState,
  /** Both marks on a sphere belong to one agent, so moving the aim moves the selection. */
  select: (agentId: string | null) => void,
): ShownStream {
  const [tab, setTab] = useState<ChatTab>("stream");
  /** The opened run; the stream shows it and everything said since, until «До потоку». */
  const [openedRunId, setOpenedRunId] = useState<string | null>(null);
  // The run armed for deletion; its question shows over the working area.
  const [doomedRun, setDoomedRun] = useState<RunRow | null>(null);
  // Whether the whole visible list is armed for deletion.
  const [isForgettingAll, setIsForgettingAll] = useState(false);
  /** The search word, shared by the history list and the stream. */
  const [query, setQuery] = useState("");
  /** The hit a pressed row pointed at; the stream scrolls to and marks that message. */
  const [drivenTo, setDrivenTo] = useState<RunHit | null>(null);
  /**
   * Whether the caret is in the stream's field: set by ⌘F or pressing into it, not by a word arriving from a history row.
   */
  const [isTyping, setIsTyping] = useState(false);
  /**
   * The match the stream stands on; null means wherever the search put it (the freshest match, or the message a pressed
   * row pointed at).
   */
  const [at, setAt] = useState<number | null>(null);
  const history = useRunHistory(directory, tab === "history", chat.written);
  const search = useRunSearch(directory, query, chat.written);
  const opened = useOpenedRun(openedRunId, chat.written);
  const endedRuns = history.runs.filter((run) => run.endedAt !== null);

  // An open list marks its news as read.
  useEffect(() => {
    if (tab === "history") {
      chat.readNews();
    }
  }, [tab, chat.isNewsElsewhere, chat.readNews]);

  /**
   * The stream under an opened run: the record and the live stream's words for the same run, each from one source. Empty
   * until the record is read.
   */
  function messages(): ChatMessage[] {
    if (openedRunId === null) {
      return chat.messages;
    }

    return opened.run === null ? [] : openedStream(opened.run, chat.messages);
  }

  /** The band over the stream: the flow's state and last activity, read the same way as the history row's. */
  function head(): ChatHead | null {
    if (openedRunId !== null) {
      return {
        at: opened.run === null ? new Date() : (opened.run.endedAt ?? opened.run.askedAt),
        state: opened.run?.state ?? RUN_DONE,
        isOpened: true,
        isFailed: opened.isFailed,
      };
    }

    const last = chat.messages.at(-1);

    if (last === undefined) {
      return null;
    }

    return {
      at: new Date(last.at),
      // An unanswered last turn shows the history's dot, by the same shared rule.
      state: chatStanding(chat.messages),
      isOpened: false,
      isFailed: false,
    };
  }

  /** Deleted permanently, along with the run opened in the stream. */
  async function forgetRun() {
    const doomed = doomedRun;

    setDoomedRun(null);

    if (doomed === null) {
      return;
    }

    // A refused removal is said in the history and takes nothing with it.
    if (!(await history.forget(doomed.id))) {
      return;
    }

    // The conversation goes with its record, whether the stream wrote into it or read it.
    chat.letGo(doomed.id);

    if (openedRunId === doomed.id) {
      // The stream opens fresh rather than restoring the older conversation.
      setOpenedRunId(null);
      chat.fresh();
    }
  }

  /** Deletes every run of the project and the conversation on screen. */
  async function forgetAllRuns() {
    setIsForgettingAll(false);

    if (!(await history.forgetAll())) {
      return;
    }

    // The stream is left fresh for when the person returns from history.
    setOpenedRunId(null);
    chat.fresh();
  }

  const shown = messages();
  // Agents are named as they are today; a removed one keeps the record's name.
  const shownAgents = runAgents(opened.run, agents);
  /** The stream's messages containing the word, freshest first (order from `foundInStream`). */
  const inStream = foundInStream(shown, query);

  /** Writes the stream as a plain-text transcript to the chosen path; a dismissed chooser writes nothing. */
  async function exportChat() {
    try {
      await saveChatText(chatText(shown, shownAgents), chatFileName());
    } catch {
      // A failed write leaves the conversation unchanged.
    }
  }
  /** The message a pressed row pointed at; the stream stays there until moved. */
  const promised = foundMessage(shown, drivenTo);
  const standingAt = standingIn(inStream, at, promised);

  /** Enter steps to the next match and ⇧Enter to the previous, wrapping around. */
  function step(by: number) {
    if (inStream.length === 0) {
      return;
    }

    setIsTyping(true);
    setAt((inStream.length + standingAt + by) % inStream.length);
  }

  return {
    tab,
    showTab: setTab,
    messages: shown,
    agents: shownAgents,
    head: head(),
    exportChat,
    shownRunId: openedRunId ?? chat.runId,
    runs: history.runs,
    refusal: history.refusal ?? search.refusal,
    endedRuns,
    doomedRun,
    armForget: setDoomedRun,
    dismissForget: () => setDoomedRun(null),
    forgetRun,
    doomedRuns: isForgettingAll ? endedRuns : null,
    armForgetAll: () => setIsForgettingAll(true),
    dismissForgetAll: () => setIsForgettingAll(false),
    forgetAllRuns,
    query,
    /** Searches again on every keystroke. */
    search: (asked: string) => {
      setQuery(asked);
      // A new word restarts from the search's own position.
      setAt(null);
    },
    /** Focuses the field once asked for. */
    isTyping,
    openSearch: () => setIsTyping(true),
    /** Escape clears the field and both marks; the stream stays where it scrolled. */
    closeSearch: () => {
      setIsTyping(false);
      setQuery("");
      setAt(null);
      setDrivenTo(null);
    },
    /** This stream's own matches; «3 З 8» counts these. */
    inStream,
    standingAt,
    /** The card the stream stands on, which wears the stripe. */
    foundId: inStream[standingAt] ?? promised,
    toNextFound: () => step(1),
    toPreviousFound: () => step(-1),
    /** One hit per run containing the word; empty while the field is. */
    hits: search.hits,
    /** The message the search drove to, or null. */
    drivenTo,
    /** A fresh stream; releases the opened run, which took the stream's place. */
    fresh: () => {
      setOpenedRunId(null);
      setTab("stream");
      // A conversation not yet begun has nothing to find, so the word is cleared.
      setQuery("");
      setDrivenTo(null);
      setIsTyping(false);
      setAt(null);
      chat.fresh();
    },
    /** Opens a history row in the stream, aimed at whom it was last asked. */
    openRun: (run: RunRow, found: RunHit | null) => {
      setOpenedRunId(run.id);
      setTab("stream");
      // Leads to the message the snippet pointed at, not the run's start.
      setDrivenTo(found);
      // The field is filled but without the caret, so the stream stands on the found message and its mark flashes.
      setIsTyping(false);
      setAt(null);
      // The aim is the agent the flow was last asked, matching the row's head.
      chat.aim(run.askedAgentId);
      // Selection follows the aim so the ring and halo mark one agent; a removed agent clears the selection.
      select(agents.some((agent) => agent.id === run.askedAgentId) ? run.askedAgentId : null);
      // A question asked here continues the run's record.
      chat.goOnIn(run.id);
    },
  };
}
