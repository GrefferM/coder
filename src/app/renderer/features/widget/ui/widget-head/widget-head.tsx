import { useState } from "react";
import { Mark } from "../../../../components";
import { useListDismiss } from "../../hooks";
import { FolderGlyph } from "../folder-glyph";
import { ProjectList } from "../project-list";
import {
  PROJECTS_LABEL,
  PROJECT_MENU_LABEL,
  WIDGET_CHIP_BORDER_RADIUS_PX,
  WIDGET_CHIP_CHEVRON_BOX_PX,
  WIDGET_CHIP_CHEVRON_SIZE_PX,
  WIDGET_CHIP_GAP_PX,
  WIDGET_CHIP_ICON_SIZE_PX,
  WIDGET_CHIP_NAME_COLOR,
  WIDGET_CHIP_NAME_FONT_SIZE_PX,
  WIDGET_CHIP_NAME_FONT_WEIGHT,
  WIDGET_CHIP_NAME_GAP_PX,
  WIDGET_CHIP_PADDING,
  WIDGET_CHIP_PATH_COLOR,
  WIDGET_CHIP_PATH_LETTER_SPACING_PX,
  WIDGET_CHIP_SHADOW,
  WIDGET_BORDER_COLOR,
  WIDGET_GROUND_COLOR,
  WIDGET_HEAD_GAP_PX,
  WIDGET_HEAD_PADDING,
  WIDGET_LIST_QUIET_COLOR,
  WIDGET_MENU_GAP_PX,
  WIDGET_MENU_INSET_PX,
} from "../../constants";
import type { WidgetHeadProps } from "../../interfaces";

/**
 * The widget's head (52a): the project's chip, which opens the list of projects and the quiet acts; a press outside
 * the list closes it.
 */
export function WidgetHead({
  name,
  directory,
  recent,
  onOpenList,
  onOpen,
  onOpenFolder,
  onForget,
  quietActs,
}: WidgetHeadProps) {
  const [isOpen, setIsOpen] = useState(false);
  const box = useListDismiss(isOpen, () => setIsOpen(false));
  /** Every act of the list closes it first. */
  const closing = (act: () => void) => () => {
    setIsOpen(false);
    act();
  };

  return (
    <div
      ref={box}
      className="d-flex align-items-center flex-shrink-0 position-relative"
      style={{
        padding: WIDGET_HEAD_PADDING,
        gap: WIDGET_HEAD_GAP_PX,
      }}
    >
      <button
        type="button"
        aria-label={PROJECT_MENU_LABEL}
        aria-expanded={isOpen}
        onClick={() => {
          if (!isOpen) {
            onOpenList();
          }

          setIsOpen(!isOpen);
        }}
        className="d-flex align-items-center flex-fill text-start"
        style={{
          minWidth: 0,
          padding: WIDGET_CHIP_PADDING,
          gap: WIDGET_CHIP_GAP_PX,
          borderRadius: WIDGET_CHIP_BORDER_RADIUS_PX,
          border: `1px solid ${WIDGET_BORDER_COLOR}`,
          background: WIDGET_GROUND_COLOR,
          boxShadow: WIDGET_CHIP_SHADOW,
          cursor: "pointer",
        }}
      >
        <FolderGlyph sizePx={WIDGET_CHIP_ICON_SIZE_PX} color={WIDGET_LIST_QUIET_COLOR} />
        <span
          className="d-flex flex-column flex-fill"
          style={{
            gap: WIDGET_CHIP_NAME_GAP_PX,
            minWidth: 0,
          }}
        >
          <span
            className="text-truncate"
            style={{
              color: WIDGET_CHIP_NAME_COLOR,
              fontSize: WIDGET_CHIP_NAME_FONT_SIZE_PX,
              fontWeight: WIDGET_CHIP_NAME_FONT_WEIGHT,
            }}
          >
            {name}
          </span>
          <Mark
            color={WIDGET_CHIP_PATH_COLOR}
            spacing={WIDGET_CHIP_PATH_LETTER_SPACING_PX}
            isUpperCase={false}
            className="text-truncate"
          >
            {directory}
          </Mark>
        </span>
        <span
          className="d-flex align-items-center justify-content-center flex-shrink-0"
          style={{
            width: WIDGET_CHIP_CHEVRON_BOX_PX,
            height: WIDGET_CHIP_CHEVRON_BOX_PX,
          }}
        >
          <svg
            width={WIDGET_CHIP_CHEVRON_SIZE_PX}
            height={WIDGET_CHIP_CHEVRON_SIZE_PX}
            viewBox="0 0 24 24"
            fill="none"
            stroke={WIDGET_LIST_QUIET_COLOR}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d={isOpen ? "m18 15-6-6-6 6" : "m6 9 6 6 6-6"} />
          </svg>
        </span>
      </button>
      {isOpen && (
        <div
          className="position-absolute"
          style={{
            top: "100%",
            left: WIDGET_MENU_INSET_PX,
            right: WIDGET_MENU_INSET_PX,
            marginTop: WIDGET_MENU_GAP_PX,
            zIndex: 10,
          }}
        >
          <ProjectList
            label={PROJECTS_LABEL}
            recent={recent}
            directory={directory}
            onOpen={(chosen) => closing(() => onOpen(chosen))()}
            onOpenFolder={closing(onOpenFolder)}
            onForget={onForget}
            quietActs={quietActs.map((act) => ({
              label: act.label,
              onPress: closing(act.onPress),
            }))}
          />
        </div>
      )}
    </div>
  );
}
