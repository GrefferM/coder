import { SphereWire } from "../../../../components";
import {
  SPHERE_AMBIENT_GLOW_PERCENT,
  SPHERE_GLOW_PERCENT,
  SPHERE_INACTIVE_ACCENT_COLOR,
  SPHERE_SELECTED_AMBIENT_GLOW_PERCENT,
  SPHERE_SELECTED_GLOW_PERCENT,
  SPHERE_SIZE_PX,
  SPHERE_UNLIT_AMBIENT_GLOW_COLOR,
  SPHERE_UNLIT_GLOW_COLOR,
} from "../../../../components/sphere/constants";
import { mixWithTransparent } from "../../../../utils/colors";
import type { WidgetSphereProps } from "../../interfaces";

/** An agent's wireframe at any size (52a): the canvas's sphere, scaled; a switched-off one has no light. */
export function WidgetSphere({ color, isActive, isChosen, sizePx }: WidgetSphereProps) {
  const accentColor = isActive ? color : SPHERE_INACTIVE_ACCENT_COLOR;

  return (
    <div
      className="d-flex align-items-center justify-content-center flex-shrink-0"
      style={{
        width: sizePx,
        height: sizePx,
      }}
    >
      <div
        style={{
          transform: `scale(${sizePx / SPHERE_SIZE_PX})`,
        }}
      >
        <SphereWire
          accentColor={accentColor}
          glowColor={
            isActive
              ? mixWithTransparent(color, isChosen ? SPHERE_SELECTED_GLOW_PERCENT : SPHERE_GLOW_PERCENT)
              : SPHERE_UNLIT_GLOW_COLOR
          }
          ambientGlowColor={
            isActive
              ? mixWithTransparent(color, isChosen ? SPHERE_SELECTED_AMBIENT_GLOW_PERCENT : SPHERE_AMBIENT_GLOW_PERCENT)
              : SPHERE_UNLIT_AMBIENT_GLOW_COLOR
          }
          isBreathing={false}
          isPointedAt={false}
        />
      </div>
    </div>
  );
}
