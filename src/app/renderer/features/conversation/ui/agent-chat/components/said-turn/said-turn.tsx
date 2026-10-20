import { AnswerCard } from "../answer-card";
import { RuleWithWord } from "../../../../../../components";
import { CallRow } from "../call-row";
import { HandoffRow, HANDOFF_ROW_LABEL, HANDOFF_ROW_NOT_SENT_LABEL, HANDOFF_ROW_STOPPED_LABEL } from "../handoff-row";
import { NotStartedCard } from "../not-started-card";
import { PersonCard } from "../person-card";
import { SaidRow } from "../said-row";
import { WorkingTurn } from "../working-turn";
import { callEnd } from "../../../../logic";
import { compressedMemoryWords } from "../../../../words";
import { CHAT_STOP_REASON_LABELS } from "../../../../constants";
import { dayLabel } from "../../../../../../utils/dates";
import { AGENT_CHAT_ASKED_AGAIN_LABEL, AGENT_CHAT_LIST_GAP_PX } from "../../constants";
import type { SaidTurnProps } from "./interfaces";

/**
 * One turn of the stream: its card (answer, person's words, link row, or a turn that never began), the calls where they
 * happened, and the turns of this question still out.
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
  /** A turn whose word the step said draws nothing, not even an empty block that would add the list's gap. */
  const isMute =
    message.from === "agent" &&
    message.notStarted === null &&
    message.text === "" &&
    words === null &&
    message.calls.length === 0 &&
    message.compressed === null &&
    live.length === 0 &&
    !isNewDay &&
    !isAskedAgain;

  if (isMute) {
    return null;
  }

  /** The message's name and colour are its own agent's; one stream holds every agent's turns. */
  const spoke = agents.find((agent) => agent.id === message.agentId) ?? null;
  /** The neighbour a line runs to or from. */
  const neighbour = agents.find((agent) => agent.id === message.otherAgentId) ?? null;
  /** Rows the app says about a line, or about one agent alone. */
  const isRow = message.from === "handoff" || message.from === "notSent";
  const isSent = message.from === "handoff";

  /** The app's word about the line or the turn. */
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
      {/* A rule marks where the person asked again. */}
      {isAskedAgain && <RuleWithWord>{AGENT_CHAT_ASKED_AGAIN_LABEL}</RuleWithWord>}
      {/* The memory was compressed before this turn went; the rule says so ahead of the card, and none of what was written. */}
      {message.compressed !== null && <SaidRow words={compressedMemoryWords(message.compressed)} />}
      {isRow ? (
        <>
          {/* With no sender the row concerns one agent alone: the question that never went, or the turn. */}
          <HandoffRow
            word={rowWord()}
            fromName={isSent ? (spoke?.name ?? "") : null}
            fromColor={isSent ? (spoke?.color ?? agentColor) : null}
            name={neighbour?.name ?? ""}
            color={neighbour?.color ?? agentColor}
            reason={message.stopReason === null ? null : CHAT_STOP_REASON_LABELS[message.stopReason]}
          />
          {/* A walk that ended at an unfollowable link can be asked again; the row already says what happened. */}
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
        <PersonCard
          text={message.text}
          at={said}
          attached={message.attached}
          onDebug={onDebug}
          isFound={isFound}
          looked={looked}
        />
      ) : message.notStarted !== null ? (
        <>
          {/* Shown while the field holds the words; a card read back from the record puts nothing there. */}
          <NotStartedCard
            reason={message.notStarted}
            note={message.text}
            wouldGo={message.wouldGo}
            isAsked={isAsked}
            onAct={act}
            isFound={isFound}
          />
          {/* A turn that never began can be asked again like any other; the card's own act concerns the cause. */}
          {onAskAgain !== null && <SaidRow words={null} onAskAgain={onAskAgain} />}
        </>
      ) : (
        // A card only where somebody said something.
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
      {/* The turn's calls stay where they happened, folded into lines. */}
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
      {/* The app's word about this turn, below the calls, never inside a card. */}
      {words !== null && <SaidRow words={words} onAskAgain={onAskAgain} />}
      {/* What is still out of this question, at the end of its block. */}
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
