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
import type { MemoryNumber } from "../../../../../../logic";
import type { MemoryNumbersProps } from "./interfaces";

/** The two numbers of a kept memory, each with what it is called, what it says and how far it may go. */
const ROWS: { field: MemoryNumber; label: string; hint: string; least: number; most: number }[] = [
  {
    field: "compressAt",
    label: AGENT_SETTINGS_COMPRESS_AT_LABEL,
    hint: AGENT_SETTINGS_COMPRESS_AT_HINT,
    least: AGENT_COMPRESS_AT_LEAST,
    most: AGENT_COMPRESS_AT_MOST,
  },
  {
    field: "compressTo",
    label: AGENT_SETTINGS_COMPRESS_TO_LABEL,
    hint: AGENT_SETTINGS_COMPRESS_TO_HINT,
    least: AGENT_COMPRESS_TO_LEAST,
    most: AGENT_COMPRESS_TO_MOST,
  },
];

/** Where a kept memory is compressed and what it is written down to, as shares of the model's ceiling. */
export function MemoryNumbers({ draft, was, mendedStepper, mendedRow, onDraftChange }: MemoryNumbersProps) {
  return (
    <>
      {ROWS.map((row) => (
        <SettingRow key={row.field} label={row.label} wasValue={was[row.field]} hint={row.hint}>
          <Stepper
            ref={mendedRow === row.field ? mendedStepper : undefined}
            label={row.label}
            value={draft[row.field]}
            step={AGENT_COMPRESS_STEP}
            least={row.least}
            most={row.most}
            onChange={(value) =>
              onDraftChange({
                [row.field]: value,
              })
            }
          />
        </SettingRow>
      ))}
    </>
  );
}
