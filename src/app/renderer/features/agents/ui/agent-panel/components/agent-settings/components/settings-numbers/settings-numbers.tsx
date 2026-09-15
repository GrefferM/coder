import { SettingRow, Stepper, Toggle } from "../../../../../../../../components";
import { AGENT_TEMPERATURE_PLACES, AGENT_TEMPERATURE_STEP } from "../../../../../../constants";
import {
  AGENT_MAX_CALLS_LEAST,
  AGENT_TEMPERATURE_LEAST,
  AGENT_TEMPERATURE_MOST,
} from "../../../../../../../../../../contracts";
import {
  AGENT_SETTINGS_MAX_CALLS_LABEL,
  AGENT_SETTINGS_SWITCH_LABEL,
  AGENT_SETTINGS_TEMPERATURE_HINT,
  AGENT_SETTINGS_TEMPERATURE_LABEL,
} from "../../constants";
import type { SettingsNumbersProps } from "./interfaces";

/** The agent's own numbers and its switch — each row saying what it was, if it changed. */
export function SettingsNumbers({ draft, was, mendedStepper, mendedRow, onDraftChange }: SettingsNumbersProps) {
  return (
    <>
      <SettingRow label={AGENT_SETTINGS_MAX_CALLS_LABEL} wasValue={was.maxCalls}>
        <Stepper
          ref={mendedRow === "maxCalls" ? mendedStepper : undefined}
          label={AGENT_SETTINGS_MAX_CALLS_LABEL}
          value={draft.maxCalls}
          least={AGENT_MAX_CALLS_LEAST}
          onChange={(maxCalls) =>
            onDraftChange({
              maxCalls,
            })
          }
        />
      </SettingRow>

      <SettingRow
        label={AGENT_SETTINGS_TEMPERATURE_LABEL}
        wasValue={was.temperature}
        hint={AGENT_SETTINGS_TEMPERATURE_HINT}
      >
        <Stepper
          ref={mendedRow === "temperature" ? mendedStepper : undefined}
          label={AGENT_SETTINGS_TEMPERATURE_LABEL}
          value={draft.temperature}
          step={AGENT_TEMPERATURE_STEP}
          least={AGENT_TEMPERATURE_LEAST}
          most={AGENT_TEMPERATURE_MOST}
          places={AGENT_TEMPERATURE_PLACES}
          onChange={(temperature) =>
            onDraftChange({
              temperature,
            })
          }
        />
      </SettingRow>

      <SettingRow label={AGENT_SETTINGS_SWITCH_LABEL} wasValue={was.isActive}>
        <Toggle
          label={AGENT_SETTINGS_SWITCH_LABEL}
          isOn={draft.isActive}
          onChange={(isActive) =>
            onDraftChange({
              isActive,
            })
          }
        />
      </SettingRow>
    </>
  );
}
