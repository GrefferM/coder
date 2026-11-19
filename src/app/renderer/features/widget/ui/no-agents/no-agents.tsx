import {
  NO_AGENTS_NOTE,
  OPEN_MAIN_LABEL,
  WIDGET_ACCENT_COLOR,
  WIDGET_EMPTY_BUTTON_PADDING,
  WIDGET_EMPTY_BUTTON_RADIUS_PX,
  WIDGET_EMPTY_GAP_PX,
  WIDGET_EMPTY_TEXT_COLOR,
  WIDGET_ON_ACCENT_COLOR,
  WIDGET_OPEN_BUTTON_FONT_WEIGHT,
  WIDGET_OPEN_PADDING_PX,
  WIDGET_STAGE_SPHERE_PX,
  WIDGET_TEXT_FONT_SIZE_PX,
} from "../../constants";
import { WidgetSphere } from "../widget-sphere";
import type { NoAgentsProps } from "../../interfaces";

/** A project with no agents (52c): an empty sphere, the sentence, and the way to the canvas. */
export function NoAgents({ onOpenMain }: NoAgentsProps) {
  return (
    <div
      className="d-flex flex-column align-items-center justify-content-center text-center"
      style={{
        gap: WIDGET_EMPTY_GAP_PX,
        padding: WIDGET_OPEN_PADDING_PX,
      }}
    >
      <WidgetSphere color={WIDGET_EMPTY_TEXT_COLOR} isActive={false} isChosen={false} sizePx={WIDGET_STAGE_SPHERE_PX} />
      <span
        style={{
          color: WIDGET_EMPTY_TEXT_COLOR,
          fontSize: WIDGET_TEXT_FONT_SIZE_PX,
        }}
      >
        {NO_AGENTS_NOTE}
      </span>
      <button
        type="button"
        onClick={onOpenMain}
        style={{
          padding: WIDGET_EMPTY_BUTTON_PADDING,
          border: "none",
          borderRadius: WIDGET_EMPTY_BUTTON_RADIUS_PX,
          background: WIDGET_ACCENT_COLOR,
          color: WIDGET_ON_ACCENT_COLOR,
          fontSize: WIDGET_TEXT_FONT_SIZE_PX,
          fontWeight: WIDGET_OPEN_BUTTON_FONT_WEIGHT,
          cursor: "pointer",
        }}
      >
        {OPEN_MAIN_LABEL}
      </button>
    </div>
  );
}
