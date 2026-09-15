import {
  TEMPLATE_HEADER_BACKGROUND_COLOR,
  TEMPLATE_BORDER_COLOR,
  TEMPLATE_HEADER_TEXT_COLOR,
  TEMPLATE_HEADER_VERTICAL_PADDING_PX,
  TEMPLATE_HEADER_HORIZONTAL_PADDING_PX,
  TEMPLATE_HEADER_FONT_SIZE_PX,
  TEMPLATE_HEADER_GAP_PX,
  TEMPLATE_HEADER_LETTER_SPACING_EM,
  TEMPLATE_BODY_BACKGROUND_COLOR,
  TEMPLATE_BORDER_RADIUS_PX,
  TEMPLATE_COUNT_COLOR,
  TEMPLATE_COUNT_LETTER_SPACING_PX,
} from "./constants";
import { UnsavedMark } from "../../../unsaved-mark";
import { type TemplateProps, type DraggableStyle } from "./interfaces";
import { Mark } from "../../../mark";

/** Rounded card for a `SidePanel` item; the header is an Electron drag region and marks unsaved work. */
export function Template({ label, pill, count, hasUnsaved = false, children }: TemplateProps) {
  const headerStyle: DraggableStyle = {
    background: TEMPLATE_HEADER_BACKGROUND_COLOR,
    padding: `${TEMPLATE_HEADER_VERTICAL_PADDING_PX}px ${TEMPLATE_HEADER_HORIZONTAL_PADDING_PX}px`,
    borderBottom: `1px solid ${TEMPLATE_BORDER_COLOR}`,
    gap: TEMPLATE_HEADER_GAP_PX,
    flexShrink: 0,
    WebkitAppRegion: "drag",
  };
  const pillStyle: DraggableStyle = {
    WebkitAppRegion: "no-drag",
  };

  return (
    <div
      className="d-flex flex-column flex-fill"
      style={{
        minWidth: 0,
        background: TEMPLATE_BODY_BACKGROUND_COLOR,
        borderRadius: TEMPLATE_BORDER_RADIUS_PX,
        overflow: "hidden",
      }}
    >
      <div className="d-flex align-items-center" style={headerStyle}>
        <Mark
          color={TEMPLATE_HEADER_TEXT_COLOR}
          size={TEMPLATE_HEADER_FONT_SIZE_PX}
          spacing={`${TEMPLATE_HEADER_LETTER_SPACING_EM}em`}
        >
          {label}
        </Mark>
        {hasUnsaved && <UnsavedMark />}
        {pill !== undefined && (
          // The header is the window's drag region, which takes every press inside it: what the person is meant to
          // press stands outside it.
          <div className="d-flex align-items-center ms-auto" style={pillStyle}>
            {pill}
          </div>
        )}
        {count !== undefined && (
          <Mark
            color={TEMPLATE_COUNT_COLOR}
            spacing={TEMPLATE_COUNT_LETTER_SPACING_PX}
            isUpperCase={false}
            className="ms-auto"
          >
            {count}
          </Mark>
        )}
      </div>
      <div
        className="flex-fill d-flex flex-column"
        style={{
          minHeight: 0,
        }}
      >
        {children}
      </div>
    </div>
  );
}
