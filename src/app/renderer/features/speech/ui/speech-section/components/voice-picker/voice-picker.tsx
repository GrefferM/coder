import { FieldSlot, PickerShell, TextButton } from "../../../../../../components";
import {
  PICKER_NAME_COLOR,
  PICKER_NAME_FONT_SIZE_PX,
  PICKER_PLACEHOLDER_COLOR,
  PICKER_ROW_BORDER_RADIUS_PX,
  PICKER_ROW_CHOSEN_BACKGROUND_COLOR,
  PICKER_ROW_GAP_PX,
  PICKER_ROW_PADDING,
  PICKER_VALUE_COLOR,
} from "../../../../../../components/picker-shell/constants";
import { NOT_FILLED_LABEL } from "../../../../../../constants";
import { voiceLabel } from "../../../../words";
import { VOICE_FIELD_LABEL, VOICE_LISTEN_LABEL } from "../../../../constants";
import { VOICE_LISTEN_TONE } from "./constants";
import type { VoicePickerProps } from "./interfaces";

/** Which of the OS's voices reads an answer; chosen at once, and heard by «ПОСЛУХАТИ» once one is chosen. */
export function VoicePicker({ voices, voiceName, onChange, onListen }: VoicePickerProps) {
  const chosen = voices.find((voice) => voice.name === voiceName) ?? null;
  /** A chosen voice gone from this machine is still named, so the person sees what was chosen. */
  const shown = chosen === null ? (voiceName ?? NOT_FILLED_LABEL) : voiceLabel(chosen);

  return (
    <FieldSlot
      label={VOICE_FIELD_LABEL}
      action={
        voiceName !== null && (
          <TextButton tone={VOICE_LISTEN_TONE} onPress={onListen}>
            {VOICE_LISTEN_LABEL}
          </TextButton>
        )
      }
    >
      <PickerShell
        field={<span className="flex-fill text-truncate">{shown}</span>}
        fieldColor={voiceName === null ? PICKER_PLACEHOLDER_COLOR : PICKER_VALUE_COLOR}
        items={voices}
        matches={(voice, query) => voiceLabel(voice).toLowerCase().includes(query)}
        choose={(voice, close) => {
          onChange(voice.name);
          close();
        }}
        row={(voice, close) => (
          <button
            key={voice.name}
            type="button"
            onClick={() => {
              onChange(voice.name);
              close();
            }}
            className="d-flex align-items-center text-start"
            style={{
              padding: PICKER_ROW_PADDING,
              gap: PICKER_ROW_GAP_PX,
              borderRadius: PICKER_ROW_BORDER_RADIUS_PX,
              border: "none",
              background: voice.name === voiceName ? PICKER_ROW_CHOSEN_BACKGROUND_COLOR : "transparent",
              color: PICKER_NAME_COLOR,
              fontSize: PICKER_NAME_FONT_SIZE_PX,
              cursor: "pointer",
            }}
          >
            {voiceLabel(voice)}
          </button>
        )}
      />
    </FieldSlot>
  );
}
