import { useStayAtBottom } from "../../../../hooks";
import { useDriveTo, useFoundFlash, useNewsBelow } from "../../hooks";
import { Composer, OpenedBand, SaidTurn, ToBottom, WaitingCard } from "./components";
import { StreamSearch } from "../stream-search";
import { breakWords, chatLevels, saysBreak, standsWithRepeat } from "../../logic";
import {
  AGENT_CHAT_EMPTY_COLOR,
  AGENT_CHAT_EMPTY_FONT_SIZE_PX,
  AGENT_CHAT_EMPTY_LINE_HEIGHT,
  AGENT_CHAT_EMPTY_PADDING,
  AGENT_CHAT_LIST_GAP_PX,
  AGENT_CHAT_LIST_PADDING,
  AGENT_CHAT_OPENED_FAILED_NOTE,
  CHAT_WAYS_OUT,
} from "./constants";
import { NOT_STARTED_ENDS } from "../../constants";
import type { NotStartedReason } from "../../../../interfaces";
import type { AgentChatProps } from "./interfaces";
import type { ChatMessage, ChatStep } from "../../interfaces";
/** Chat column: the person's messages on the right, the agent's on the left; day header shown once. */
export function AgentChat({ aimed, said, field, band, acts }: AgentChatProps) {
  const { messages, agents, working, openCalls } = said;
  /** Whether this message is the last in the whole stream. */
  const isLastSaid = (at: number) => at === messages.length - 1;
  /** The step of the walk each turn stands on, counted off the steps that fed it; one rule for live and read turns. */
  const levels = chatLevels(messages);
  /** The card's «КРОК 2 · 19:29»: the turn's level and start hour. */
  const stepOf = (message: ChatMessage): ChatStep | null =>
    message.began === null || levels[message.id] === undefined
      ? null
      : {
          level: levels[message.id],
          at: message.began,
        };
  /**
   * The turns of one question, the only place they stand; a turn whose question is not in this stream belongs to another
   * run.
   */
  const liveIn = (questionId: string) => working.filter((one) => one.questionId === questionId);
  /** Whether a turn of this question stands in the stream, so the pass has something to show. */
  const isWalked = (asked: ChatMessage) =>
    messages.some((message) => message.questionId === asked.questionId && message.from === "agent");

  /** The pass for this question, opened by its id; none for a question no turn stood under. */
  function debugOf(asked: ChatMessage): (() => void) | null {
    const open = acts.onOpenDebug;

    if (open === null || !isWalked(asked)) {
      return null;
    }

    return () => open(asked.questionId);
  }
  /** Whether this message ends its question's block, so what is still out follows it. */
  const endsBlock = (at: number) => isLastSaid(at) || messages[at + 1].questionId !== messages[at].questionId;

  /** Whether an act stands here: under the last said in its own question, never under a turn already asked again. */
  const isActedOn = (message: ChatMessage, at: number) => endsBlock(at) && !said.saidAgain.includes(message.id);

  /** The act under a broken turn and under a link the work could not go down; one repeat picks up both. */
  function askAgainOf(message: ChatMessage, at: number): (() => void) | null {
    if (!standsWithRepeat(message) || !isActedOn(message, at)) {
      return null;
    }

    return () => acts.onAskAgain(message);
  }

  // The stream is read from its end; new content stays at the bottom and follows.
  const standing = band.head?.isOpened === true ? band.head.at.toISOString() : aimed.name;
  const stream = useStayAtBottom<HTMLDivElement>(standing);
  /** What arrived while the person was away from the end; the number on the down button. */
  const news = useNewsBelow(messages.length, stream.isAtEnd, standing);

  // The press promised that message, so the stream scrolls to it and lights its card briefly.
  useDriveTo(stream, said.foundId);

  const lit = useFoundFlash(said.foundId);
  /** Where the card's own act leads: the place its cause is mended. */
  const actOf = (reason: NotStartedReason) => acts[CHAT_WAYS_OUT[NOT_STARTED_ENDS[reason].act]];

  return (
    <div
      className="d-flex flex-column flex-fill"
      style={{
        minHeight: 0,
      }}
    >
      {band.head !== null && <OpenedBand head={band.head} onExport={band.onExport} />}
      {/*
       * The stream's search stands over the stream and under the band, spaced on every side, so it reads as over the
       * conversation, not another band.
       */}
      <StreamSearch {...band.search} />
      {/* The down button sits inside the stream, so its positioning box is the stream's. */}
      <div
        className="position-relative d-flex flex-column flex-fill"
        style={{
          minHeight: 0,
          minWidth: 0,
        }}
      >
        <div
          ref={stream.box}
          className="d-flex flex-column flex-fill"
          style={{
            padding: AGENT_CHAT_LIST_PADDING,
            gap: AGENT_CHAT_LIST_GAP_PX,
            minHeight: 0,
            minWidth: 0,
            overflowY: "auto",
            // The stream is read down the column: long words wrap, nothing scrolls sideways.
            overflowX: "hidden",
            // Selection is off here; only the words themselves turn it on.
            cursor: "default",
          }}
        >
          {aimed.waiting !== null && <WaitingCard waiting={aimed.waiting} color={aimed.color} agents={agents} />}
          {messages.length === 0
            ? /* An empty stream says nothing, as the field under it already asks; only an unread run speaks. */
              band.head?.isFailed === true && (
                <span
                  className="text-center"
                  style={{
                    padding: AGENT_CHAT_EMPTY_PADDING,
                    color: AGENT_CHAT_EMPTY_COLOR,
                    fontSize: AGENT_CHAT_EMPTY_FONT_SIZE_PX,
                    lineHeight: AGENT_CHAT_EMPTY_LINE_HEIGHT,
                  }}
                >
                  {AGENT_CHAT_OPENED_FAILED_NOTE}
                </span>
              )
            : messages.map((message, index) => {
                const previous = index === 0 ? null : new Date(messages[index - 1].at);
                const isNewDay = previous === null || previous.toDateString() !== new Date(message.at).toDateString();
                const isBreak = message.note !== null && saysBreak(messages, index);

                return (
                  <SaidTurn
                    openCalls={openCalls}
                    key={message.id}
                    message={message}
                    agents={agents}
                    agentName={aimed.name}
                    agentColor={aimed.color}
                    isNewDay={isNewDay}
                    isAskedAgain={message.from === "person" && index > 0}
                    step={stepOf(message)}
                    onAskAgain={askAgainOf(message, index)}
                    words={isBreak ? breakWords(messages, index) : null}
                    act={isActedOn(message, index) && message.notStarted !== null ? actOf(message.notStarted) : null}
                    isAsked={isActedOn(message, index) && message.asked !== null && field.draft === message.asked}
                    // A question with no turn under it has no pass to show.
                    onDebug={debugOf(message)}
                    live={endsBlock(index) ? liveIn(message.questionId) : []}
                    isFound={message.id === lit}
                    looked={band.search.query.trim()}
                  />
                );
              })}
        </div>
        {/* Shown exactly while the end is out of view; news only labels the button. */}
        {!stream.isAtEnd && <ToBottom news={news} onGo={stream.goToEnd} />}
      </div>

      <Composer
        agentId={aimed.id}
        agentName={aimed.name}
        isAgentActive={aimed.isActive}
        isWalking={field.isWalking}
        draft={field.draft}
        onDraftChange={field.onDraftChange}
        attachments={field.attachments}
        onAttach={field.onAttach}
        onDetach={field.onDetach}
        onSend={field.onSend}
        onStop={field.onStop}
        fieldHeight={field.height}
        onFieldHeight={field.onHeight}
      />
    </div>
  );
}
