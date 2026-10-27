import { CopyAction, Mark } from "../../../../../../components";
import { useElapsed } from "../../../../../../hooks";
import { RUN_CALL_REFUSED, RUN_CALL_RUNNING, RUN_CALL_SAID_NO } from "../../../../../record";
import {
  CALL_ROW_AGENT_FAILED_LABEL,
  CALL_ROW_AGENT_KIND,
  CALL_ROW_AGENT_SAID_LABEL,
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
  CALL_ROW_ROUTE_KIND,
  CALL_ROW_ROUTE_LABEL,
  CALL_ROW_ROUTE_REFUSED_LABEL,
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

/** One call as a line that opens on click. */
export function CallRow({ call, agentColor, openCalls }: CallRowProps) {
  const isRunning = call.state === RUN_CALL_RUNNING;
  // Stays a line until opened, also while the call is out; the open state lives in the chat.
  const isOpen = openCalls.isOpen(call.id);
  const elapsed = useElapsed(call.startedAt);
  const saidNo = call.state === RUN_CALL_SAID_NO;
  const isCommand = call.source === "command";
  const isAgent = call.source === "agent";
  const isRoute = call.source === "route";

  /** How long a server took to answer, in place of an exit code. */
  function answeredIn(): string {
    const seconds = ((call.endedAt - call.startedAt) / 1_000).toFixed(CALL_ROW_SECONDS_DIGITS);

    return `${seconds}${CALL_ROW_SECONDS_LABEL}`;
  }

  function stateLabel(): string {
    if (isRunning) {
      return `${CALL_ROW_RUNNING_LABEL}${CALL_ROW_SEPARATOR}${elapsed}`;
    }

    if (call.state === RUN_CALL_REFUSED) {
      return isRoute ? CALL_ROW_ROUTE_REFUSED_LABEL : CALL_ROW_REFUSED_LABEL;
    }

    // A decision has no code and no time of its own to tell.
    if (isRoute && !saidNo) {
      return CALL_ROW_ROUTE_LABEL;
    }

    // A refusal is an answer; its time is shown like any other.
    if (saidNo) {
      return `${isAgent ? CALL_ROW_AGENT_FAILED_LABEL : CALL_ROW_SAID_NO_LABEL}${CALL_ROW_SEPARATOR}${answeredIn()}`;
    }

    // A server call shows its answer time, a command its exit code; never swapped.
    return isCommand ? `${CALL_ROW_CODE_LABEL}${call.exitCode}` : `${CALL_ROW_ANSWERED_LABEL}${answeredIn()}`;
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
          // Breathes while the call is out.
          className={`flex-shrink-0${isRunning ? ` ${CALL_ROW_BREATH_CLASS}` : ""}`}
          style={{
            width: CALL_ROW_MARK_SIZE_PX,
            height: CALL_ROW_MARK_SIZE_PX,
            // Mark shape by source: command square, server or agent round.
            borderRadius: isCommand ? CALL_ROW_MARK_STILL_RADIUS_PX : "50%",
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
          // A troubled end colours the words.
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
            // Arguments and output are selectable text.
            userSelect: "text",
            cursor: "text",
          }}
        >
          {/* Stands where a command's line would be: where the call went. */}
          {!isCommand && (
            <div>
              <span
                style={{
                  color: CALL_ROW_BODY_QUIET_COLOR,
                }}
              >
                {CALL_ROW_SOURCE_LABEL}
              </span>
              {isRoute
                ? `${CALL_ROW_ARGUMENT_SEPARATOR}${CALL_ROW_ROUTE_KIND}`
                : isAgent
                  ? `${CALL_ROW_ARGUMENT_SEPARATOR}${CALL_ROW_AGENT_KIND}`
                  : `${CALL_ROW_ARGUMENT_SEPARATOR}${CALL_ROW_SOURCE_KIND}${CALL_ROW_SEPARATOR}${call.serverName}`}
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
          {/* A server's or an agent's answer is named and offers «СКОПІЮВАТИ» for the whole of it. */}
          {call.output !== "" && !isCommand && !isRoute && (
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
                {isAgent ? CALL_ROW_AGENT_SAID_LABEL : CALL_ROW_SAID_LABEL}
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
