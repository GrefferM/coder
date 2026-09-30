import {
  SERVER_FELL_COLOR,
  SERVER_STARTING_BREATH_CLASS,
  SERVER_STARTING_BREATH_MS,
  SERVER_STARTING_COLOR,
  SERVER_UP_COLOR,
  SERVER_UP_GLOW,
} from "../../../../../../constants";
import { SERVER_ROW_DOT_SIZE_PX, SERVER_ROW_FACTS_COLOR } from "../../constants";
import type { RowDotProps } from "./interfaces";

/**
 * The connection state as one dot. Empty: never asked (neither fell nor answered). Waiting colour, breathing: being
 * raised. Coloured and still: fallen. Glowing: answered.
 */
export function RowDot({ isAsking, isEmpty, hasFallen, isUp }: RowDotProps) {
  return (
    <span
      aria-hidden
      className={isAsking ? SERVER_STARTING_BREATH_CLASS : undefined}
      style={{
        width: SERVER_ROW_DOT_SIZE_PX,
        height: SERVER_ROW_DOT_SIZE_PX,
        borderRadius: "50%",
        flexShrink: 0,
        background: isEmpty
          ? "transparent"
          : isAsking
            ? SERVER_STARTING_COLOR
            : hasFallen
              ? SERVER_FELL_COLOR
              : isUp
                ? SERVER_UP_COLOR
                : SERVER_ROW_FACTS_COLOR,
        border: isEmpty ? `1px solid ${SERVER_ROW_FACTS_COLOR}` : "none",
        boxShadow: isUp ? SERVER_UP_GLOW : "none",
        animationDuration: isAsking ? `${SERVER_STARTING_BREATH_MS}ms` : undefined,
      }}
    />
  );
}
