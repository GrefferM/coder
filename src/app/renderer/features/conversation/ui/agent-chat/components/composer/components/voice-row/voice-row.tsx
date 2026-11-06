import { Dot, Mark, TextButton } from "../../../../../../../../components";
import { useElapsed } from "../../../../../../../../hooks";
import {
  HEARING_LABEL,
  RECORDING_CANCEL_LABEL,
  RECORDING_LABEL,
  RECORDING_SEPARATOR,
} from "../../../../../../../speech";
import {
  VOICE_ROW_BREATH_CLASS,
  VOICE_ROW_BREATH_MS,
  VOICE_ROW_CANCEL_TONE,
  VOICE_ROW_COLOR,
  VOICE_ROW_DOT_SIZE_PX,
  VOICE_ROW_GAP_PX,
  VOICE_ROW_HEARING_COLOR,
} from "./constants";
import type { VoiceRowProps } from "./interfaces";

/** The row's left while a question is said: «ЗАПИС · 00:07» with its breathing dot and «СКАСУВАТИ», then «РОЗПІЗНАЄМО…». */
export function VoiceRow({ standing, startedAt, onCancel }: VoiceRowProps) {
  const clock = useElapsed(startedAt);

  if (standing === "hearing") {
    return (
      <Mark color={VOICE_ROW_HEARING_COLOR} className="flex-fill">
        {HEARING_LABEL}
      </Mark>
    );
  }

  return (
    <span
      className="d-flex align-items-center flex-fill"
      style={{
        gap: VOICE_ROW_GAP_PX,
      }}
    >
      <span
        className={`d-flex flex-shrink-0 ${VOICE_ROW_BREATH_CLASS}`}
        style={{
          animationDuration: `${VOICE_ROW_BREATH_MS}ms`,
        }}
      >
        <Dot color={VOICE_ROW_COLOR} size={VOICE_ROW_DOT_SIZE_PX} />
      </span>
      <Mark color={VOICE_ROW_COLOR} className="flex-fill">{`${RECORDING_LABEL}${RECORDING_SEPARATOR}${clock}`}</Mark>
      <TextButton tone={VOICE_ROW_CANCEL_TONE} onPress={onCancel} className="flex-shrink-0">
        {RECORDING_CANCEL_LABEL}
      </TextButton>
    </span>
  );
}
