import { SettingRow, Stepper, Toggle } from "../../../../../../../../components";
import { AGENT_TEMPERATURE_PLACES, AGENT_TEMPERATURE_STEP } from "../../../../../../constants";
import {
  AGENT_MAX_CALLS_LEAST,
  AGENT_TEMPERATURE_LEAST,
  AGENT_TEMPERATURE_MOST,
} from "../../../../../../../../../../contracts";
import {
  AGENT_SETTINGS_MAX_CALLS_HINT,
  AGENT_SETTINGS_MAX_CALLS_LABEL,
  AGENT_SETTINGS_MAX_CALLS_UNLIMITED,
  AGENT_SETTINGS_SWITCH_LABEL,
  AGENT_SETTINGS_THREAD_HINT,
  AGENT_SETTINGS_THREAD_LABEL,
  AGENT_SETTINGS_WAIT_HINT,
  AGENT_SETTINGS_WAIT_LABEL,
  AGENT_SETTINGS_TEMPERATURE_HINT,
  AGENT_SETTINGS_TEMPERATURE_LABEL,
} from "../../constants";
import type { SettingsNumbersProps } from "./interfaces";

/** The agent's numbers, its toggles and its switch, each showing its previous value when changed. */
export function SettingsNumbers({
  draft,
  was,
  mendedStepper,
  mendedRow,
  isConverging,
  onDraftChange,
}: SettingsNumbersProps) {
  return (
    <>
      <SettingRow label={AGENT_SETTINGS_MAX_CALLS_LABEL} wasValue={was.maxCalls} hint={AGENT_SETTINGS_MAX_CALLS_HINT}>
        <Stepper
          ref={mendedRow === "maxCalls" ? mendedStepper : undefined}
          label={AGENT_SETTINGS_MAX_CALLS_LABEL}
          value={draft.maxCalls}
          least={AGENT_MAX_CALLS_LEAST}
          floorLabel={AGENT_SETTINGS_MAX_CALLS_UNLIMITED}
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

      {/* The wait applies only to a converging point: one incoming line has nothing to wait for. */}
      {isConverging && (
        <SettingRow label={AGENT_SETTINGS_WAIT_LABEL} wasValue={was.waitsForAll} hint={AGENT_SETTINGS_WAIT_HINT}>
          <Toggle
            label={AGENT_SETTINGS_WAIT_LABEL}
            isOn={draft.waitsForAll}
            onChange={(waitsForAll) =>
              onDraftChange({
                waitsForAll,
              })
            }
          />
        </SettingRow>
      )}

      <SettingRow label={AGENT_SETTINGS_THREAD_LABEL} wasValue={was.keepsThread} hint={AGENT_SETTINGS_THREAD_HINT}>
        <Toggle
          label={AGENT_SETTINGS_THREAD_LABEL}
          isOn={draft.keepsThread}
          onChange={(keepsThread) =>
            onDraftChange({
              keepsThread,
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
