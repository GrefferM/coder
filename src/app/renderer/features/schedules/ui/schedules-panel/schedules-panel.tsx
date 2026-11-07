import { CatalogueAction, Words } from "../../../../components";
import { ScheduleForm } from "../schedule-form";
import { SchedulesIcon } from "../schedules-icon";
import { ScheduleRow } from "./components";
import {
  SCHEDULES_PANEL_EMPTY_GAP_PX,
  SCHEDULES_PANEL_EMPTY_ICON_COLOR,
  SCHEDULES_PANEL_EMPTY_ICON_SIZE_PX,
  SCHEDULES_PANEL_EMPTY_ICON_STROKE_WIDTH,
  SCHEDULES_PANEL_EMPTY_LABEL,
  SCHEDULES_PANEL_EMPTY_PADDING_PX,
  SCHEDULES_PANEL_FOOT_BORDER_COLOR,
  SCHEDULES_PANEL_FOOT_PADDING_PX,
  SCHEDULES_PANEL_LIST_GAP_PX,
  SCHEDULES_PANEL_LIST_PADDING,
  SCHEDULES_PANEL_NEW_LABEL,
} from "./constants";
import type { SchedulesPanelProps } from "./interfaces";

/** The project's schedules as they stand on this machine; a row opens its form as a step of the tab. */
export function SchedulesPanel({ schedules, agents, clock, section, onOpenForm, onCancelForm }: SchedulesPanelProps) {
  const { form, openSchedule, openScheduleId } = section;

  if (form !== null) {
    return (
      <ScheduleForm
        values={form}
        schedule={openSchedule}
        agents={agents}
        isOn={openSchedule === null ? section.isNewOn : (clock.standings[openSchedule.id]?.isOn ?? false)}
        isDirty={section.unsaved !== null}
        onChange={section.editForm}
        onSwitch={section.switchOpen}
        onSave={section.saveForm}
        onCancel={onCancelForm}
        onRevert={() => section.openForm(openScheduleId)}
        onDelete={() => section.arm(openSchedule?.id ?? null)}
      />
    );
  }

  if (schedules.length === 0) {
    return (
      <div
        className="d-flex flex-column flex-fill align-items-center justify-content-center text-center"
        style={{
          gap: SCHEDULES_PANEL_EMPTY_GAP_PX,
          padding: SCHEDULES_PANEL_EMPTY_PADDING_PX,
        }}
      >
        <span
          aria-hidden
          className="d-flex"
          style={{
            color: SCHEDULES_PANEL_EMPTY_ICON_COLOR,
          }}
        >
          <SchedulesIcon
            sizePx={SCHEDULES_PANEL_EMPTY_ICON_SIZE_PX}
            strokeWidth={SCHEDULES_PANEL_EMPTY_ICON_STROKE_WIDTH}
          />
        </span>
        <Words isQuiet>{SCHEDULES_PANEL_EMPTY_LABEL}</Words>
        <CatalogueAction label={SCHEDULES_PANEL_NEW_LABEL} isFilled onClick={() => onOpenForm("new")} />
      </div>
    );
  }

  return (
    <div
      className="d-flex flex-column flex-fill"
      style={{
        minHeight: 0,
      }}
    >
      <div
        className="d-flex flex-column flex-fill overflow-auto"
        style={{
          gap: SCHEDULES_PANEL_LIST_GAP_PX,
          padding: SCHEDULES_PANEL_LIST_PADDING,
          minHeight: 0,
        }}
      >
        {schedules.map((schedule) => (
          <ScheduleRow
            key={schedule.id}
            schedule={schedule}
            agents={agents}
            standing={clock.standings[schedule.id] ?? null}
            now={clock.now}
            onOpen={() => onOpenForm(schedule.id)}
          />
        ))}
      </div>
      <div
        className="d-flex flex-shrink-0"
        style={{
          padding: SCHEDULES_PANEL_FOOT_PADDING_PX,
          borderTop: `1px solid ${SCHEDULES_PANEL_FOOT_BORDER_COLOR}`,
        }}
      >
        <CatalogueAction label={SCHEDULES_PANEL_NEW_LABEL} onClick={() => onOpenForm("new")} />
      </div>
    </div>
  );
}
