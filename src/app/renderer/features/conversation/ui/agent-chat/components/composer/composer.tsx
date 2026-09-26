import { useEffect, useState } from "react";
import { AttachChip } from "./components";
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

/** The field a question is written in, and the one hand under it — to send, or to stop. */
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
  fieldHeight,
  onFieldHeight,
}: ComposerProps) {
  const send = useInteraction();
  const grip = useInteraction();
  /** The field stands where it was left, and at its own least where it was never pulled. */
  const field = useFieldHeight(fieldHeight ?? FIELD_LEAST_HEIGHT_PX, onFieldHeight);
  /**
   * Presses of ⌘↵ that could not go through. The stop answers each one, and the count is what makes the
   * next press start the blink over instead of adding to it.
   */
  const [blockedPresses, setBlockedPresses] = useState(0);
  /** Which of the three the field is in, and how that one is painted. */
  const standing = fieldStanding(agentId, isAgentActive, isWalking);
  const ground = AGENT_CHAT_FIELD_GROUNDS[standing];
  const canSend = canAsk(draft, standing);

  // A walk that is over has nothing left to answer for: the next one begins with the blink quiet.
  useEffect(() => {
    if (!isWalking) {
      setBlockedPresses(0);
    }
  }, [isWalking]);

  /** What the empty field says: whom it would go to, that the agent is off, or that nobody is aimed at. */
  function fieldPlaceholder(): string {
    if (agentId === null) {
      return AGENT_CHAT_NO_AIM_PLACEHOLDER;
    }

    if (!isAgentActive) {
      return AGENT_CHAT_OFF_PLACEHOLDER;
    }

    // While the walk goes, the name of whom to ask gives way to the reason nothing is going.
    if (standing === "walking") {
      return AGENT_CHAT_WALKING_PLACEHOLDER;
    }

    return `${AGENT_CHAT_FIELD_PLACEHOLDER_PREFIX}${agentName}${AGENT_CHAT_FIELD_PLACEHOLDER_SUFFIX}`;
  }

  /** Why there is nowhere to send — the only word under the field, and none at all where the send is open. */
  function aimLabel(): string {
    return agentId === null ? AGENT_CHAT_NO_AIM_HINT : AGENT_CHAT_OFF_HINT;
  }

  function handleSend() {
    if (canSend) {
      onSend();

      return;
    }

    // A press under the walk is answered by the stop itself; with nothing typed, nothing was asked for.
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
      {/*
        The field is pulled by this strip and by nothing else: a textarea's own corner would grow it downwards,
        off the window, since the field stands at the bottom of the chat with the hand under it.
      */}
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
        // A field is stitched only where there is nothing to write in it at all.
        disabled={standing === "stitched"}
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
          // The three states differ by ground and edge; the word takes one of only two colours.
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
      {/* Chips stand between the field and the hand, and only while something is attached; they wrap into rows. */}
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
        {/* While any turn of the walk is out there is something to stop, wherever it is held. */}
        {isWalking ? (
          <TextButton
            // The key is what restarts the blink: the same class laid on twice would not answer the second press.
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
        ) : standing === "open" ? (
          // «+ ПРИКРІПИТИ» stands to the left, and the send hand to the right; nothing names the send between them.
          <>
            <TextButton className="flex-shrink-0" tone={AGENT_CHAT_ATTACH_TONE} onPress={onAttach}>
              {AGENT_CHAT_ATTACH_LABEL}
            </TextButton>
            <span className="flex-fill" />
          </>
        ) : (
          // The field is stitched — no «+», only the word for why there is nowhere to send.
          <Mark className="flex-fill">{aimLabel()}</Mark>
        )}
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
