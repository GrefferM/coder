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
 * Which stream the person is reading — the live conversation or a run opened out of the
 * history — and everything the list beside it can do to a run. A run opened stands in the stream's place: a question
 * asked over it goes on in its own record, and deleting it takes the conversation with it.
 */
export function useShownStream(
  directory: string,
  agents: NamedAgent[],
  chat: AgentChatState,
  /** The two marks on a sphere are one agent's, so whatever moves the aim moves the selection with it. */
  select: (agentId: string | null) => void,
): ShownStream {
  const [tab, setTab] = useState<ChatTab>("stream");
  /** The opened run and the moment it opened; the stream shows it and all said since, until «До потоку». */
  const [openedRunId, setOpenedRunId] = useState<string | null>(null);
  // The run the person armed for deletion; the question stands over the working area.
  const [doomedRun, setDoomedRun] = useState<RunRow | null>(null);
  // The whole visible list, armed by the line at the end of it; the box asks about it.
  const [isForgettingAll, setIsForgettingAll] = useState(false);
  /**
   * One word for the whole record, and it lives here rather than in the list — the same search
   * runs over the history and inside the stream, and a word typed in one is already in the other.
   */
  const [query, setQuery] = useState("");
  /** The hit the person pressed a row to reach — the stream drives to that message and marks it. */
  const [drivenTo, setDrivenTo] = useState<RunHit | null>(null);
  /**
   * Whether the caret stands in the stream's own field. The hand asked for it, by ⌘F or by pressing into the
   * field; a word arriving from a pressed row of the history does not — the hand came to read.
   */
  const [isTyping, setIsTyping] = useState(false);
  /**
   * Which match the stream stands on. Null is not «the first»: it is «wherever the search itself put
   * me» — the freshest match on a word just typed, or the very message a pressed row promised.
   */
  const [at, setAt] = useState<number | null>(null);
  const history = useRunHistory(directory, tab === "history", chat.written);
  const search = useRunSearch(directory, query, chat.written);
  const opened = useOpenedRun(openedRunId, chat.written);
  const endedRuns = history.runs.filter((run) => run.endedAt !== null);

  // The list is open, so what stood as news is read — whether or not its cause has been mended.
  useEffect(() => {
    if (tab === "history") {
      chat.readNews();
    }
  }, [tab, chat.isNewsElsewhere, chat.readNews]);

  /**
   * The stream under an opened run — the record, and what the live stream says of the same run,
   * each walk from one source only. Until the record is read there is nothing to stand the live words under.
   */
  function messages(): ChatMessage[] {
    if (openedRunId === null) {
      return chat.messages;
    }

    return opened.run === null ? [] : openedStream(opened.run, chat.messages);
  }

  /**
   * The band over the stream — how the flow stands and when it last spoke. Both are the row of
   * the history's own two facts, read the same way: the person opens a row here, and the band must not
   * say a different thing about the same flow than the row they pressed to get here.
   */
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
      // A chat whose last turn did not answer says so with the same dot the history would use — and by
      // the same rule, which lives in one place so the two dots cannot say different things about one flow.
      state: chatStanding(chat.messages),
      isOpened: false,
      isFailed: false,
    };
  }

  /** It goes for good, and the run opened in the stream goes with it. */
  async function forgetRun() {
    const doomed = doomedRun;

    setDoomedRun(null);

    if (doomed === null) {
      return;
    }

    await history.forget(doomed.id);
    // The conversation goes with its record, whether the stream was writing into it or reading it.
    chat.letGo(doomed.id);

    if (openedRunId === doomed.id) {
      // What stood in the stream's place is gone, and the stream opens fresh: putting the older conversation back would
      // read as if deleting a record brought it out.
      setOpenedRunId(null);
      chat.fresh();
    }
  }

  /** Every run of this project goes, and the conversation on screen goes with them. */
  async function forgetAllRuns() {
    setIsForgettingAll(false);

    await history.forgetAll();
    // The person is standing in the history while it empties; the stream is left fresh for when they go back.
    setOpenedRunId(null);
    chat.fresh();
  }

  const shown = messages();
  // The stream names its agents as they stand today, and keeps the record's name for one that is gone.
  const shownAgents = runAgents(opened.run, agents);
  /** The messages of this stream the word stands in, freshest first — the order is `foundInStream`'s. */
  const inStream = foundInStream(shown, query);

  /** Writes the stream out as a plain-text transcript where the person points; a dismissed chooser writes nothing. */
  async function exportChat() {
    try {
      await saveChatText(chatText(shown, shownAgents), chatFileName());
    } catch {
      // A file that could not be written leaves the conversation exactly as it was; nothing is half-done.
    }
  }
  /** The message a pressed row promised, which is where the stream stands until a hand moves it. */
  const promised = foundMessage(shown, drivenTo);
  const standingAt = standingIn(inStream, at, promised);

  /** Enter is «the next match» and ⇧Enter the one before, and both come round: the list is a ring. */
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
    isFailed: history.isFailed,
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
    /** The word is asked again on every letter — the number and the list move with the hand. */
    search: (asked: string) => {
      setQuery(asked);
      // A new word is a new ride, and it starts where the search itself puts it.
      setAt(null);
    },
    /** The caret belongs in the field, the hand having asked for it. */
    isTyping,
    openSearch: () => setIsTyping(true),
    /** Escape empties the field and puts out both marks; the stream stays where it drove to. */
    closeSearch: () => {
      setIsTyping(false);
      setQuery("");
      setAt(null);
      setDrivenTo(null);
    },
    /** This stream's own matches — «3 З 8» counts these and not the record's 142 rows. */
    inStream,
    standingAt,
    /** The card the stream stands on, which is the one wearing the stripe. */
    foundId: inStream[standingAt] ?? promised,
    toNextFound: () => step(1),
    toPreviousFound: () => step(-1),
    /** One hit per run the word stands in; empty while the field is. */
    hits: search.hits,
    /** The message the search drove to, and null wherever nobody was driven anywhere. */
    drivenTo,
    /** A fresh stream, and the opened run is let go with it — it stood in the stream's place. */
    fresh: () => {
      setOpenedRunId(null);
      setTab("stream");
      // In a conversation that has not begun there is nothing to find, and the word goes with the stream.
      setQuery("");
      setDrivenTo(null);
      setIsTyping(false);
      setAt(null);
      chat.fresh();
    },
    /** A row of the history opens in the stream, aimed at whom it was asked last, ready to go on. */
    openRun: (run: RunRow, found: RunHit | null) => {
      setOpenedRunId(run.id);
      setTab("stream");
      // The press leads not to the start of the run but to the very message the snippet promised.
      setDrivenTo(found);
      // The field comes over filled but without the caret — the hand came to read, not to type — so the
      // stream stands on the message it was promised, and the mark on it lights and goes out.
      setIsTyping(false);
      setAt(null);
      // The aim is whom the flow was asked last, not whom it began with — the person goes on
      // from where the conversation stands, and the head of the row names that same agent.
      chat.aim(run.askedAgentId);
      // Fixing and aiming are two marks, and both are this agent's now — a ring left on the sphere the
      // person came from would light a second one and say the chat writes to it. An agent the project has let go
      // takes the selection with it: there is no sphere left to mark.
      select(agents.some((agent) => agent.id === run.askedAgentId) ? run.askedAgentId : null);
      // The run stands in the stream's place, so a question asked here goes on in its record.
      chat.goOnIn(run.id);
    },
  };
}
