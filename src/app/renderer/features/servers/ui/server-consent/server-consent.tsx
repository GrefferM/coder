import { useEffect, useRef } from "react";
import type { KeyboardEvent } from "react";
import { ActionButton, Mark, Words } from "../../../../components";
import { useAttentionPulse, useWindowKeydown } from "../../../../hooks";
import { ATTENTION_PULSE_SCALE, ATTENTION_PULSE_TRANSITION, CONFIRM_LAYER } from "../../../../constants";
import { consentEnvLabel } from "../../words";
import { ConsentBlock, WholeText } from "./components";
import {
  SERVER_CONSENT_DECLINE_LABEL,
  SERVER_CONSENT_FOLDER_LABEL,
  SERVER_CONSENT_KEPT_NOTE,
  SERVER_CONSENT_NO_VALUES_LABEL,
  SERVER_CONSENT_NOTE,
  SERVER_CONSENT_QUESTION_PREFIX,
  SERVER_CONSENT_QUESTION_SUFFIX,
  SERVER_CONSENT_RUN_ACTION_LABEL,
  SERVER_CONSENT_RUN_LABEL,
} from "../../constants";
import {
  SERVER_CONSENT_ACTIONS_GAP_PX,
  SERVER_CONSENT_ACTIONS_TOP_PX,
  SERVER_CONSENT_BACKGROUND_COLOR,
  SERVER_CONSENT_BORDER_COLOR,
  SERVER_CONSENT_BORDER_RADIUS_PX,
  SERVER_CONSENT_GAP_PX,
  SERVER_CONSENT_HEADER_GAP_PX,
  SERVER_CONSENT_ICON_SIZE_PX,
  SERVER_CONSENT_KEPT_LINE_HEIGHT,
  SERVER_CONSENT_NAME_BACKGROUND_COLOR,
  SERVER_CONSENT_NAME_BORDER_COLOR,
  SERVER_CONSENT_NAME_COLOR,
  SERVER_CONSENT_NAME_FONT_SIZE_PX,
  SERVER_CONSENT_NAME_PADDING,
  SERVER_CONSENT_NAME_RADIUS_PX,
  SERVER_CONSENT_NAMES_GAP_PX,
  SERVER_CONSENT_PADDING_PX,
  SERVER_CONSENT_QUESTION_COLOR,
  SERVER_CONSENT_QUESTION_FONT_SIZE_PX,
  SERVER_CONSENT_SCRIM_COLOR,
  SERVER_CONSENT_SHADOW,
  SERVER_CONSENT_WIDTH_PX,
} from "./constants";
import type { ServerConsentProps } from "./interfaces";

/**
 * The window before a local server's run line first runs on this machine: the line word for word, the folder, the
 * names of its variables and never their values. A click outside pulses the box; Escape is «Не запускати».
 */
