import { Chip, IconButton, Mark } from "../../../../../../../../components";
import { useInteraction } from "../../../../../../../../hooks";
import {
  INTERACTION_HOVER_BORDER_COLOR,
  INTERACTION_HOVER_TEXT_COLOR,
  INTERACTION_TRANSITION,
} from "../../../../../../../../constants";
import {
  PARAMETER_ROW_BACKGROUND_COLOR,
  PARAMETER_ROW_BORDER_COLOR,
  PARAMETER_ROW_BORDER_RADIUS_PX,
  PARAMETER_ROW_GAP_PX,
  PARAMETER_ROW_META_COLOR,
  PARAMETER_ROW_META_LETTER_SPACING_PX,
  PARAMETER_ROW_NAME_COLOR,
  PARAMETER_ROW_NAME_FONT_SIZE_PX,
  PARAMETER_ROW_OPEN_LABEL,
  PARAMETER_ROW_OPTIONAL_LABEL,
  PARAMETER_ROW_PADDING,
  PARAMETER_ROW_REMOVE_LABEL,
  PARAMETER_ROW_REMOVE_SIZE_PX,
  PARAMETER_ROW_REQUIRED_LABEL,
  PARAMETER_ROW_TYPE_BACKGROUND_COLOR,
  PARAMETER_ROW_TYPE_COLOR,
  PARAMETER_ROW_UNUSED_BORDER_COLOR,
  PARAMETER_ROW_UNUSED_COLOR,
  PARAMETER_ROW_UNUSED_LABEL,
} from "../../constants";
import type { ParameterRowProps } from "./interfaces";

/** One declared parameter; one the run line never names says so, wears a dashed edge, is not substituted. */
export function ParameterRow({ parameter, isUsed, onOpen, onRemove }: ParameterRowProps) {
  const row = useInteraction();

  return (
    <div
      {...row.handlers}
      className="d-flex align-items-center"
      style={{
        gap: PARAMETER_ROW_GAP_PX,
        padding: PARAMETER_ROW_PADDING,
        borderRadius: PARAMETER_ROW_BORDER_RADIUS_PX,
        border: `1px ${isUsed ? "solid" : "dashed"} ${row.isLit ? INTERACTION_HOVER_BORDER_COLOR : isUsed ? PARAMETER_ROW_BORDER_COLOR : PARAMETER_ROW_UNUSED_BORDER_COLOR}`,
        background: PARAMETER_ROW_BACKGROUND_COLOR,
        transition: INTERACTION_TRANSITION,
      }}
    >
      <button
        type="button"
        aria-label={`${PARAMETER_ROW_OPEN_LABEL} ${parameter.name}`}
        onClick={onOpen}
        className="d-flex align-items-center flex-fill text-start"
        style={{
          padding: 0,
          gap: PARAMETER_ROW_GAP_PX,
          border: "none",
          background: "transparent",
          cursor: "pointer",
          minWidth: 0,
        }}
      >
        <span
          className="font-monospace text-truncate"
          style={{
            color: PARAMETER_ROW_NAME_COLOR,
            fontSize: PARAMETER_ROW_NAME_FONT_SIZE_PX,
          }}
        >
          {parameter.name}
        </span>
        <Chip color={PARAMETER_ROW_TYPE_COLOR} background={PARAMETER_ROW_TYPE_BACKGROUND_COLOR}>
          {parameter.type}
        </Chip>
        <Mark
          color={isUsed ? PARAMETER_ROW_META_COLOR : PARAMETER_ROW_UNUSED_COLOR}
          spacing={PARAMETER_ROW_META_LETTER_SPACING_PX}
          isUpperCase={false}
          className="flex-fill text-truncate"
        >
          {isUsed
            ? parameter.isRequired
              ? PARAMETER_ROW_REQUIRED_LABEL
              : PARAMETER_ROW_OPTIONAL_LABEL
            : PARAMETER_ROW_UNUSED_LABEL}
        </Mark>
      </button>
      <IconButton
        label={`${PARAMETER_ROW_REMOVE_LABEL} ${parameter.name}`}
        onPress={onRemove}
        tone={{
          rest: PARAMETER_ROW_META_COLOR,
          lit: INTERACTION_HOVER_TEXT_COLOR,
        }}
      >
        <svg
          width={PARAMETER_ROW_REMOVE_SIZE_PX}
          height={PARAMETER_ROW_REMOVE_SIZE_PX}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        >
          <path d="M6 6l12 12M18 6 6 18" />
        </svg>
      </IconButton>
    </div>
  );
}
