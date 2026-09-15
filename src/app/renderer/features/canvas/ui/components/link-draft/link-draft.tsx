import { SPHERE_SIZE_PX } from "../../../../../components/sphere/constants";
import { mixWithTransparent } from "../../../../../utils/colors";
import { linkLine } from "../../../../links";
import {
  LINK_DIRECTION_ARROW,
  LINK_DIRECTION_BACKGROUND_COLOR,
  LINK_DIRECTION_BORDER_COLOR,
  LINK_DIRECTION_BORDER_RADIUS_PX,
  LINK_DIRECTION_COLOR,
  LINK_DIRECTION_FONT_SIZE_PX,
  LINK_DIRECTION_LETTER_SPACING_PX,
  LINK_DIRECTION_OFFSET_Y_PX,
  LINK_DIRECTION_PADDING,
  LINK_DRAFT_AIMED_GLOW_PERCENT,
  LINK_DRAFT_AIMED_GLOW_WIDTH,
  LINK_DRAFT_AIMED_WIDTH,
  LINK_DRAFT_CANCELLED_COLOR,
  LINK_DRAFT_CANCELLED_CROSS_ARM_PX,
  LINK_DRAFT_CANCELLED_CROSS_COLOR,
  LINK_DRAFT_CANCELLED_DASH,
  LINK_DRAFT_CANCELLED_END_COLOR,
  LINK_DRAFT_CANCELLED_END_RADIUS,
  LINK_DRAFT_CANCELLED_LABEL,
  LINK_DRAFT_CANCELLED_LABEL_COLOR,
  LINK_DRAFT_CANCELLED_MS,
  LINK_DRAFT_CANCELLED_OPACITY,
  LINK_DRAFT_CANCELLED_WIDTH,
  LINK_DRAFT_DASH,
  LINK_DRAFT_END_FILL,
  LINK_DRAFT_END_RADIUS,
  LINK_DRAFT_GLOW_PERCENT,
  LINK_DRAFT_GLOW_WIDTH,
  LINK_DRAFT_HINT,
  LINK_DRAFT_HINT_BACKGROUND_COLOR,
  LINK_DRAFT_HINT_BORDER_COLOR,
  LINK_DRAFT_HINT_BORDER_RADIUS_PX,
  LINK_DRAFT_HINT_COLOR,
  LINK_DRAFT_HINT_OFFSET_PX,
  LINK_DRAFT_HINT_PADDING,
  LINK_DRAFT_WIDTH,
  LINK_TARGET_RING_BACKGROUND,
  LINK_TARGET_RING_COLOR,
  LINK_TARGET_RING_SIZE_PX,
} from "../../../constants";
import { CANVAS_PILL_FONT_SIZE_PX } from "../canvas-pill/constants";
import type { LinkDraftProps } from "./interfaces";

const SPHERE_RADIUS_PX = SPHERE_SIZE_PX / 2;