export function ServerConsent({ server, directory, onRun, onDecline }: ServerConsentProps) {
  const declineRef = useRef<HTMLButtonElement>(null);
  const runRef = useRef<HTMLButtonElement>(null);
  const pulse = useAttentionPulse();

  // The safe answer holds the focus first.
  useEffect(() => {
    declineRef.current?.focus();
  }, []);

  useWindowKeydown(true, (event) => {
    if (event.key === "Escape") {
      onDecline();
    }
  });

  /** `←`/`→` move focus between the two answers. */
  function walk(event: KeyboardEvent) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
      return;
    }

    event.preventDefault();
    (event.key === "ArrowLeft" ? declineRef : runRef).current?.focus();
  }

  return (
    <div
      onClick={pulse.strike}
      role="presentation"
      className="d-flex align-items-center justify-content-center"
      style={{
        position: "absolute",
        inset: 0,
        zIndex: CONFIRM_LAYER,
        background: SERVER_CONSENT_SCRIM_COLOR,
      }}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        onKeyDown={walk}
        role="dialog"
        aria-label={`${SERVER_CONSENT_QUESTION_PREFIX}${server.name}${SERVER_CONSENT_QUESTION_SUFFIX}`}
        className="d-flex flex-column"
        style={{
          width: SERVER_CONSENT_WIDTH_PX,
          gap: SERVER_CONSENT_GAP_PX,
          padding: SERVER_CONSENT_PADDING_PX,
          borderRadius: SERVER_CONSENT_BORDER_RADIUS_PX,
          border: `1px solid ${SERVER_CONSENT_BORDER_COLOR}`,
          background: SERVER_CONSENT_BACKGROUND_COLOR,
          boxShadow: SERVER_CONSENT_SHADOW,
          boxSizing: "border-box",
          transform: pulse.isStruck ? `scale(${ATTENTION_PULSE_SCALE})` : undefined,
          transition: ATTENTION_PULSE_TRANSITION,
        }}
      >
        <div
          className="d-flex align-items-center"
          style={{
            gap: SERVER_CONSENT_HEADER_GAP_PX,
          }}
        >
          <svg
            width={SERVER_CONSENT_ICON_SIZE_PX}
            height={SERVER_CONSENT_ICON_SIZE_PX}
            viewBox="0 0 24 24"
            fill="none"
            stroke={SERVER_CONSENT_QUESTION_COLOR}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="4" width="18" height="16" rx="3" />
            <path d="m7 10 3 2.5L7 15M12.5 15H17" />
          </svg>
          <span
            style={{
              color: SERVER_CONSENT_QUESTION_COLOR,
              fontSize: SERVER_CONSENT_QUESTION_FONT_SIZE_PX,
              fontWeight: 600,
              overflowWrap: "anywhere",
            }}
          >
            {`${SERVER_CONSENT_QUESTION_PREFIX}${server.name}${SERVER_CONSENT_QUESTION_SUFFIX}`}
          </span>
        </div>
        <Words>{SERVER_CONSENT_NOTE}</Words>
        <ConsentBlock label={SERVER_CONSENT_RUN_LABEL}>
          <WholeText>{server.run}</WholeText>
        </ConsentBlock>
        <ConsentBlock label={SERVER_CONSENT_FOLDER_LABEL}>
          <WholeText>{directory}</WholeText>
        </ConsentBlock>
        {server.env.length > 0 && (
          <ConsentBlock label={consentEnvLabel(server.env.length)} aside={SERVER_CONSENT_NO_VALUES_LABEL}>
            <div
              className="d-flex flex-wrap"
              style={{
                gap: SERVER_CONSENT_NAMES_GAP_PX,
              }}
            >
              {server.env.map((name) => (
                <span
                  key={name}
                  className="font-monospace"
                  style={{
                    fontSize: SERVER_CONSENT_NAME_FONT_SIZE_PX,
                    color: SERVER_CONSENT_NAME_COLOR,
                    background: SERVER_CONSENT_NAME_BACKGROUND_COLOR,
                    border: `1px solid ${SERVER_CONSENT_NAME_BORDER_COLOR}`,
                    borderRadius: SERVER_CONSENT_NAME_RADIUS_PX,
                    padding: SERVER_CONSENT_NAME_PADDING,
                  }}
                >
                  {name}
                </span>
              ))}
            </div>
          </ConsentBlock>
        )}
        <Mark lineHeight={SERVER_CONSENT_KEPT_LINE_HEIGHT}>{SERVER_CONSENT_KEPT_NOTE}</Mark>
        <div
          className="d-flex"
          style={{
            gap: SERVER_CONSENT_ACTIONS_GAP_PX,
            paddingTop: SERVER_CONSENT_ACTIONS_TOP_PX,
          }}
        >
          <ActionButton
            ref={declineRef}
            variant="cancel"
            size="dialog"
            label={SERVER_CONSENT_DECLINE_LABEL}
            onClick={onDecline}
          />
          <ActionButton
            ref={runRef}
            variant="save"
            size="dialog"
            label={SERVER_CONSENT_RUN_ACTION_LABEL}
            onClick={onRun}
          />
        </div>
      </div>
    </div>
  );
}
