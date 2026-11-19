import { useState } from "react";
import {
  ASK_PLACEHOLDER_PREFIX,
  ASK_PLACEHOLDER_SUFFIX,
  CHOOSE_PLACEHOLDER,
  SEND_LABEL,
  STOP_LABEL,
  WALKING_PLACEHOLDER,
  WIDGET_BORDER_COLOR,
  WIDGET_BUTTON_BACKGROUND_COLOR,
  WIDGET_BUTTON_BORDER_RADIUS_PX,
  WIDGET_BUTTON_ICON_COLOR,
  WIDGET_BUTTON_ICON_SIZE_PX,
  WIDGET_BUTTON_SIZE_PX,
  WIDGET_FIELD_AREA_GAP_PX,
  WIDGET_FIELD_AREA_PADDING,
  WIDGET_FIELD_BACKGROUND_COLOR,
  WIDGET_FIELD_BORDER_RADIUS_PX,
  WIDGET_FIELD_BUSY_BACKGROUND_COLOR,
  WIDGET_FIELD_BUSY_BORDER_COLOR,
  WIDGET_FIELD_COLOR,
  WIDGET_FIELD_HEIGHT_PX,
  WIDGET_FIELD_LINE_HEIGHT,
  WIDGET_FIELD_PADDING,
  WIDGET_SEND_READY_COLOR,
  WIDGET_STOP_COLOR,
  WIDGET_STOP_GAP_PX,
  WIDGET_STOP_ICON_SIZE_PX,
  WIDGET_TEXT_FONT_SIZE_PX,
} from "../../constants";
import { MARK_FONT_SIZE_PX, MARK_LETTER_SPACING_PX } from "../../../../constants";
import { MicButton, VoiceRow } from "../../../speech";
import { TextButton } from "../../../../components";
import {
  AGENT_CHAT_ATTACH_CHIPS_GAP_PX,
  AGENT_CHAT_ATTACH_LABEL,
  AGENT_CHAT_ATTACH_TONE,
  AttachChip,
  RepeatCount,
} from "../../../conversation";
import type { WidgetFieldProps } from "../../interfaces";

/**
 * The widget's field (52a, 4j without attachments): a question for the chosen sphere, typed and sent by Enter or the
 * arrow, Shift+Enter a new line, or said into the microphone (52d). While a walk is out it rests, and «ЗУПИНИТИ» stands
 * under it (4f).
 */
export function WidgetField({
  agentName,
  isWalking,
  voice,
  attachments,
  repeats,
  repeating,
  onAttach,
  onDetach,
  onRepeats,
  onSend,
  onStop,
}: WidgetFieldProps) {
  const [text, setText] = useState("");
  const canType = agentName !== null && !isWalking && repeating === null;
  const canSend = canType && text.trim() !== "";
  const placeholder = isWalking
    ? WALKING_PLACEHOLDER
    : agentName === null
      ? CHOOSE_PLACEHOLDER
      : `${ASK_PLACEHOLDER_PREFIX}${agentName}${ASK_PLACEHOLDER_SUFFIX}`;

  const send = async () => {
    if (!canSend) {
      return;
    }

    if (await onSend(text)) {
      setText("");
    }
  };

  return (
    <div
      className="d-flex flex-column flex-shrink-0"
      style={{
        padding: WIDGET_FIELD_AREA_PADDING,
        gap: WIDGET_FIELD_AREA_GAP_PX,
      }}
    >
      <textarea
        value={text}
        disabled={!canType}
        placeholder={placeholder}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            void send();
          }
        }}
        style={{
          height: WIDGET_FIELD_HEIGHT_PX,
          padding: WIDGET_FIELD_PADDING,
          resize: "none",
          borderRadius: WIDGET_FIELD_BORDER_RADIUS_PX,
          border: `1px solid ${isWalking ? WIDGET_FIELD_BUSY_BORDER_COLOR : WIDGET_BORDER_COLOR}`,
          background: isWalking ? WIDGET_FIELD_BUSY_BACKGROUND_COLOR : WIDGET_FIELD_BACKGROUND_COLOR,
          color: WIDGET_FIELD_COLOR,
          fontSize: WIDGET_TEXT_FONT_SIZE_PX,
          lineHeight: WIDGET_FIELD_LINE_HEIGHT,
          outline: "none",
        }}
      />
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
          gap: WIDGET_FIELD_AREA_GAP_PX,
        }}
      >
        <span
          className="d-flex flex-fill"
          style={{
            minWidth: 0,
          }}
        >
          {canType && voice.standing === "idle" && (
            <TextButton className="flex-shrink-0" tone={AGENT_CHAT_ATTACH_TONE} onPress={onAttach}>
              {AGENT_CHAT_ATTACH_LABEL}
            </TextButton>
          )}
          {!isWalking && voice.standing !== "idle" && (
            <VoiceRow
              standing={voice.standing}
              startedAt={voice.startedAt}
              levels={voice.levels}
              onCancel={voice.cancel}
            />
          )}
          {(isWalking || repeating !== null) && (
            <button
              type="button"
              onClick={onStop}
              className="d-flex align-items-center font-monospace text-uppercase"
              style={{
                gap: WIDGET_STOP_GAP_PX,
                padding: 0,
                border: "none",
                background: "transparent",
                color: WIDGET_STOP_COLOR,
                fontSize: MARK_FONT_SIZE_PX,
                letterSpacing: MARK_LETTER_SPACING_PX,
                cursor: "pointer",
              }}
            >
              <svg
                width={WIDGET_STOP_ICON_SIZE_PX}
                height={WIDGET_STOP_ICON_SIZE_PX}
                viewBox="0 0 24 24"
                fill="none"
                stroke={WIDGET_STOP_COLOR}
                strokeWidth="2"
              >
                <rect x="6" y="6" width="12" height="12" rx="1" />
              </svg>
              {STOP_LABEL}
            </button>
          )}
        </span>
        <RepeatCount repeats={repeats} repeating={repeating} isShut={agentName === null} onRepeats={onRepeats} />
        {canType && <MicButton standing={voice.standing} onPress={voice.press} />}
        <button
          type="button"
          aria-label={SEND_LABEL}
          disabled={!canSend}
          onClick={() => void send()}
          className="d-flex align-items-center justify-content-center"
          style={{
            width: WIDGET_BUTTON_SIZE_PX,
            height: WIDGET_BUTTON_SIZE_PX,
            border: "none",
            borderRadius: WIDGET_BUTTON_BORDER_RADIUS_PX,
            background: WIDGET_BUTTON_BACKGROUND_COLOR,
            cursor: canSend ? "pointer" : "default",
          }}
        >
          <svg
            width={WIDGET_BUTTON_ICON_SIZE_PX}
            height={WIDGET_BUTTON_ICON_SIZE_PX}
            viewBox="0 0 24 24"
            fill="none"
            stroke={canSend ? WIDGET_SEND_READY_COLOR : WIDGET_BUTTON_ICON_COLOR}
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
