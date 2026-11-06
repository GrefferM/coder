import { useInteraction } from "../../../../../../../../hooks";
import { INTERACTION_TRANSITION } from "../../../../../../../../constants";
import { focusRing } from "../../../../../../../../utils/focus";
import { MICROPHONE_FINISH_LABEL, MICROPHONE_LABEL } from "../../../../../../../speech";
import {
  AGENT_CHAT_SEND_BACKGROUND_COLOR,
  AGENT_CHAT_SEND_BORDER_RADIUS_PX,
  AGENT_CHAT_SEND_SIZE_PX,
} from "../../../../constants";
import {
  MIC_HEARING_OPACITY,
  MIC_ICON_SIZE_PX,
  MIC_LIT_COLOR,
  MIC_RECORDING_BACKGROUND_COLOR,
  MIC_RECORDING_ICON_COLOR,
  MIC_REST_COLOR,
} from "./constants";
import type { MicButtonProps } from "./interfaces";

/** The microphone beside the send: a press records, a second ends it; dead while the recording is being heard. */
export function MicButton({ standing, onPress }: MicButtonProps) {
  const press = useInteraction();
  const isRecording = standing === "recording";
  const isHearing = standing === "hearing";
  const stroke = isRecording ? MIC_RECORDING_ICON_COLOR : press.isLit && !isHearing ? MIC_LIT_COLOR : MIC_REST_COLOR;

  return (
    <button
      type="button"
      aria-label={isRecording ? MICROPHONE_FINISH_LABEL : MICROPHONE_LABEL}
      aria-pressed={isRecording}
      disabled={isHearing}
      onClick={onPress}
      {...press.handlers}
      className="d-flex align-items-center justify-content-center flex-shrink-0"
      style={{
        width: AGENT_CHAT_SEND_SIZE_PX,
        height: AGENT_CHAT_SEND_SIZE_PX,
        border: "none",
        borderRadius: AGENT_CHAT_SEND_BORDER_RADIUS_PX,
        background: isRecording ? MIC_RECORDING_BACKGROUND_COLOR : AGENT_CHAT_SEND_BACKGROUND_COLOR,
        opacity: isHearing ? MIC_HEARING_OPACITY : 1,
        cursor: isHearing ? "default" : "pointer",
        outline: "none",
        boxShadow: focusRing(press.isFocused),
        transition: INTERACTION_TRANSITION,
      }}
    >
      <svg
        width={MIC_ICON_SIZE_PX}
        height={MIC_ICON_SIZE_PX}
        viewBox="0 0 24 24"
        fill="none"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <path d="M12 19v3" />
      </svg>
    </button>
  );
}
