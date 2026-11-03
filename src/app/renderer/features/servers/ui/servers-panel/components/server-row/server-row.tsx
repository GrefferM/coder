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
  SERVER_STOP_LABEL,
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
 * One server in the catalogue: connection dot, name, one line of facts. The head holds at most one action, the one the
 * state asks for, plus a chevron that opens the server's page. The facts may be cut with an ellipsis; the rest is never
 * squeezed.
 */
export function ServerRow({
  server,
  look,
  askingSince,
  agentCount,
  onOpen,
  onRestart,
  onStop,
  onCancel,
  onFill,
  onShowCall,
}: ServerRowProps) {
  /**
   * The clock counts up with no bar, since the time left is unknown; it ticks once a second, which also brings the second
   * line on the twentieth.
   */
  const waited = useElapsedSeconds(askingSince ?? 0);
  const isAsking = askingSince !== null;
  const clock = isAsking ? elapsedClock(waited) : null;
  const hasFallen = !isAsking && look !== null && !look.isUp;
  const isUp = !isAsking && look !== null && look.isUp;
  // A failed call is a fact about calls: under the name, never in the dot.
  const lastFailure = isUp ? look.calls.lastFailure : null;
  // A row that answers but works for nobody takes the trouble ground; its dot stays green.
  const worksForNobody = !isAsking && noneAnswered(look);
  const isTroubled = hasFallen || worksForNobody;
  // Being asked wins over the last answer, which describes a server that is neither up nor down now.
  const trouble = isAsking ? null : serverTrouble(look);
  const isUnasked = trouble?.kind === "tokenMissing";
  /** A server nobody has raised: never asked, or let go by hand. Empty dot, no number, and a way back up. */
  const isUnknown = !isAsking && look === null;
  const deed = isAsking ? null : serverDeed(look, server.isLocal);
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
          stop: {
            label: SERVER_STOP_LABEL,
            onPress: onStop,
          },
        }[deed];

  return (
    // The whole row leads to the server's page.
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
              {serverFacts(server, {
                look,
                clock,
                functionCount: look?.functions.length ?? 0,
                agentCount,
              })}
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
         * A server that simply answers asks for nothing; its process actions live on its page. One being raised offers
         * «СКАСУВАТИ» below.
         */}
        {action !== null && (
          <span
            // The head action must not also open the server's page.
            onClick={(press) => press.stopPropagation()}
            // A flex box, not a text line, which would reserve room under the action for descenders and sit lower than
            // the border.
            className="d-flex"
            style={{
              flexShrink: 0,
              padding: SERVER_ROW_RESTART_PADDING,
              borderRadius: SERVER_ROW_RESTART_BORDER_RADIUS_PX,
              // Only a row in trouble wears the red border.
              border: `1px solid ${isTroubled ? SERVER_ROW_FELL_BORDER_COLOR : SERVER_ROW_BORDER_COLOR}`,
            }}
          >
            {/* A server that never fell is restarted, not started. */}
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
        // «ПОКАЗАТИ ВИКЛИК» goes to the chat and does not also open the page.
        <span onClick={(press) => press.stopPropagation()}>
          <LastCall failure={lastFailure} isNews={!worksForNobody} onShow={() => onShowCall(lastFailure.callId)} />
        </span>
      )}
      {/* Every known trouble has its own sentence; a plain fall has only this. */}
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
