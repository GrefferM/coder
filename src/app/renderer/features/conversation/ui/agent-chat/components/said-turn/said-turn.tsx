import { AnswerCard } from "../answer-card";
import { RuleWithWord } from "../../../../../../components";
import { CallRow } from "../call-row";
import { HandoffRow, HANDOFF_ROW_LABEL, HANDOFF_ROW_NOT_SENT_LABEL, HANDOFF_ROW_STOPPED_LABEL } from "../handoff-row";
import { NotStartedCard } from "../not-started-card";
import { PersonCard } from "../person-card";
import { SaidRow } from "../said-row";
import { WorkingTurn } from "../working-turn";
import { callEnd } from "../../../../logic";
import { dayLabel } from "../../../../../../utils/dates";
import { AGENT_CHAT_ASKED_AGAIN_LABEL, AGENT_CHAT_LIST_GAP_PX, AGENT_CHAT_STOP_REASON_LABELS } from "../../constants";
import type { SaidTurnProps } from "./interfaces";

/**
 * One turn of the stream: the card it is — an answer, a person's words, a row about a link, or a turn that
 * never began — the calls at the place they happened, and the turns of this question still out.
 */
export function SaidTurn({
  message,
  agents,
  agentName,
  agentColor,
  isNewDay,
  isAskedAgain,
  step,
  onAskAgain,
  words,
  act,
  isAsked,
  onDebug,
  live,
  isFound,
  looked,
  openCalls,
}: SaidTurnProps) {
  const said = new Date(message.at);
  /**
   * A turn whose word the step said for it draws nothing — not even an empty block, which would still take the
   * list's gap and leave a hole where a card never was.
   */
  const isMute =
    message.from === "agent" &&
    message.notStarted === null &&
    message.text === "" &&
    words === null &&
    message.calls.length === 0 &&
    live.length === 0 &&
    !isNewDay &&
    !isAskedAgain;

  if (isMute) {
    return null;
  }

  /** The name and colour a message wears are its own agent's: one stream holds every agent's turns. */
  const spoke = agents.find((agent) => agent.id === message.agentId) ?? null;
  /** The neighbour a line runs to or from. */
  const neighbour = agents.find((agent) => agent.id === message.otherAgentId) ?? null;
  /** The rows the app says about a line, or about one agent standing alone. */
  const isRow = message.from === "handoff" || message.from === "notSent";
  const isSent = message.from === "handoff";

  /** What this row is — the app's own word about the line or the turn. */
  function rowWord(): string {
    if (message.from === "notSent") {
      return HANDOFF_ROW_NOT_SENT_LABEL;
    }

    return message.stopReason === null ? HANDOFF_ROW_LABEL : HANDOFF_ROW_STOPPED_LABEL;
  }

  return (
    <div
      className="d-flex flex-column"
      data-said={message.id}
      style={{
        gap: AGENT_CHAT_LIST_GAP_PX,
        minWidth: 0,
      }}
    >
      {isNewDay && <RuleWithWord>{dayLabel(said, new Date())}</RuleWithWord>}
      {/* One conversation, several questions: a rule says where the person asked again. */}
      {isAskedAgain && <RuleWithWord>{AGENT_CHAT_ASKED_AGAIN_LABEL}</RuleWithWord>}
      {isRow ? (
        <>
          {/* With no sender the row is about one agent alone — the question that never went, or the turn. */}
          <HandoffRow
            word={rowWord()}
            fromName={isSent ? (spoke?.name ?? "") : null}
            fromColor={isSent ? (spoke?.color ?? agentColor) : null}
            name={neighbour?.name ?? ""}
            color={neighbour?.color ?? agentColor}
            reason={message.stopReason === null ? null : AGENT_CHAT_STOP_REASON_LABELS[message.stopReason]}
          />
          {/* The walk ends at a link it cannot take, and a walk that ended is asked again like any
              other — the row itself has already said what happened. */}
          {onAskAgain !== null && <SaidRow words={null} onAskAgain={onAskAgain} />}
        </>
      ) : message.from === "supplier" ? (
        <AnswerCard
          agentName={neighbour?.name ?? ""}
          agentColor={neighbour?.color ?? agentColor}
          text={message.text}
          cost={message.cost}
          isCounting={false}
        />
      ) : message.from === "person" ? (
        <PersonCard text={message.text} at={said} onDebug={onDebug} isFound={isFound} looked={looked} />
      ) : message.notStarted !== null ? (
        <>
          {/* The line about the words stands while the field holds them — a card read back out of
              the record put nothing there. */}
          <NotStartedCard
            reason={message.notStarted}
            note={message.text}
            wouldGo={message.wouldGo}
            isAsked={isAsked}
            onAct={act}
            isFound={isFound}
          />
          {/* A turn that never began broke the walk like any other, so it is asked again like any
              other; the card's own act is about the cause, not the turn. */}
          {onAskAgain !== null && <SaidRow words={null} onAskAgain={onAskAgain} />}
        </>
      ) : (
        // A card only where somebody said something; ours is the rule below.
        message.text !== "" && (
          <AnswerCard
            agentName={spoke?.name ?? agentName}
            agentColor={spoke?.color ?? agentColor}
            text={message.text}
            cost={message.cost}
            answerCeiling={message.answerCeiling}
            isCounting={false}
            step={step}
            isFound={isFound}
            looked={looked}
          />
        )
      )}
      {/* The calls of that turn stay where they happened, folded into their lines. */}
      {message.calls.map((call) => (
        <CallRow
          key={call.id}
          call={{
            ...call,
            state: callEnd(call),
          }}
          agentColor={spoke?.color ?? agentColor}
          openCalls={openCalls}
        />
      ))}
      {/*
        What the app itself said about this turn — never inside a card, never above what the turn did. A stop or a
        break is the end of it: the calls went out first, so the word stands under them.
      */}
      {words !== null && <SaidRow words={words} onAskAgain={onAskAgain} />}
      {/* What is still out of this question stands at the end of its own block. */}
      {live.map((one) => (
        <WorkingTurn
          key={one.turnId}
          turn={one}
          agents={agents}
          agentName={agentName}
          agentColor={agentColor}
          openCalls={openCalls}
        />
      ))}
    </div>
  );
}
