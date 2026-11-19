import { WIDGET_CHIP_CHEVRON_BOX_PX, WIDGET_FORGET_SIZE_PX, WIDGET_LIST_QUIET_COLOR } from "../../constants";
import type { WidgetCrossProps } from "../../interfaces";

/** The quiet cross beside a row of a list: takes that row's thing away. */
export function WidgetCross({ label, onPress }: WidgetCrossProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onPress}
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
  );
}
