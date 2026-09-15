import { IconButton } from "../../../../../../../../components";
import { PASS_SWITCH_ICON_SIZE_PX, PASS_SWITCH_ICON_STROKE, PASS_SWITCH_TONE } from "../../constants";
import type { ArrowProps } from "./interfaces";

/** One arrow of the switch — lit under the mouse, gone out where the flow ends. */
export function Arrow({ label, path, isDead, onGo }: ArrowProps) {
  return (
    <IconButton label={label} onPress={onGo} tone={PASS_SWITCH_TONE} isDisabled={isDead}>
      <svg
        width={PASS_SWITCH_ICON_SIZE_PX}
        height={PASS_SWITCH_ICON_SIZE_PX}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={PASS_SWITCH_ICON_STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={path} />
      </svg>
    </IconButton>
  );
}
