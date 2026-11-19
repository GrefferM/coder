import { FolderGlyph } from "../folder-glyph";
import { ProjectList } from "../project-list";
import { WidgetSphere } from "../widget-sphere";
import {
  OPEN_PROJECT_LABEL,
  RECENT_LABEL,
  WIDGET_ACCENT_COLOR,
  WIDGET_FAILURE_COLOR,
  WIDGET_MENU_GAP_PX,
  WIDGET_ON_ACCENT_COLOR,
  WIDGET_OPEN_BUTTON_FONT_SIZE_PX,
  WIDGET_OPEN_BUTTON_FONT_WEIGHT,
  WIDGET_OPEN_BUTTON_GAP_PX,
  WIDGET_OPEN_BUTTON_ICON_SIZE_PX,
  WIDGET_OPEN_BUTTON_PADDING,
  WIDGET_OPEN_BUTTON_RADIUS_PX,
  WIDGET_OPEN_GAP_PX,
  WIDGET_OPEN_PADDING_PX,
  WIDGET_STAGE_SPHERE_PX,
  WIDGET_TEXT_FONT_SIZE_PX,
} from "../../constants";
import type { OpenProjectProps } from "../../interfaces";

/** The widget with no project (52b): an empty sphere waiting, and «Відкрити проєкт», which unfolds the recent projects. */
export function OpenProject({ recent, trouble, isListOpen, onToggleList, onOpen, onOpenFolder }: OpenProjectProps) {
  return (
    <div
      className="d-flex flex-column align-items-center widget-drag"
      style={{
        padding: WIDGET_OPEN_PADDING_PX,
        gap: WIDGET_OPEN_GAP_PX,
      }}
    >
      <WidgetSphere color={WIDGET_ACCENT_COLOR} isActive={false} isChosen={false} sizePx={WIDGET_STAGE_SPHERE_PX} />
      <div className="position-relative w-100 widget-no-drag">
        <button
          type="button"
          aria-expanded={isListOpen}
          onClick={onToggleList}
          className="d-flex align-items-center w-100"
          style={{
            padding: WIDGET_OPEN_BUTTON_PADDING,
            gap: WIDGET_OPEN_BUTTON_GAP_PX,
            border: "none",
            borderRadius: WIDGET_OPEN_BUTTON_RADIUS_PX,
            background: WIDGET_ACCENT_COLOR,
            color: WIDGET_ON_ACCENT_COLOR,
            fontSize: WIDGET_OPEN_BUTTON_FONT_SIZE_PX,
            fontWeight: WIDGET_OPEN_BUTTON_FONT_WEIGHT,
            cursor: "pointer",
          }}
        >
          <FolderGlyph sizePx={WIDGET_OPEN_BUTTON_ICON_SIZE_PX} color={WIDGET_ON_ACCENT_COLOR} />
          {OPEN_PROJECT_LABEL}
        </button>
        {trouble !== null && !isListOpen && (
          <p
            className="position-absolute"
            style={{
              top: "100%",
              marginTop: WIDGET_MENU_GAP_PX,
              color: WIDGET_FAILURE_COLOR,
              fontSize: WIDGET_TEXT_FONT_SIZE_PX,
            }}
          >
            {trouble}
          </p>
        )}
        {isListOpen && (
          <div
            className="w-100 widget-no-drag"
            style={{
              marginTop: WIDGET_MENU_GAP_PX,
            }}
          >
            <ProjectList
              label={RECENT_LABEL}
              recent={recent}
              directory={null}
              onOpen={onOpen}
              onOpenFolder={onOpenFolder}
              quietActs={[]}
            />
          </div>
        )}
      </div>
    </div>
  );
}
