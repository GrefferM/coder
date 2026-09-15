import { mixWithTransparent } from "../../../../../../utils/colors";
import { stepPlace } from "../../../../logic";
import { takenFromLabel } from "../../../../words";
import { Dot, Hairline, IconButton, Mark } from "../../../../../../components";
import { SaidBlock, Step, StepCard } from "./components";
import {
  STEP_SHEET_BACKGROUND_COLOR,
  STEP_SHEET_BORDER_MIX_COLOR,
  STEP_SHEET_BORDER_PERCENT,
  STEP_SHEET_BORDER_RADIUS_PX,
  STEP_SHEET_BOTTOM_HEIGHT,
  STEP_SHEET_BOTTOM_SHADOW,
  STEP_SHEET_CLOSE_ICON_SIZE_PX,
  STEP_SHEET_CLOSE_LABEL,
  STEP_SHEET_CLOSE_TONE,
  STEP_SHEET_DOT_GLOW_PX,
  STEP_SHEET_DOT_SIZE_PX,
  STEP_SHEET_FOOT_BACKGROUND_COLOR,
  STEP_SHEET_FOOT_BORDER_COLOR,
  STEP_SHEET_FOOT_COLOR,
  STEP_SHEET_FOOT_FONT_SIZE_PX,
  STEP_SHEET_FOOT_GAP_PX,
  STEP_SHEET_FOOT_LETTER_SPACING_PX,
  STEP_SHEET_FOOT_OF,
  STEP_SHEET_FOOT_PADDING,
  STEP_SHEET_HEAD_BACKGROUND_COLOR,
  STEP_SHEET_HEAD_BORDER_COLOR,
  STEP_SHEET_HEAD_GAP_PX,
  STEP_SHEET_HEAD_PADDING,
  STEP_SHEET_INSET_PX,
  STEP_SHEET_NAME_COLOR,
  STEP_SHEET_NAME_FONT_SIZE_PX,
  STEP_SHEET_NUMBER_FONT_SIZE_PX,
  STEP_SHEET_NUMBER_PREFIX,
  STEP_SHEET_SAID_LABEL,
  STEP_SHEET_WIDTH_PX,
} from "./constants";
import type { CSSProperties } from "react";
import type { StepSheetProps } from "./interfaces";

/**
 * One step of the pass read open — the agent as it stood then, what came into the turn and what it
 * answered, and the way to the steps on either side. It is a sheet over the projection: the field under it neither
 * narrows nor lays itself out again, and where the graph has less than a sheet's width left the sheet lies along the
 * bottom instead, its words keeping the same measure.
 */
export function StepSheet({ step, walk, isBelow, onGo, onClose }: StepSheetProps) {
  const place = stepPlace(walk, step.id);
  const border = `1px solid color-mix(in srgb, ${step.agentColor} ${STEP_SHEET_BORDER_PERCENT}%, ${STEP_SHEET_BORDER_MIX_COLOR})`;
  const standing: CSSProperties = isBelow
    ? {
        left: 0,
        right: 0,
        bottom: 0,
        height: STEP_SHEET_BOTTOM_HEIGHT,
        borderTop: border,
        boxShadow: STEP_SHEET_BOTTOM_SHADOW,
      }
    : {
        right: STEP_SHEET_INSET_PX,
        top: STEP_SHEET_INSET_PX,
        bottom: STEP_SHEET_INSET_PX,
        width: STEP_SHEET_WIDTH_PX,
        border,
        borderRadius: STEP_SHEET_BORDER_RADIUS_PX,
        boxShadow: `0 20px 52px ${mixWithTransparent("#000000", 60)}`,
      };

  return (
    <div
      className="d-flex flex-column"
      style={{
        position: "absolute",
        background: STEP_SHEET_BACKGROUND_COLOR,
        overflow: "hidden",
        boxSizing: "border-box",
        ...standing,
      }}
    >
      <div
        className="d-flex align-items-center flex-shrink-0"
        style={{
          gap: STEP_SHEET_HEAD_GAP_PX,
          padding: STEP_SHEET_HEAD_PADDING,
          background: STEP_SHEET_HEAD_BACKGROUND_COLOR,
          borderBottom: `1px solid ${STEP_SHEET_HEAD_BORDER_COLOR}`,
        }}
      >
        <Dot
          color={step.agentColor}
          size={STEP_SHEET_DOT_SIZE_PX}
          glow={STEP_SHEET_DOT_GLOW_PX}
          className="flex-shrink-0"
        />
        <Mark
          color={step.agentColor}
          size={STEP_SHEET_NUMBER_FONT_SIZE_PX}
          isUpperCase={false}
          className="flex-shrink-0"
        >{`${STEP_SHEET_NUMBER_PREFIX}${place?.number ?? step.place}`}</Mark>
        <span
          className="fw-semibold flex-fill text-truncate"
          style={{
            color: STEP_SHEET_NAME_COLOR,
            fontSize: STEP_SHEET_NAME_FONT_SIZE_PX,
          }}
        >
          {step.agentName}
        </span>
        {/* In the lower sheet the head has room for the card, so it stands there instead of a row of its own. */}
        {isBelow && <StepCard step={step} isBeside />}
        <IconButton label={STEP_SHEET_CLOSE_LABEL} onPress={onClose} tone={STEP_SHEET_CLOSE_TONE}>
          <svg
            width={STEP_SHEET_CLOSE_ICON_SIZE_PX}
            height={STEP_SHEET_CLOSE_ICON_SIZE_PX}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          >
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </IconButton>
      </div>
      {!isBelow && <StepCard step={step} isBeside={false} />}
      <div
        className="d-flex justify-content-center flex-fill"
        style={{
          minHeight: 0,
          overflowY: "auto",
        }}
      >
        {/* The words keep the sheet's own measure, whether the sheet stands beside the graph or below it. */}
        <div
          className="d-flex flex-column"
          style={{
            width: STEP_SHEET_WIDTH_PX,
            maxWidth: "100%",
          }}
        >
          <SaidBlock label={takenFromLabel(step, walk)} text={step.asked} isAnswer={false} />
          <Hairline className="flex-shrink-0" />
          <SaidBlock label={STEP_SHEET_SAID_LABEL} text={step.said} isAnswer />
        </div>
      </div>
      {place !== null && (
        <div
          className="d-flex align-items-center font-monospace flex-shrink-0"
          style={{
            gap: STEP_SHEET_FOOT_GAP_PX,
            padding: STEP_SHEET_FOOT_PADDING,
            borderTop: `1px solid ${STEP_SHEET_FOOT_BORDER_COLOR}`,
            background: STEP_SHEET_FOOT_BACKGROUND_COLOR,
            color: STEP_SHEET_FOOT_COLOR,
            fontSize: STEP_SHEET_FOOT_FONT_SIZE_PX,
            letterSpacing: STEP_SHEET_FOOT_LETTER_SPACING_PX,
          }}
        >
          {place.before !== null && <Step step={place.before} isBack onGo={() => onGo(place.before?.id ?? "")} />}
          <span className="flex-fill text-center">{`${place.number}${STEP_SHEET_FOOT_OF}${place.count}`}</span>
          {place.after !== null && <Step step={place.after} isBack={false} onGo={() => onGo(place.after?.id ?? "")} />}
        </div>
      )}
    </div>
  );
}
