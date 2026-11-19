import { FieldSlot, Stepper } from "../../../../../../components";
import { VOICE_RATE_LEAST, VOICE_RATE_MOST, VOICE_RATE_STEP } from "../../../../../../../../contracts";
import { VOICE_RATE_LABEL, VOICE_RATE_OWN, VOICE_RATE_PLACES } from "../../../../constants";
import type { VoiceRateProps } from "./interfaces";

/** How fast a voice reads, under its field: from half its own pace to twice it, a tenth at a step. */
export function VoiceRate({ rate, onChange }: VoiceRateProps) {
  return (
    <FieldSlot label={VOICE_RATE_LABEL}>
      <Stepper
        label={VOICE_RATE_LABEL}
        value={rate ?? VOICE_RATE_OWN}
        step={VOICE_RATE_STEP}
        least={VOICE_RATE_LEAST}
        most={VOICE_RATE_MOST}
        places={VOICE_RATE_PLACES}
        onChange={onChange}
      />
    </FieldSlot>
  );
}
