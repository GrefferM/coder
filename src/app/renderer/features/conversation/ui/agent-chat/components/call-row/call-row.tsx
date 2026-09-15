import { CopyAction, Mark } from "../../../../../../components";
import { useElapsed } from "../../../../../../hooks";
import { RUN_CALL_REFUSED, RUN_CALL_RUNNING, RUN_CALL_SAID_NO } from "../../../../../record";
import {
  CALL_ROW_ANSWERED_LABEL,
  CALL_ROW_ARGUMENT_SEPARATOR,
  CALL_ROW_BACKGROUND_COLOR,
  CALL_ROW_BODY_BACKGROUND_COLOR,
  CALL_ROW_BODY_BORDER_RADIUS_PX,
  CALL_ROW_BODY_COLOR,
  CALL_ROW_BODY_FONT_SIZE_PX,
  CALL_ROW_BODY_LINE_HEIGHT,
  CALL_ROW_BODY_MAX_HEIGHT_PX,
  CALL_ROW_BODY_PADDING,
  CALL_ROW_BODY_PINNED_COLOR,
  CALL_ROW_BODY_QUIET_COLOR,
  CALL_ROW_BORDER_COLOR,
  CALL_ROW_BORDER_RADIUS_PX,
  CALL_ROW_CHEVRON_COLOR,
  CALL_ROW_CHEVRON_OPEN_COLOR,
  CALL_ROW_CHEVRON_SIZE_PX,
  CALL_ROW_FROM_MODEL_LABEL,
  CALL_ROW_GAP_PX,
  CALL_ROW_HEAD_GAP_PX,
  CALL_ROW_LINE_PREFIX,
  CALL_ROW_BREATH_CLASS,
  CALL_ROW_BREATH_MS,
  CALL_ROW_MARK_SIZE_PX,
  CALL_ROW_MARK_STILL_COLOR,
  CALL_ROW_MARK_STILL_RADIUS_PX,
  CALL_ROW_NAME_COLOR,
  CALL_ROW_NAME_FONT_SIZE_PX,
  CALL_ROW_NO_OUTPUT_YET_LABEL,
  CALL_ROW_OPEN_BORDER_COLOR,
  CALL_ROW_PADDING,
  CALL_ROW_PINNED_LABEL,
  CALL_ROW_CODE_LABEL,
  CALL_ROW_REFUSED_LABEL,
  CALL_ROW_RUNNING_LABEL,
  CALL_ROW_SAID_GAP_PX,
  CALL_ROW_SAID_LABEL,
  CALL_ROW_SAID_NO_COLOR,
  CALL_ROW_SAID_NO_LABEL,
  CALL_ROW_SECONDS_DIGITS,
  CALL_ROW_SECONDS_LABEL,
  CALL_ROW_SEPARATOR,
  CALL_ROW_SOURCE_KIND,
  CALL_ROW_SOURCE_LABEL,
  CALL_ROW_STATE_COLOR,
  CALL_ROW_STATE_LETTER_SPACING_PX,
} from "./constants";
import type { CallRowProps } from "./interfaces";