/** Dashed with a ring over empty canvas, solid and arrowed over a sphere; cancelled: neutral, crossed, fades. */
export function LinkDraft({ from, at, target, isCancelled = false }: LinkDraftProps) {
  const line = linkLine(from, target ?? at, SPHERE_RADIUS_PX);
  // Aimed at a sphere the line stops at the arrow's base; over empty canvas it ends in the ring.
  const end = target ? line.stem : at;

  if (isCancelled) {
    return (
      <>
        <svg
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            overflow: "visible",
            pointerEvents: "none",
            animation: `draft-cancel ${LINK_DRAFT_CANCELLED_MS}ms linear forwards`,
          }}
        >
          <line
            x1={line.x1}
            y1={line.y1}
            x2={at.x}
            y2={at.y}
            stroke={LINK_DRAFT_CANCELLED_COLOR}
            strokeWidth={LINK_DRAFT_CANCELLED_WIDTH}
            strokeDasharray={LINK_DRAFT_CANCELLED_DASH}
            strokeLinecap="round"
            opacity={LINK_DRAFT_CANCELLED_OPACITY}
          />
          <circle
            cx={at.x}
            cy={at.y}
            r={LINK_DRAFT_CANCELLED_END_RADIUS}
            fill={LINK_DRAFT_END_FILL}
            stroke={LINK_DRAFT_CANCELLED_END_COLOR}
            strokeWidth={LINK_DRAFT_CANCELLED_WIDTH}
          />
          <path
            d={`M${at.x - LINK_DRAFT_CANCELLED_CROSS_ARM_PX} ${at.y - LINK_DRAFT_CANCELLED_CROSS_ARM_PX} ${at.x + LINK_DRAFT_CANCELLED_CROSS_ARM_PX} ${at.y + LINK_DRAFT_CANCELLED_CROSS_ARM_PX}M${at.x + LINK_DRAFT_CANCELLED_CROSS_ARM_PX} ${at.y - LINK_DRAFT_CANCELLED_CROSS_ARM_PX} ${at.x - LINK_DRAFT_CANCELLED_CROSS_ARM_PX} ${at.y + LINK_DRAFT_CANCELLED_CROSS_ARM_PX}`}
            stroke={LINK_DRAFT_CANCELLED_CROSS_COLOR}
            strokeWidth={LINK_DRAFT_CANCELLED_WIDTH}
            strokeLinecap="round"
          />
        </svg>
        <span
          className="font-monospace text-uppercase text-nowrap"
          style={{
            position: "absolute",
            left: at.x + LINK_DRAFT_HINT_OFFSET_PX,
            top: at.y + LINK_DRAFT_HINT_OFFSET_PX,
            padding: LINK_DRAFT_HINT_PADDING,
            borderRadius: LINK_DRAFT_HINT_BORDER_RADIUS_PX,
            border: `1px solid ${LINK_DRAFT_HINT_BORDER_COLOR}`,
            background: LINK_DRAFT_HINT_BACKGROUND_COLOR,
            color: LINK_DRAFT_CANCELLED_LABEL_COLOR,
            fontSize: CANVAS_PILL_FONT_SIZE_PX,
            letterSpacing: LINK_DIRECTION_LETTER_SPACING_PX,
            pointerEvents: "none",
            animation: `draft-cancel ${LINK_DRAFT_CANCELLED_MS}ms linear forwards`,
          }}
        >
          {LINK_DRAFT_CANCELLED_LABEL}
        </span>
      </>
    );
  }

  return (
    <>
      {target && (
        <span
          style={{
            position: "absolute",
            left: target.x,
            top: target.y,
            transform: "translate(-50%, -50%)",
            width: LINK_TARGET_RING_SIZE_PX,
            height: LINK_TARGET_RING_SIZE_PX,
            borderRadius: "50%",
            border: `1px solid ${LINK_TARGET_RING_COLOR}`,
            background: LINK_TARGET_RING_BACKGROUND,
            pointerEvents: "none",
          }}
        />
      )}
      <svg
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          overflow: "visible",
          pointerEvents: "none",
        }}
      >
        <line
          x1={line.x1}
          y1={line.y1}
          x2={end.x}
          y2={end.y}
          stroke={mixWithTransparent(from.color, target ? LINK_DRAFT_AIMED_GLOW_PERCENT : LINK_DRAFT_GLOW_PERCENT)}
          strokeWidth={target ? LINK_DRAFT_AIMED_GLOW_WIDTH : LINK_DRAFT_GLOW_WIDTH}
          strokeLinecap="round"
        />
        <line
          x1={line.x1}
          y1={line.y1}
          x2={end.x}
          y2={end.y}
          stroke={from.color}
          strokeWidth={target ? LINK_DRAFT_AIMED_WIDTH : LINK_DRAFT_WIDTH}
          strokeDasharray={target ? undefined : LINK_DRAFT_DASH}
          strokeLinecap="round"
        />
        {target ? (
          <polygon points={line.arrow} fill={from.color} />
        ) : (
          <circle
            cx={at.x}
            cy={at.y}
            r={LINK_DRAFT_END_RADIUS}
            fill={LINK_DRAFT_END_FILL}
            stroke={from.color}
            strokeWidth={LINK_DRAFT_WIDTH}
          />
        )}
      </svg>
      {target ? (
        <span
          className="d-flex align-items-center font-monospace text-uppercase text-nowrap"
          style={{
            position: "absolute",
            left: line.middle.x,
            top: line.middle.y - LINK_DIRECTION_OFFSET_Y_PX,
            transform: "translate(-50%, -100%)",
            padding: LINK_DIRECTION_PADDING,
            borderRadius: LINK_DIRECTION_BORDER_RADIUS_PX,
            border: `1px solid ${LINK_DIRECTION_BORDER_COLOR}`,
            background: LINK_DIRECTION_BACKGROUND_COLOR,
            color: LINK_DIRECTION_COLOR,
            fontSize: LINK_DIRECTION_FONT_SIZE_PX,
            letterSpacing: LINK_DIRECTION_LETTER_SPACING_PX,
            pointerEvents: "none",
          }}
        >
          {`${from.name}${LINK_DIRECTION_ARROW}${target.name}`}
        </span>
      ) : (
        <span
          className="font-monospace text-uppercase text-nowrap"
          style={{
            position: "absolute",
            left: at.x + LINK_DRAFT_HINT_OFFSET_PX,
            top: at.y + LINK_DRAFT_HINT_OFFSET_PX,
            padding: LINK_DRAFT_HINT_PADDING,
            borderRadius: LINK_DRAFT_HINT_BORDER_RADIUS_PX,
            border: `1px solid ${LINK_DRAFT_HINT_BORDER_COLOR}`,
            background: LINK_DRAFT_HINT_BACKGROUND_COLOR,
            color: LINK_DRAFT_HINT_COLOR,
            fontSize: CANVAS_PILL_FONT_SIZE_PX,
            letterSpacing: LINK_DIRECTION_LETTER_SPACING_PX,
            pointerEvents: "none",
          }}
        >
          {LINK_DRAFT_HINT}
        </span>
      )}
    </>
  );
}
