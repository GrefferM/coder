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
 * The state of the connection, in one dot and nothing else.
 *
 * A server nobody has yet asked — no token for it, or never raised at all — wears an **empty** dot: it neither
 * fell nor answered, and a colour would claim one of the two. One being raised takes the waiting colour and
 * breathes it. A fallen one is coloured and still. Only one that answered glows.
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
