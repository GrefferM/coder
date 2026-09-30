import { useInteraction } from "../../../../../../hooks";
import { INTERACTION_TRANSITION } from "../../../../../../constants";
import { focusRing, walkRing } from "../../../../../../utils/focus";
import {
  AIM_PICKER_LIST_BACKGROUND_COLOR,
  AIM_PICKER_NAME_COLOR,
  AIM_PICKER_OFF_COLOR,
  AIM_PICKER_ROW_AIMED_BACKGROUND_COLOR,
  AIM_PICKER_ROW_AIMED_COLOR,
  AIM_PICKER_ROW_BORDER_RADIUS_PX,
  AIM_PICKER_ROW_FONT_SIZE_PX,
  AIM_PICKER_ROW_GAP_PX,
  AIM_PICKER_ROW_PADDING,
} from "../../constants";
import type { AimRowProps } from "./interfaces";
import { Dot } from "./components";

/** One agent: a dot in its colour and its name. */
export function AimRow({ agent, isAimed, isWalked, walkedRow, onChoose, onWalk }: AimRowProps) {
  const { isFocused, handlers } = useInteraction();
  const ground = isAimed ? AIM_PICKER_ROW_AIMED_BACKGROUND_COLOR : AIM_PICKER_LIST_BACKGROUND_COLOR;

  return (
    <button
      type="button"
      ref={isWalked ? walkedRow : null}
      onClick={onChoose}
      {...handlers}
      onMouseEnter={() => {
        handlers.onMouseEnter();
        onWalk();
      }}
      className="d-flex align-items-center w-100 text-start"
      style={{
        gap: AIM_PICKER_ROW_GAP_PX,
        padding: AIM_PICKER_ROW_PADDING,
        border: "none",
        borderRadius: AIM_PICKER_ROW_BORDER_RADIUS_PX,
        background: isAimed ? ground : "transparent",
        cursor: "pointer",
        outline: "none",
        boxShadow: isWalked ? walkRing(true) : focusRing(isFocused),
        transition: INTERACTION_TRANSITION,
      }}
    >
      <Dot color={agent.color} isActive={agent.isActive} isAimed={isAimed} ground={ground} />
      <span
        className="flex-fill text-truncate"
        style={{
          color: !agent.isActive ? AIM_PICKER_OFF_COLOR : isAimed ? AIM_PICKER_ROW_AIMED_COLOR : AIM_PICKER_NAME_COLOR,
          fontSize: AIM_PICKER_ROW_FONT_SIZE_PX,
        }}
      >
        {agent.name}
      </span>
    </button>
  );
}
