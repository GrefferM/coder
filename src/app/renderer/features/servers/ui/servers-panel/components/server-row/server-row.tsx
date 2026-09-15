import { failureLine, serverFacts, noneAnsweredNote } from "../../../../words";
import { useElapsedSeconds } from "../../../../../../hooks";
import { elapsedClock } from "../../../../../../utils/dates";
import { noneAnswered, serverDeed, serverTrouble } from "../../../../logic";
import { LastCall, RowDot, StartingLines } from "./components";
import {
  SERVER_FELL_COLOR,
  SERVER_LOST_COLOR,
  SERVER_RESTART_ALIVE_LABEL,
  SERVER_RESTART_LABEL,
  SERVER_STARTING_COLOR,
  SERVER_TOKEN_MISSING_ACTION,
  SERVER_VALUE_MISSING_ACTION,
} from "../../../../constants";
import {
  SERVER_ROW_BACKGROUND_COLOR,
  SERVER_ROW_BORDER_COLOR,
  SERVER_ROW_BORDER_RADIUS_PX,
  SERVER_ROW_CHEVRON_COLOR,
  SERVER_ROW_CHEVRON_SIZE_PX,
  SERVER_ROW_FACTS_COLOR,
  SERVER_ROW_FACTS_FONT_SIZE_PX,
  SERVER_ROW_FACTS_LETTER_SPACING_PX,
  SERVER_ROW_FAILURE_COLOR,
  SERVER_ROW_FAILURE_FONT_SIZE_PX,
  SERVER_ROW_FAILURE_GAP_PX,
  SERVER_ROW_FAILURE_LINE_HEIGHT,
  SERVER_ROW_NOTE_COLOR,
  SERVER_ROW_NOTE_FONT_SIZE_PX,
  SERVER_ROW_NOTE_LINE_HEIGHT,
  SERVER_ROW_FELL_BACKGROUND_COLOR,
  SERVER_ROW_FELL_BORDER_COLOR,
  SERVER_ROW_GAP_PX,
  SERVER_ROW_NAME_COLOR,
  SERVER_ROW_NAME_FONT_SIZE_PX,
  SERVER_ROW_PADDING,
  SERVER_ROW_RESTART_BORDER_RADIUS_PX,
  SERVER_ROW_RESTART_PADDING,
  SERVER_ROW_TEXT_GAP_PX,
} from "./constants";
import { TextAction } from "../../../../../../components";
import type { ServerRowProps } from "./interfaces";

/**
 * One server as the catalogue shows it — a dot for the connection, the name, and one line of facts. A fallen one
 * takes the trouble ground and carries «ЗАПУСТИТИ», which lets it go and starts it afresh.
 *
 * The head holds **at most one action** — the one the state asks for — and a chevron, which is not an action but
 * the sign that there is something to open. So the facts may be cut with an ellipsis while the name, the action
 * and the chevron are never squeezed.
 *
 * The chevron opens a **page** and not a card inside the row: a list of functions folded into one row leaves
 * the catalogue unreadable and every other server a screen away.
 */
