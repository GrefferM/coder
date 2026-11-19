import { Mark } from "../../../../components";
import { FolderGlyph } from "../folder-glyph";
import {
  AGENT_COUNT_SUFFIX,
  FORGET_PROJECT_LABEL,
  OPEN_FOLDER_LABEL,
  WIDGET_CHIP_CHEVRON_BOX_PX,
  WIDGET_CHIP_ICON_SIZE_PX,
  WIDGET_FORGET_SIZE_PX,
  WIDGET_CHIP_NAME_COLOR,
  WIDGET_LIST_ACT_GAP_PX,
  WIDGET_LIST_ACT_PADDING,
  WIDGET_LIST_BACKGROUND_COLOR,
  WIDGET_LIST_BORDER_COLOR,
  WIDGET_LIST_BORDER_RADIUS_PX,
  WIDGET_LIST_CHECK_COLOR,
  WIDGET_LIST_CHECK_LEFT_PX,
  WIDGET_LIST_COUNT_COLOR,
  WIDGET_LIST_GONE_COLOR,
  WIDGET_LIST_HEAD_PADDING,
  WIDGET_LIST_MAX_HEIGHT_PX,
  WIDGET_LIST_NAME_FONT_SIZE_PX,
  WIDGET_LIST_PADDING_PX,
  WIDGET_LIST_PATH_COLOR,
  WIDGET_LIST_PATH_FONT_SIZE_PX,
  WIDGET_LIST_QUIET_COLOR,
  WIDGET_LIST_QUIET_FONT_SIZE_PX,
  WIDGET_LIST_ROW_PADDING,
  WIDGET_LIST_ROW_RADIUS_PX,
  WIDGET_LIST_SHADOW,
  WIDGET_RULE_COLOR,
} from "../../constants";
import type { ProjectListProps } from "../../interfaces";

/**
 * The projects this machine has opened, newest first, the widget's ticked, one gone from disk standing dim; then
 * «Відкрити папку», and under a rule the quiet acts (52a, 52b, 30c).
 */
export function ProjectList({ label, recent, directory, onOpen, onOpenFolder, onForget, quietActs }: ProjectListProps) {
  return (
    <div
      className="d-flex flex-column"
      style={{
        padding: WIDGET_LIST_PADDING_PX,
        maxHeight: WIDGET_LIST_MAX_HEIGHT_PX,
        overflowY: "auto",
        borderRadius: WIDGET_LIST_BORDER_RADIUS_PX,
        border: `1px solid ${WIDGET_LIST_BORDER_COLOR}`,
        background: WIDGET_LIST_BACKGROUND_COLOR,
        boxShadow: WIDGET_LIST_SHADOW,
      }}
    >
      {recent.length > 0 && (
        <span
          style={{
            padding: WIDGET_LIST_HEAD_PADDING,
          }}
        >
          <Mark>{label}</Mark>
        </span>
      )}
      {recent.map((entry) => (
        <div key={entry.id} className="d-flex align-items-center">
          <button
            type="button"
            disabled={!entry.exists}
            onClick={() => onOpen(entry.directory)}
            className="d-flex align-items-center flex-fill text-start"
            style={{
              minWidth: 0,
              gap: WIDGET_LIST_ACT_GAP_PX,
              position: "relative",
              padding: WIDGET_LIST_ROW_PADDING,
              border: "none",
              borderRadius: WIDGET_LIST_ROW_RADIUS_PX,
              background: "transparent",
              cursor: entry.exists ? "pointer" : "default",
            }}
          >
            {entry.directory === directory && (
              <span
                className="position-absolute"
                style={{
                  left: WIDGET_LIST_CHECK_LEFT_PX,
                  color: WIDGET_LIST_CHECK_COLOR,
                  fontSize: WIDGET_LIST_NAME_FONT_SIZE_PX,
                }}
              >
                ✓
              </span>
            )}
            <span
              className="d-flex flex-column flex-fill"
              style={{
                minWidth: 0,
              }}
            >
              <span
                className="text-truncate"
                style={{
                  color: entry.exists ? WIDGET_CHIP_NAME_COLOR : WIDGET_LIST_QUIET_COLOR,
                  fontSize: WIDGET_LIST_NAME_FONT_SIZE_PX,
                }}
              >
                {entry.name}
              </span>
              <span
                className="font-monospace text-truncate"
                style={{
                  color: entry.exists ? WIDGET_LIST_PATH_COLOR : WIDGET_LIST_GONE_COLOR,
                  fontSize: WIDGET_LIST_PATH_FONT_SIZE_PX,
                }}
              >
                {entry.directory}
              </span>
            </span>
            {entry.exists && (
              <Mark
                color={WIDGET_LIST_COUNT_COLOR}
                className="flex-shrink-0"
              >{`${entry.agentCount}${AGENT_COUNT_SUFFIX}`}</Mark>
            )}
          </button>
          {entry.directory !== directory && (
            <button
              type="button"
              aria-label={FORGET_PROJECT_LABEL}
              title={FORGET_PROJECT_LABEL}
              onClick={() => onForget(entry.directory)}
              className="d-flex align-items-center justify-content-center flex-shrink-0"
              style={{
                width: WIDGET_CHIP_CHEVRON_BOX_PX,
                height: WIDGET_CHIP_CHEVRON_BOX_PX,
                padding: 0,
                border: "none",
                background: "transparent",
                cursor: "pointer",
              }}
            >
              <svg
                width={WIDGET_FORGET_SIZE_PX}
                height={WIDGET_FORGET_SIZE_PX}
                viewBox="0 0 24 24"
                fill="none"
                stroke={WIDGET_LIST_QUIET_COLOR}
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={onOpenFolder}
        className="d-flex align-items-center text-start"
        style={{
          gap: WIDGET_LIST_ACT_GAP_PX,
          padding: WIDGET_LIST_ACT_PADDING,
          border: "none",
          borderTop: recent.length > 0 ? `1px solid ${WIDGET_RULE_COLOR}` : "none",
          borderRadius: WIDGET_LIST_ROW_RADIUS_PX,
          background: "transparent",
          color: WIDGET_CHIP_NAME_COLOR,
          fontSize: WIDGET_LIST_NAME_FONT_SIZE_PX,
          cursor: "pointer",
        }}
      >
        <FolderGlyph sizePx={WIDGET_CHIP_ICON_SIZE_PX} color={WIDGET_LIST_QUIET_COLOR} />
        {OPEN_FOLDER_LABEL}
      </button>
      {quietActs.length > 0 && (
        <span
          style={{
            borderTop: `1px solid ${WIDGET_RULE_COLOR}`,
          }}
        />
      )}
      {quietActs.map((act) => (
        <button
          key={act.label}
          type="button"
          onClick={act.onPress}
          className="text-start"
          style={{
            padding: WIDGET_LIST_ACT_PADDING,
            border: "none",
            borderRadius: WIDGET_LIST_ROW_RADIUS_PX,
            background: "transparent",
            color: WIDGET_LIST_QUIET_COLOR,
            fontSize: WIDGET_LIST_QUIET_FONT_SIZE_PX,
            cursor: "pointer",
          }}
        >
          {act.label}
        </button>
      ))}
    </div>
  );
}