/** One call as a line opened by a click — open while it is out, folded once it is over. */
export function CallRow({ call, agentColor, openCalls }: CallRowProps) {
  const isRunning = call.state === RUN_CALL_RUNNING;
  // The row is a line until the person opens it — while the call is out too, so a turn of a dozen calls
  // stays a dozen lines. What they open stays open, and the chat is where that is remembered.
  const isOpen = openCalls.isOpen(call.id);
  const elapsed = useElapsed(call.startedAt);
  const saidNo = call.state === RUN_CALL_SAID_NO;
  // The mark is the source's own shape — a server round, a declared command square, as on the arc.
  const isRound = call.serverId !== null;

  /** The one number a server has in place of a code — how long it took to answer. */
  function answeredIn(): string {
    const seconds = ((call.endedAt - call.startedAt) / 1_000).toFixed(CALL_ROW_SECONDS_DIGITS);

    return `${seconds}${CALL_ROW_SECONDS_LABEL}`;
  }

  function stateLabel(): string {
    if (isRunning) {
      return `${CALL_ROW_RUNNING_LABEL}${CALL_ROW_SEPARATOR}${elapsed}`;
    }

    if (call.state === RUN_CALL_REFUSED) {
      return CALL_ROW_REFUSED_LABEL;
    }

    // «відмова — це відповідь, вона прийшла»; the time it took is as much a fact as any other answer's.
    if (saidNo) {
      return `${CALL_ROW_SAID_NO_LABEL}${CALL_ROW_SEPARATOR}${answeredIn()}`;
    }

    /**
     * «коду виходу немає · процесу не було». A server's call is named by the time it took to answer, and
     * a command's by the code its process came back with — and neither ever stands in the other's place.
     */
    return call.serverId === null
      ? `${CALL_ROW_CODE_LABEL}${call.exitCode}`
      : `${CALL_ROW_ANSWERED_LABEL}${answeredIn()}`;
  }

  return (
    <div
      className="d-flex flex-column"
      style={{
        gap: CALL_ROW_GAP_PX,
        padding: CALL_ROW_PADDING,
        borderRadius: CALL_ROW_BORDER_RADIUS_PX,
        border: `1px solid ${isOpen ? CALL_ROW_OPEN_BORDER_COLOR : CALL_ROW_BORDER_COLOR}`,
        background: CALL_ROW_BACKGROUND_COLOR,
      }}
    >
      <button
        type="button"
        className="d-flex align-items-center border-0 bg-transparent p-0"
        aria-expanded={isOpen}
        style={{
          gap: CALL_ROW_HEAD_GAP_PX,
        }}
        onClick={() => openCalls.toggle(call.id)}
      >
        <span
          // It breathes while the call is out, and stands still the moment the call is over.
          className={`flex-shrink-0${isRunning ? ` ${CALL_ROW_BREATH_CLASS}` : ""}`}
          style={{
            width: CALL_ROW_MARK_SIZE_PX,
            height: CALL_ROW_MARK_SIZE_PX,
            borderRadius: isRound ? "50%" : CALL_ROW_MARK_STILL_RADIUS_PX,
            background: isRunning ? agentColor : CALL_ROW_MARK_STILL_COLOR,
            boxShadow: isRunning ? `0 0 7px ${agentColor}` : "none",
            animationDuration: isRunning ? `${CALL_ROW_BREATH_MS}ms` : undefined,
          }}
        />
        <span
          className="font-monospace"
          style={{
            color: CALL_ROW_NAME_COLOR,
            fontSize: CALL_ROW_NAME_FONT_SIZE_PX,
          }}
        >
          {call.name}
        </span>
        <Mark
          // The words name the end, so the words are what a troubled end colours.
          color={saidNo ? CALL_ROW_SAID_NO_COLOR : CALL_ROW_STATE_COLOR}
          spacing={CALL_ROW_STATE_LETTER_SPACING_PX}
          isUpperCase={false}
          className="flex-fill text-start"
        >
          {stateLabel()}
        </Mark>
        <svg
          width={CALL_ROW_CHEVRON_SIZE_PX}
          height={CALL_ROW_CHEVRON_SIZE_PX}
          viewBox="0 0 24 24"
          fill="none"
          stroke={isOpen ? CALL_ROW_CHEVRON_OPEN_COLOR : CALL_ROW_CHEVRON_COLOR}
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d={isOpen ? "m18 15-6-6-6 6" : "m6 9 6 6 6-6"} />
        </svg>
      </button>
      {isOpen && (
        <div
          className="font-monospace"
          style={{
            background: CALL_ROW_BODY_BACKGROUND_COLOR,
            borderRadius: CALL_ROW_BODY_BORDER_RADIUS_PX,
            padding: CALL_ROW_BODY_PADDING,
            fontSize: CALL_ROW_BODY_FONT_SIZE_PX,
            lineHeight: CALL_ROW_BODY_LINE_HEIGHT,
            color: CALL_ROW_BODY_COLOR,
            maxHeight: CALL_ROW_BODY_MAX_HEIGHT_PX,
            overflowY: "auto",
            whiteSpace: "pre-wrap",
            overflowWrap: "anywhere",
            // What the call was given and what it printed is content too, so it is taken away like words.
            userSelect: "text",
            cursor: "text",
          }}
        >
          {/* On the place of the line a command would carry stands where the call went. */}
          {call.serverId !== null && (
            <div>
              <span
                style={{
                  color: CALL_ROW_BODY_QUIET_COLOR,
                }}
              >
                {CALL_ROW_SOURCE_LABEL}
              </span>
              {`${CALL_ROW_ARGUMENT_SEPARATOR}${CALL_ROW_SOURCE_KIND}${CALL_ROW_SEPARATOR}${call.serverName}`}
            </div>
          )}
          {Object.entries(call.arguments).map(([name, value]) => (
            <div key={name}>
              <span
                style={{
                  color: CALL_ROW_BODY_QUIET_COLOR,
                }}
              >
                {name}
              </span>
              {`${CALL_ROW_ARGUMENT_SEPARATOR}${value} `}
              <span
                style={{
                  color: call.pinned.includes(name) ? CALL_ROW_BODY_PINNED_COLOR : CALL_ROW_BODY_QUIET_COLOR,
                }}
              >
                {call.pinned.includes(name) ? CALL_ROW_PINNED_LABEL : CALL_ROW_FROM_MODEL_LABEL}
              </span>
            </div>
          ))}
          {call.line !== "" && <div>{`${CALL_ROW_LINE_PREFIX}${call.line}`}</div>}
          {isRunning && (
            <div
              style={{
                color: CALL_ROW_BODY_QUIET_COLOR,
              }}
            >
              {CALL_ROW_NO_OUTPUT_YET_LABEL}
            </div>
          )}
          {/* A server's answer is named, and «СКОПІЮВАТИ» takes it away whole — never a part of it. */}
          {call.output !== "" && call.serverId !== null && (
            <div
              className="d-flex align-items-center"
              style={{
                gap: CALL_ROW_SAID_GAP_PX,
              }}
            >
              <span
                style={{
                  color: CALL_ROW_BODY_QUIET_COLOR,
                }}
              >
                {CALL_ROW_SAID_LABEL}
              </span>
              <span className="flex-fill" />
              <CopyAction text={call.output} />
            </div>
          )}
          {call.output !== "" && <div>{call.output}</div>}
          {call.refusal !== "" && <div>{call.refusal}</div>}
        </div>
      )}
    </div>
  );
}
