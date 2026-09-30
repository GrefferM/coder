import { Mark, TextAction } from "../../../../../../components";
import { usePressable } from "../../../../../../hooks";
import {
  INTERACTION_HOVER_BACKGROUND_COLOR,
  INTERACTION_HOVER_BORDER_COLOR,
  INTERACTION_HOVER_TEXT_COLOR,
  INTERACTION_TRANSITION,
} from "../../../../../../constants";
import { parametersCountLabel } from "../../../../words";
import { CommandsIcon } from "../../../commands-icon";
import {
  COMMAND_ROW_ACTIONS_GAP_PX,
  COMMAND_ROW_BACKGROUND_COLOR,
  COMMAND_ROW_BORDER_COLOR,
  COMMAND_ROW_BORDER_RADIUS_PX,
  COMMAND_ROW_CHEVRON_COLOR,
  COMMAND_ROW_CHEVRON_SIZE_PX,
  COMMAND_ROW_DELETE_LABEL,
  COMMAND_ROW_DESCRIPTION_COLOR,
  COMMAND_ROW_DESCRIPTION_FONT_SIZE_PX,
  COMMAND_ROW_EDIT_LABEL,
  COMMAND_ROW_GAP_PX,
  COMMAND_ROW_ICON_COLOR,
  COMMAND_ROW_META_COLOR,
  COMMAND_ROW_META_LETTER_SPACING_PX,
  COMMAND_ROW_META_SEPARATOR,
  COMMAND_ROW_NAME_COLOR,
  COMMAND_ROW_NAME_FONT_SIZE_PX,
  COMMAND_ROW_OPEN_GAP_PX,
  COMMAND_ROW_OPEN_NAME_COLOR,
  COMMAND_ROW_PADDING,
  COMMAND_ROW_RUN_COLOR,
  COMMAND_ROW_RUN_FONT_SIZE_PX,
  COMMAND_ROW_TEXT_GAP_PX,
} from "./constants";
import type { CommandRowProps } from "./interfaces";
import { focusRing } from "../../../../../../utils/focus";

/** One declared command: closed, its name and takes-facts; open, what the model reads and what runs. */
export function CommandRow({ command, isOpen, onOpen, onEdit, onDelete }: CommandRowProps) {
  const { isPointedAt, isFocused, handlers } = usePressable(onOpen);
  const isLit = isPointedAt || isFocused || isOpen;
  const facts = [command.parameters.length === 0 ? null : parametersCountLabel(command.parameters.length)].filter(
    (fact) => fact !== null,
  );

  return (
    <div
      {...handlers}
      aria-expanded={isOpen}
      className="d-flex flex-column"
      style={{
        padding: COMMAND_ROW_PADDING,
        borderRadius: COMMAND_ROW_BORDER_RADIUS_PX,
        border: `1px solid ${isLit ? INTERACTION_HOVER_BORDER_COLOR : COMMAND_ROW_BORDER_COLOR}`,
        background: isLit ? INTERACTION_HOVER_BACKGROUND_COLOR : COMMAND_ROW_BACKGROUND_COLOR,
        outline: "none",
        boxShadow: focusRing(isFocused),
        transition: INTERACTION_TRANSITION,
        cursor: "pointer",
      }}
    >
      <div
        className="d-flex align-items-center"
        style={{
          gap: COMMAND_ROW_GAP_PX,
        }}
      >
        <span
          className="d-flex flex-shrink-0"
          style={{
            color: COMMAND_ROW_ICON_COLOR,
          }}
        >
          <CommandsIcon />
        </span>
        <span
          className="d-flex flex-column flex-fill"
          style={{
            gap: COMMAND_ROW_TEXT_GAP_PX,
            minWidth: 0,
          }}
        >
          <span
            className="font-monospace text-truncate"
            style={{
              color: isLit ? COMMAND_ROW_OPEN_NAME_COLOR : COMMAND_ROW_NAME_COLOR,
              fontSize: COMMAND_ROW_NAME_FONT_SIZE_PX,
            }}
          >
            {command.name}
          </span>
          {facts.length > 0 && (
            <Mark color={COMMAND_ROW_META_COLOR} spacing={COMMAND_ROW_META_LETTER_SPACING_PX} className="text-truncate">
              {facts.join(COMMAND_ROW_META_SEPARATOR)}
            </Mark>
          )}
        </span>
        <svg
          width={COMMAND_ROW_CHEVRON_SIZE_PX}
          height={COMMAND_ROW_CHEVRON_SIZE_PX}
          viewBox="0 0 24 24"
          fill="none"
          stroke={isLit ? INTERACTION_HOVER_TEXT_COLOR : COMMAND_ROW_CHEVRON_COLOR}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            flexShrink: 0,
            transform: isOpen ? "rotate(180deg)" : "none",
            transition: INTERACTION_TRANSITION,
          }}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>

      {isOpen && (
        <div
          className="d-flex flex-column"
          style={{
            gap: COMMAND_ROW_TEXT_GAP_PX,
            paddingTop: COMMAND_ROW_OPEN_GAP_PX,
          }}
        >
          <span
            style={{
              color: COMMAND_ROW_DESCRIPTION_COLOR,
              fontSize: COMMAND_ROW_DESCRIPTION_FONT_SIZE_PX,
            }}
          >
            {command.description}
          </span>
          <span
            className="font-monospace text-truncate"
            style={{
              color: COMMAND_ROW_RUN_COLOR,
              fontSize: COMMAND_ROW_RUN_FONT_SIZE_PX,
            }}
          >
            {command.run}
          </span>
          <div
            className="d-flex"
            style={{
              gap: COMMAND_ROW_ACTIONS_GAP_PX,
              paddingTop: COMMAND_ROW_TEXT_GAP_PX,
            }}
          >
            <TextAction label={COMMAND_ROW_DELETE_LABEL} isDanger onClick={onDelete} />
            <TextAction label={COMMAND_ROW_EDIT_LABEL} onClick={onEdit} />
          </div>
        </div>
      )}
    </div>
  );
}
