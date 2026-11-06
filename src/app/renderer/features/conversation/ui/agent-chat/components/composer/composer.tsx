import { useEffect, useState } from "react";
import { AttachChip, MicButton, RepeatCount, VoiceRow } from "./components";
import { Mark, TextButton } from "../../../../../../components";
import { useInteraction } from "../../../../../../hooks";
import { INTERACTION_HOVER_BACKGROUND_COLOR, INTERACTION_TRANSITION } from "../../../../../../constants";
import { focusRing } from "../../../../../../utils/focus";
import { canAsk, fieldStanding } from "../../../../logic";
import { FIELD_LEAST_HEIGHT_PX } from "../../../../constants";
import { useFieldHeight } from "./hooks";
import {
  AGENT_CHAT_ATTACH_CHIPS_GAP_PX,
  AGENT_CHAT_ATTACH_LABEL,
  AGENT_CHAT_ATTACH_TONE,
  AGENT_CHAT_COMPOSER_GAP_PX,
  AGENT_CHAT_COMPOSER_PADDING,
  AGENT_CHAT_FIELD_BORDER_RADIUS_PX,
  AGENT_CHAT_FIELD_GROUNDS,
  AGENT_CHAT_GRIP_COLOR,
  AGENT_CHAT_GRIP_HEIGHT_PX,
  AGENT_CHAT_GRIP_LABEL,
  AGENT_CHAT_GRIP_LINE_HEIGHT_PX,
  AGENT_CHAT_GRIP_LINE_RADIUS_PX,
  AGENT_CHAT_GRIP_LINE_WIDTH_PX,
  AGENT_CHAT_GRIP_LIT_COLOR,
  AGENT_CHAT_FIELD_PADDING,
  AGENT_CHAT_FIELD_PLACEHOLDER_PREFIX,
  AGENT_CHAT_FIELD_PLACEHOLDER_SUFFIX,
  AGENT_CHAT_NO_AIM_HINT,
  AGENT_CHAT_NO_AIM_PLACEHOLDER,
  AGENT_CHAT_OFF_HINT,
  AGENT_CHAT_OFF_PLACEHOLDER,
  AGENT_CHAT_REPEATING_PLACEHOLDER_PREFIX,
  AGENT_CHAT_REPEATING_PLACEHOLDER_SUFFIX,
  AGENT_CHAT_RULE_COLOR,
  AGENT_CHAT_SEND_BACKGROUND_COLOR,
  AGENT_CHAT_SEND_BORDER_RADIUS_PX,
  AGENT_CHAT_SEND_ICON_COLOR,
  AGENT_CHAT_SEND_ICON_SIZE_PX,
  AGENT_CHAT_SEND_LABEL,
  AGENT_CHAT_SEND_SIZE_PX,
  AGENT_CHAT_STOP_BLINK_CLASS,
  AGENT_CHAT_STOP_GAP_PX,
  AGENT_CHAT_STOP_ICON_SIZE_PX,
  AGENT_CHAT_STOP_LABEL,
  AGENT_CHAT_STOP_TONE,
  AGENT_CHAT_TEXT_COLOR,
  AGENT_CHAT_TEXT_FONT_SIZE_PX,
  AGENT_CHAT_TEXT_LINE_HEIGHT,
  AGENT_CHAT_WALKING_PLACEHOLDER,
} from "../../constants";
import type { ComposerProps } from "./interfaces";

