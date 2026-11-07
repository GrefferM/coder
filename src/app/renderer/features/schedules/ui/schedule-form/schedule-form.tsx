import { useEffect, useState } from "react";
import { ActionButton, Field, SettingRow, StepHead, Toggle } from "../../../../components";
import { FIELD_INVALID_MS } from "../../../../components/field/constants";
import { useStandingStep, useWindowKeydown } from "../../../../hooks";
import { scheduleBlocker, writtenMinutes } from "../../logic";
import { AgentField, TaskField } from "./components";
import {
  SCHEDULE_FORM_AGENT_LABEL,
  SCHEDULE_FORM_BACK_LABEL,
  SCHEDULE_FORM_BODY_GAP_PX,
  SCHEDULE_FORM_BODY_PADDING,
  SCHEDULE_FORM_CANCEL_LABEL,
  SCHEDULE_FORM_CREATE_LABEL,
  SCHEDULE_FORM_DELETE_LABEL,
  SCHEDULE_FORM_FOOT_BORDER_COLOR,
  SCHEDULE_FORM_FOOT_GAP_PX,
  SCHEDULE_FORM_FOOT_PADDING_PX,
  SCHEDULE_FORM_HEAD_NEW,
  SCHEDULE_FORM_HEAD_WHOSE,
  SCHEDULE_FORM_INTERVAL_LABEL,
  SCHEDULE_FORM_INTERVAL_UNIT,
  SCHEDULE_FORM_INTERVAL_WRONG_NOTE,
  SCHEDULE_FORM_SAVE_LABEL,
  SCHEDULE_FORM_SWITCH_LABEL,
  SCHEDULE_FORM_TASK_LABEL,
  SCHEDULE_FORM_UNFILLED_PLACEHOLDER,
} from "./constants";
import type { ScheduleFormProps } from "./interfaces";

/** One schedule as a step of the tab: the task, whom it goes to, how often, and whether it runs. */
export function ScheduleForm({
  values,
  schedule,
  agents,
  isDirty,
  onChange,
  onSave,
  onCancel,
  onRevert,
  onDelete,
}: ScheduleFormProps) {
  const [wasTried, setWasTried] = useState(false);
  const isNew = schedule === null;
  const chosen = agents.find((agent) => agent.id === values.agentId) ?? null;
  const isIntervalWrong = values.everyMinutes.trim() !== "" && writtenMinutes(values.everyMinutes) === null;
  const blocked = scheduleBlocker(values);

  useEffect(() => {
    if (!wasTried) {
      return;
    }

    const fading = window.setTimeout(() => setWasTried(false), FIELD_INVALID_MS);

    return () => window.clearTimeout(fading);
  }, [wasTried]);

  // Escape leaves this step as it leaves a server's page; the tab stays.
  useStandingStep(true);
  useWindowKeydown(true, (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      onCancel();
    }
  });

  async function save() {
    // Pressing with something missing marks the field, without a refusal in words.
    if (blocked.length > 0) {
      setWasTried(true);

      return;
    }

    await onSave();
  }

  return (
    <div
      className="d-flex flex-column flex-fill"
      style={{
        minHeight: 0,
      }}
    >
      <StepHead
        whose={SCHEDULE_FORM_HEAD_WHOSE}
        name={isNew ? SCHEDULE_FORM_HEAD_NEW : (chosen?.name ?? "")}
        backLabel={SCHEDULE_FORM_BACK_LABEL}
        onBack={onCancel}
      />
      <div
        className="d-flex flex-column flex-fill overflow-auto"
        style={{
          gap: SCHEDULE_FORM_BODY_GAP_PX,
          padding: SCHEDULE_FORM_BODY_PADDING,
          minHeight: 0,
        }}
      >
        <TaskField
          label={SCHEDULE_FORM_TASK_LABEL}
          value={values.task}
          placeholder={SCHEDULE_FORM_UNFILLED_PLACEHOLDER}
          isInvalid={wasTried && !values.task.trim()}
          onChange={(task) =>
            onChange({
              task,
            })
          }
        />
        <AgentField
          label={SCHEDULE_FORM_AGENT_LABEL}
          agents={agents}
          agentId={values.agentId}
          placeholder={SCHEDULE_FORM_UNFILLED_PLACEHOLDER}
          isInvalid={wasTried && values.agentId === null}
          onChange={(agentId) =>
            onChange({
              agentId,
            })
          }
        />
        <Field
          label={SCHEDULE_FORM_INTERVAL_LABEL}
          value={values.everyMinutes}
          placeholder={SCHEDULE_FORM_UNFILLED_PLACEHOLDER}
          note={isIntervalWrong ? SCHEDULE_FORM_INTERVAL_WRONG_NOTE : undefined}
          unit={SCHEDULE_FORM_INTERVAL_UNIT}
          type="number"
          step={1}
          isMono
          isInvalid={isIntervalWrong || (wasTried && writtenMinutes(values.everyMinutes) === null)}
          onChange={(everyMinutes) =>
            onChange({
              everyMinutes,
            })
          }
        />
        <SettingRow label={SCHEDULE_FORM_SWITCH_LABEL}>
          <Toggle
            label={SCHEDULE_FORM_SWITCH_LABEL}
            isOn={values.isActive}
            onChange={(isActive) =>
              onChange({
                isActive,
              })
            }
          />
        </SettingRow>
      </div>
      <div
        className="d-flex flex-shrink-0"
        style={{
          padding: SCHEDULE_FORM_FOOT_PADDING_PX,
          gap: SCHEDULE_FORM_FOOT_GAP_PX,
          borderTop: `1px solid ${SCHEDULE_FORM_FOOT_BORDER_COLOR}`,
        }}
      >
        {isNew && <ActionButton variant="cancel" label={SCHEDULE_FORM_CANCEL_LABEL} onClick={onCancel} />}
        {!isNew && isDirty && <ActionButton variant="cancel" label={SCHEDULE_FORM_CANCEL_LABEL} onClick={onRevert} />}
        {!isNew && !isDirty && <ActionButton variant="delete" label={SCHEDULE_FORM_DELETE_LABEL} onClick={onDelete} />}
        <ActionButton
          variant="save"
          label={isNew ? SCHEDULE_FORM_CREATE_LABEL : SCHEDULE_FORM_SAVE_LABEL}
          onClick={() => void save()}
        />
      </div>
    </div>
  );
}
