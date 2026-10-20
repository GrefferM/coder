import { SettingRow, Stepper } from "../../../../../../../../components";
import { AGENT_COMPRESS_STEP } from "../../../../../../constants";
import {
  AGENT_COMPRESS_AT_LEAST,
  AGENT_COMPRESS_AT_MOST,
  AGENT_COMPRESS_TO_LEAST,
  AGENT_COMPRESS_TO_MOST,
} from "../../../../../../../../../../contracts";
import {
  AGENT_SETTINGS_COMPRESS_AT_HINT,
  AGENT_SETTINGS_COMPRESS_AT_LABEL,
  AGENT_SETTINGS_COMPRESS_TO_HINT,
  AGENT_SETTINGS_COMPRESS_TO_LABEL,
} from "../../constants";
import type { MemoryNumbersProps } from "./interfaces";

/** Where a kept memory is compressed and what it is written down to, as shares of the model's ceiling. */
export function MemoryNumbers({ draft, was, mendedStepper, mendedRow, onDraftChange }: MemoryNumbersProps) {
  return (
    <>
      <SettingRow
        label={AGENT_SETTINGS_COMPRESS_AT_LABEL}
        wasValue={was.compressAt}
        hint={AGENT_SETTINGS_COMPRESS_AT_HINT}
      >
        <Stepper
          ref={mendedRow === "compressAt" ? mendedStepper : undefined}
          label={AGENT_SETTINGS_COMPRESS_AT_LABEL}
          value={draft.compressAt}
          step={AGENT_COMPRESS_STEP}
          least={AGENT_COMPRESS_AT_LEAST}
          most={AGENT_COMPRESS_AT_MOST}
          onChange={(compressAt) =>
            onDraftChange({
              compressAt,
            })
          }
        />
      </SettingRow>

      <SettingRow
        label={AGENT_SETTINGS_COMPRESS_TO_LABEL}
        wasValue={was.compressTo}
        hint={AGENT_SETTINGS_COMPRESS_TO_HINT}
      >
        <Stepper
          ref={mendedRow === "compressTo" ? mendedStepper : undefined}
          label={AGENT_SETTINGS_COMPRESS_TO_LABEL}
          value={draft.compressTo}
          step={AGENT_COMPRESS_STEP}
          least={AGENT_COMPRESS_TO_LEAST}
          most={AGENT_COMPRESS_TO_MOST}
          onChange={(compressTo) =>
            onDraftChange({
              compressTo,
            })
          }
        />
      </SettingRow>
    </>
  );
}