/** The field a question is written in, with the send/stop control under it. */
export function Composer({
  agentId,
  agentName,
  isAgentActive,
  isWalking,
  draft,
  onDraftChange,
  attachments,
  onAttach,
  onDetach,
  onSend,
  onStop,
  repeats,
  onRepeats,
  repeating,
  fieldHeight,
  onFieldHeight,
  voice,
}: ComposerProps) {
  const send = useInteraction();
  const grip = useInteraction();
  const field = useFieldHeight(fieldHeight ?? FIELD_LEAST_HEIGHT_PX, onFieldHeight);
  /** Count of ⌘↵ presses that could not go through; each restarts the stop's blink. */
  const [blockedPresses, setBlockedPresses] = useState(0);
  /** Repeats hold the stop up between their walks too, and shut the field until the last ends. */
  const isGoing = isWalking || repeating !== null;
  const standing = fieldStanding(agentId, isAgentActive, isGoing);
  const ground = AGENT_CHAT_FIELD_GROUNDS[standing];
  /** While a question is being said, half of it is not in the field yet, so nothing is sent. */
  const isSaying = voice.standing !== "idle";
  const canSend = canAsk(draft, standing) && !isSaying;

  // Quiets the blink when a walk ends.
  useEffect(() => {
    if (!isGoing) {
      setBlockedPresses(0);
    }
  }, [isGoing]);

  /** Placeholder: the target, agent off, or no target. */
  function fieldPlaceholder(): string {
    if (agentId === null) {
      return AGENT_CHAT_NO_AIM_PLACEHOLDER;
    }

    if (!isAgentActive) {
      return AGENT_CHAT_OFF_PLACEHOLDER;
    }

    if (repeating !== null) {
      return `${AGENT_CHAT_REPEATING_PLACEHOLDER_PREFIX}${repeating.sent}/${repeating.total}${AGENT_CHAT_REPEATING_PLACEHOLDER_SUFFIX}`;
    }

    // During a walk the placeholder gives the reason nothing is sent.
    if (standing === "walking") {
      return AGENT_CHAT_WALKING_PLACEHOLDER;
    }

    return `${AGENT_CHAT_FIELD_PLACEHOLDER_PREFIX}${agentName}${AGENT_CHAT_FIELD_PLACEHOLDER_SUFFIX}`;
  }

  /** Why there is nowhere to send; empty where sending is open. */
  function aimLabel(): string {
    return agentId === null ? AGENT_CHAT_NO_AIM_HINT : AGENT_CHAT_OFF_HINT;
  }

  function handleSend() {
    if (canSend) {
      onSend();

      return;
    }

    // A press during a walk is answered by the stop; with an empty draft nothing was asked.
    if (standing === "walking" && draft.trim() !== "") {
      setBlockedPresses((was) => was + 1);
    }
  }

  return (
    <div
      className="d-flex flex-column flex-shrink-0"
      style={{
        padding: AGENT_CHAT_COMPOSER_PADDING,
        gap: AGENT_CHAT_COMPOSER_GAP_PX,
        borderTop: `1px solid ${AGENT_CHAT_RULE_COLOR}`,
      }}
    >
      {/* The field is resized only by this strip; a textarea corner would grow it off the window. */}
      <div
        role="separator"
        aria-orientation="horizontal"
        aria-label={AGENT_CHAT_GRIP_LABEL}
        className="d-flex align-items-center justify-content-center flex-shrink-0"
        onPointerDown={field.onPointerDown}
        {...grip.handlers}
        style={{
          height: AGENT_CHAT_GRIP_HEIGHT_PX,
          cursor: "ns-resize",
          touchAction: "none",
        }}
      >
        <span
          style={{
            width: AGENT_CHAT_GRIP_LINE_WIDTH_PX,
            height: AGENT_CHAT_GRIP_LINE_HEIGHT_PX,
            borderRadius: AGENT_CHAT_GRIP_LINE_RADIUS_PX,
            background: grip.isLit || field.isPulled ? AGENT_CHAT_GRIP_LIT_COLOR : AGENT_CHAT_GRIP_COLOR,
            transition: INTERACTION_TRANSITION,
          }}
        />
      </div>
      <textarea
        value={draft}
        // Disabled when there is nothing to write in it, and while repeats go, so nothing slips between them.
        disabled={standing === "stitched" || repeating !== null}
        className={ground.wordClass ?? undefined}
        aria-label={`${AGENT_CHAT_FIELD_PLACEHOLDER_PREFIX}${agentName}`}
        placeholder={fieldPlaceholder()}
        onChange={(event) => onDraftChange(event.target.value)}
        onKeyDown={(event) => {
          // ⌘↵ sends; a plain Enter is a new line.
          if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
            event.preventDefault();
            handleSend();
          }
        }}
        style={{
          padding: AGENT_CHAT_FIELD_PADDING,
          borderRadius: AGENT_CHAT_FIELD_BORDER_RADIUS_PX,
          // Ground and edge differ by state; the word takes one of two colours.
          border: `1px solid ${ground.border}`,
          background: ground.background,
          height: field.height,
          minHeight: FIELD_LEAST_HEIGHT_PX,
          color: AGENT_CHAT_TEXT_COLOR,
          fontSize: AGENT_CHAT_TEXT_FONT_SIZE_PX,
          lineHeight: AGENT_CHAT_TEXT_LINE_HEIGHT,
          resize: "none",
          outline: "none",
        }}
      />
      {/* Chips sit between field and hand, only while something is attached, wrapping into rows. */}
      {attachments.length > 0 && (
        <div
          className="d-flex flex-wrap"
          style={{
            gap: AGENT_CHAT_ATTACH_CHIPS_GAP_PX,
          }}
        >
          {attachments.map((attachment) => (
            <AttachChip key={attachment.path} attachment={attachment} onDetach={onDetach} />
          ))}
        </div>
      )}
      <div
        className="d-flex align-items-center"
        style={{
          gap: AGENT_CHAT_COMPOSER_GAP_PX,
        }}
      >
        {/* Anything of this conversation out, repeats included, is stopped from here. */}
        {isGoing ? (
          <TextButton
            // The key restarts the blink on each press.
            key={blockedPresses}
            tone={AGENT_CHAT_STOP_TONE}
            onPress={onStop}
            gap={AGENT_CHAT_STOP_GAP_PX}
            className={blockedPresses === 0 ? "me-auto" : `me-auto ${AGENT_CHAT_STOP_BLINK_CLASS}`}
          >
            <svg
              width={AGENT_CHAT_STOP_ICON_SIZE_PX}
              height={AGENT_CHAT_STOP_ICON_SIZE_PX}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
            {AGENT_CHAT_STOP_LABEL}
          </TextButton>
        ) : standing === "open" && voice.standing !== "idle" ? (
          // While a question is said, its word stands where «+» stood.
          <VoiceRow standing={voice.standing} startedAt={voice.startedAt} onCancel={voice.cancel} />
        ) : standing === "open" ? (
          // «+ ПРИКРІПИТИ» left, send right.
          <>
            <TextButton className="flex-shrink-0" tone={AGENT_CHAT_ATTACH_TONE} onPress={onAttach}>
              {AGENT_CHAT_ATTACH_LABEL}
            </TextButton>
            <span className="flex-fill" />
          </>
        ) : (
          // Stitched field: no «+», only the reason label.
          <Mark className="flex-fill">{aimLabel()}</Mark>
        )}
        <RepeatCount repeats={repeats} repeating={repeating} isShut={standing === "stitched"} onRepeats={onRepeats} />
        {/* The microphone stands where «+» does: only while there is somewhere to send. */}
        {standing === "open" && <MicButton standing={voice.standing} onPress={voice.press} />}
        <button
          type="button"
          aria-label={AGENT_CHAT_SEND_LABEL}
          disabled={!canSend}
          onClick={handleSend}
          {...send.handlers}
          className="d-flex align-items-center justify-content-center flex-shrink-0"
          style={{
            width: AGENT_CHAT_SEND_SIZE_PX,
            height: AGENT_CHAT_SEND_SIZE_PX,
            border: "none",
            borderRadius: AGENT_CHAT_SEND_BORDER_RADIUS_PX,
            background: send.isLit && canSend ? INTERACTION_HOVER_BACKGROUND_COLOR : AGENT_CHAT_SEND_BACKGROUND_COLOR,
            opacity: canSend ? 1 : 0.5,
            cursor: canSend ? "pointer" : "default",
            outline: "none",
            boxShadow: focusRing(send.isFocused),
            transition: INTERACTION_TRANSITION,
          }}
        >
          <svg
            width={AGENT_CHAT_SEND_ICON_SIZE_PX}
            height={AGENT_CHAT_SEND_ICON_SIZE_PX}
            viewBox="0 0 24 24"
            fill="none"
            stroke={AGENT_CHAT_SEND_ICON_COLOR}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