export function ServerRow({
  server,
  look,
  askingSince,
  agentCount,
  onOpen,
  onRestart,
  onCancel,
  onFill,
  onShowCall,
}: ServerRowProps) {
  /**
   * The clock counts up and there is no bar — how much is left is nobody's to know, and a bar would
   * say it is. The seconds are told once a second, which is also what brings the second line on the twentieth.
   */
  const waited = useElapsedSeconds(askingSince ?? 0);
  const isAsking = askingSince !== null;
  const clock = isAsking ? elapsedClock(waited) : null;
  const hasFallen = !isAsking && look !== null && !look.isUp;
  const isUp = !isAsking && look !== null && look.isUp;
  // A call that failed is a fact about calls, so it stands under the name and never in the dot.
  const lastFailure = isUp ? look.calls.lastFailure : null;
  // The row that answers and works for nobody takes the trouble ground, while its dot stays green.
  const worksForNobody = !isAsking && noneAnswered(look);
  const isTroubled = hasFallen || worksForNobody;
  /**
   * What the state asks for, and the head holds that one thing. A server nobody has a
   * token for, or one whose variable has no value here, is not restarted — it is filled in, and starting it again
   * without the thing it was missing would fail in exactly the same way.
   */
  // Being asked wins over what it said last time: the words of the old answer are about a server that is up
  // or down, and this one is neither just now.
  const trouble = isAsking ? null : serverTrouble(look);
  const isUnasked = trouble?.kind === "tokenMissing";
  /**
   * A server nobody has raised — never asked, or let go of by hand. Its dot is empty and it has no number to
   * give; what it does have is a way back up, which «СКАСУВАТИ» would otherwise have taken away for good.
   */
  const isUnknown = !isAsking && look === null;
  const deed = isAsking ? null : serverDeed(look);
  const action =
    deed === null
      ? null
      : {
          fill: {
            label: isUnasked ? SERVER_TOKEN_MISSING_ACTION : SERVER_VALUE_MISSING_ACTION,
            onPress: onFill,
          },
          raise: {
            label: SERVER_RESTART_LABEL,
            onPress: onRestart,
          },
          raiseAgain: {
            label: SERVER_RESTART_ALIVE_LABEL,
            onPress: onRestart,
          },
        }[deed];

  return (
    // The whole row leads to the server's page — the words of a fall are part of the row, and a row that answers
    // only where the name is has dead ground in it exactly where the eye stops to read.
    <div
      role="button"
      tabIndex={-1}
      aria-label={server.name}
      onClick={onOpen}
      className="d-flex flex-column"
      style={{
        gap: SERVER_ROW_FAILURE_GAP_PX,
        padding: SERVER_ROW_PADDING,
        borderRadius: SERVER_ROW_BORDER_RADIUS_PX,
        border: `1px solid ${isTroubled ? SERVER_ROW_FELL_BORDER_COLOR : SERVER_ROW_BORDER_COLOR}`,
        background: isTroubled ? SERVER_ROW_FELL_BACKGROUND_COLOR : SERVER_ROW_BACKGROUND_COLOR,
        cursor: "pointer",
      }}
    >
      <div
        className="d-flex align-items-center"
        style={{
          gap: SERVER_ROW_GAP_PX,
        }}
      >
        <RowDot isAsking={isAsking} isEmpty={isUnasked || isUnknown} hasFallen={hasFallen} isUp={isUp} />
        <div
          className="d-flex align-items-center flex-fill text-start"
          style={{
            gap: SERVER_ROW_GAP_PX,
            minWidth: 0,
          }}
        >
          <div
            className="d-flex flex-column flex-fill"
            style={{
              gap: SERVER_ROW_TEXT_GAP_PX,
              minWidth: 0,
            }}
          >
            <span
              className="font-monospace text-truncate"
              style={{
                fontSize: SERVER_ROW_NAME_FONT_SIZE_PX,
                color: SERVER_ROW_NAME_COLOR,
              }}
            >
              {server.name}
            </span>
            <span
              className="font-monospace text-truncate"
              style={{
                fontSize: SERVER_ROW_FACTS_FONT_SIZE_PX,
                letterSpacing: SERVER_ROW_FACTS_LETTER_SPACING_PX,
                color: isAsking
                  ? SERVER_STARTING_COLOR
                  : hasFallen
                    ? SERVER_FELL_COLOR
                    : worksForNobody
                      ? SERVER_LOST_COLOR
                      : SERVER_ROW_FACTS_COLOR,
              }}
            >
              {serverFacts(server, look, clock, look?.functions.length ?? 0, agentCount)}
            </span>
          </div>
          <svg
            aria-hidden
            width={SERVER_ROW_CHEVRON_SIZE_PX}
            height={SERVER_ROW_CHEVRON_SIZE_PX}
            viewBox="0 0 24 24"
            fill="none"
            stroke={SERVER_ROW_CHEVRON_COLOR}
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              flexShrink: 0,
            }}
          >
            <path d="m9 6 6 6-6 6" />
          </svg>
        </div>
        {/*
          The head holds the one thing the **state** asks for, and a server that simply stands answering asks for
          nothing: what there is to do with its process lives on its page. The one being raised offers
          «СКАСУВАТИ» below, beside the ceiling.
        */}
        {action !== null && (
          <span
            // The one action of the head is its own; pressing it must not also walk into the server's page.
            onClick={(press) => press.stopPropagation()}
            // A flex box and not a line of text: a line reserves room under the action for letters that hang
            // below the baseline, and the box then sits that much lower than the border drawn around it.
            className="d-flex"
            style={{
              flexShrink: 0,
              padding: SERVER_ROW_RESTART_PADDING,
              borderRadius: SERVER_ROW_RESTART_BORDER_RADIUS_PX,
              // The trouble colour belongs to trouble alone: filling a hole in, letting a process go and
              // raising one that never rose are all plain deeds, and only a row in trouble wears the red border.
              border: `1px solid ${isTroubled ? SERVER_ROW_FELL_BORDER_COLOR : SERVER_ROW_BORDER_COLOR}`,
            }}
          >
            {/* A server that never fell is restarted, not started — and a new connection is a new chance. */}
            <TextAction label={action.label} isDanger={isTroubled} onClick={action.onPress} />
          </span>
        )}
      </div>
      {isAsking && <StartingLines waited={waited} onCancel={onCancel} />}
      {worksForNobody && look !== null && (
        <span
          style={{
            color: SERVER_ROW_NOTE_COLOR,
            fontSize: SERVER_ROW_NOTE_FONT_SIZE_PX,
            lineHeight: SERVER_ROW_NOTE_LINE_HEIGHT,
          }}
        >
          {noneAnsweredNote(look.calls.failedInARow)}
        </span>
      )}
      {lastFailure !== null && (
        // «ПОКАЗАТИ ВИКЛИК» goes to the chat, so the press is its own and does not also open the server's page.
        <span onClick={(press) => press.stopPropagation()}>
          <LastCall failure={lastFailure} isNews={!worksForNobody} onShow={() => onShowCall(lastFailure.callId)} />
        </span>
      )}
      {/* The row has its own sentence for every trouble it knows; only a plain fall has nothing to say but this. */}
      {trouble?.kind === "fell" && look !== null && look.failure !== null && (
        <span
          style={{
            color: SERVER_ROW_FAILURE_COLOR,
            fontSize: SERVER_ROW_FAILURE_FONT_SIZE_PX,
            lineHeight: SERVER_ROW_FAILURE_LINE_HEIGHT,
            overflowWrap: "anywhere",
          }}
        >
          {failureLine(look.failure)}
        </span>
      )}
    </div>
  );
}
