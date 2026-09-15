import {
  SPHERE_AMBIENT_GLOW_PERCENT,
  SPHERE_DIMMED_OPACITY,
  SPHERE_UNLIT_AMBIENT_GLOW_COLOR,
  SPHERE_UNLIT_GLOW_COLOR,
  SPHERE_GLOW_PERCENT,
  SPHERE_INACTIVE_ACCENT_COLOR,
  SPHERE_LABEL_GAP_PX,
  SPHERE_SELECTED_AMBIENT_GLOW_PERCENT,
  SPHERE_SELECTED_GLOW_PERCENT,
  SPHERE_SELECTED_UNLIT_AMBIENT_GLOW_PERCENT,
  SPHERE_SELECTED_UNLIT_GLOW_PERCENT,
  SPHERE_SIZE_PX,
  SPHERE_UNDER_LABEL_GAP_PX,
} from "./constants";
import { useInteraction } from "../../hooks";
import { mixWithTransparent } from "../../utils/colors";
import { SphereLabel, SphereTrail, SphereWire, TroubleMark, TroublePill } from "./components";
import type { SphereProps } from "./interfaces";

/**
 * One agent as a wireframe sphere; Hover rings it and brightens the model line, but not the glow.
 *
 * Three levels of loudness hang under it — the name with its state dot at full brightness, the model
 * dimmer, and the trail dimmer still. A pill is kept for a trigger and for trouble, because those change what the
 * agent does, while a prompt and a key only say what it is.
 *
 * The arc of mini-spheres is **not** here, though it stands over this drawing: it is its own targets,
 * and a button inside a button is not HTML at all. The canvas puts the two side by side — `AgentSphere` — and both
 * count their places from the same box.
 */
export function Sphere({
  name,
  trouble = null,
  modelTitle,
  color,
  isActive,
  stateColor,
  isSelected,
  isAimed = false,
  isDimmed = false,
  markScale = 1,
  isDrawnSmall = false,
  trail = null,
  underLabel = null,
  onSelect,
}: SphereProps) {
  const { isPointedAt, handlers } = useInteraction();
  const accentColor = isActive ? color : SPHERE_INACTIVE_ACCENT_COLOR;
  const glowSourceColor = accentColor;
  const isGlowing = isActive || isSelected;
  const glowPercent = isActive
    ? isSelected
      ? SPHERE_SELECTED_GLOW_PERCENT
      : SPHERE_GLOW_PERCENT
    : SPHERE_SELECTED_UNLIT_GLOW_PERCENT;
  const ambientGlowPercent = isActive
    ? isSelected
      ? SPHERE_SELECTED_AMBIENT_GLOW_PERCENT
      : SPHERE_AMBIENT_GLOW_PERCENT
    : SPHERE_SELECTED_UNLIT_AMBIENT_GLOW_PERCENT;
  const glowColor = isGlowing ? mixWithTransparent(glowSourceColor, glowPercent) : SPHERE_UNLIT_GLOW_COLOR;
  const ambientGlowColor = isGlowing
    ? mixWithTransparent(glowSourceColor, ambientGlowPercent)
    : SPHERE_UNLIT_AMBIENT_GLOW_COLOR;

  return (
    <button
      type="button"
      aria-pressed={isSelected}
      aria-label={name}
      onClick={(event) => {
        // Keep the click from the canvas behind.
        event.stopPropagation();
        onSelect();
      }}
      onMouseEnter={handlers.onMouseEnter}
      onMouseLeave={handlers.onMouseLeave}
      className="d-flex align-items-center justify-content-center"
      style={{
        position: "relative",
        // The box is the wireframe alone; the label hangs outside it.
        width: SPHERE_SIZE_PX,
        height: SPHERE_SIZE_PX,
        border: "none",
        background: "transparent",
        padding: 0,
        outline: "none",
        cursor: "pointer",
        opacity: isDimmed ? SPHERE_DIMMED_OPACITY : undefined,
      }}
    >
      <SphereWire
        accentColor={accentColor}
        glowColor={glowColor}
        ambientGlowColor={ambientGlowColor}
        isBreathing={isAimed && isActive}
        isPointedAt={isPointedAt}
      />
      {trouble !== null && <TroubleMark isBreak={trouble.isBreak} markScale={markScale} />}
      <div
        className="text-nowrap"
        style={{
          // Positioned below the sphere's box without affecting layout.
          position: "absolute",
          top: "100%",
          left: "50%",
          transform: "translateX(-50%)",
          marginTop: SPHERE_LABEL_GAP_PX,
        }}
      >
        <SphereLabel
          name={name}
          subtext={modelTitle}
          accentColor={accentColor}
          isActive={isActive}
          isLit={isPointedAt}
          isDrawnSmall={isDrawnSmall}
          stateColor={stateColor}
        />
        {/* The third line stands under the model and over everything a pill has to say. */}
        {trail !== null && <SphereTrail hasPrompt={trail.hasPrompt} tools={trail.tools} />}
        {trouble !== null && <TroublePill label={trouble.label} isBreak={trouble.isBreak} />}
        {underLabel !== null && (
          <span
            className="d-flex justify-content-center"
            style={{
              marginTop: SPHERE_UNDER_LABEL_GAP_PX,
            }}
          >
            {underLabel}
          </span>
        )}
      </div>
    </button>
  );
}
