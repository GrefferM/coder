import { useState } from "react";
import { mixWithTransparent } from "../../../../utils/colors";
import { QUIET_MARK_COLOR } from "../../../../constants";
import {
  SPHERE_ORB_ELLIPSE_OPACITY,
  SPHERE_ORB_FOLD_DASH,
  SPHERE_ORB_FOLD_DIM_PERCENT,
  SPHERE_ORB_ELLIPSE_THIN,
  SPHERE_ORB_FILL,
  SPHERE_ORB_MORE_COLOR,
  SPHERE_ORB_MORE_FONT_SIZE_PX,
  SPHERE_ORB_RADIUS,
  SPHERE_ORB_RADIUS_PX,
  SPHERE_ORB_SIZE_PX,
  SPHERE_ORB_COMMAND_MARK,
  SPHERE_ORB_SQUARE_CORNER,
  SPHERE_ORB_SQUARE_CORNER_PART,
  SPHERE_ORB_SQUARE_INSET,
  SPHERE_ORB_SQUARE_LEAST_CORNER_PX,
  SPHERE_ORB_SQUARE_SIDE,
  SPHERE_ORB_SPREAD,
  SPHERE_ORB_SPREAD_EACH,
  SPHERE_ORB_STROKE,
  SPHERE_ORB_RING_PERCENT,
  SPHERE_ORB_RING_PX,
  SPHERE_ORB_TARGET_PX,
  SPHERE_ORB_TILT,
  SPHERE_SIZE_PX,
  SPHERE_DIMMED_OPACITY,
} from "../../constants";
import type { SphereOrb, SphereOrbsProps } from "./interfaces";

/**
 * The arc of mini-spheres over an agent — what it is armed with, in the colour of where
 * each tool came from, and a «+» of its own порода where there is more than the arc holds. The same wireframe in miniature and nothing else: no label, no glow, no green dot of state,
 * and a thinner wire — a circle and two arcs rather than seven by seven. It is a seventh of the sphere, not a small
 * agent.
 *
 * It is an arc and not a ring on purpose: a ring would take the place the label stands in and run into the links,
 * which mostly go sideways. The top arc leaves the bottom to the label and the sides to the links. And the arc sits
 * on the edge of the wireframe rather than reaching between spheres, so it is never read as a link: a link always
 * has an arrow and a gap before the sphere, and this has neither.
 *
 * Nothing here is counted against the canvas's scale. The whole layer scales, so the arc shrinks with the
 * sphere and stands at every zoom — there are no thresholds at which a mini-sphere goes away.
 *
 * Nothing here moves for a call either. The arc says what an agent is armed with and nothing
 * about what it is doing — «працює загальна сфера, і все» — so a call is drawn by the canvas, beside the sphere.
 */
export function SphereOrbs<Orb extends SphereOrb>({
  orbs,
  scale = 1,
  isDimmed = false,
  isQuiet = false,
  onPress,
  onPointTo,
  onPointAway,
}: SphereOrbsProps<Orb>) {
  const [pointedAt, setPointedAt] = useState<number | null>(null);
  // The layer is scaled, so a target that must hold its size on the screen grows as the drawing shrinks.
  const targetPx = SPHERE_ORB_TARGET_PX / scale;
  const spread = Math.min(SPHERE_ORB_SPREAD, SPHERE_ORB_SPREAD_EACH * orbs.length);
  const from = -Math.PI / 2 - spread / 2;
  const middle = SPHERE_SIZE_PX / 2;

  return (
    <>
      {orbs.map((orb, at) => {
        const angle = orbs.length === 1 ? -Math.PI / 2 : from + (spread * at) / (orbs.length - 1);
        // One size and one wire, always — a call moves nothing here.
        const size = SPHERE_ORB_SIZE_PX;
        const stroke = SPHERE_ORB_STROKE;
        /**
         * A «+» is its порода's shape in its порода's colour, dimmed and dashed. It is drawn as the
         * bare outline and nothing else — the wire inside a mark says «a source», and a heap is not one.
         */
        const isFold = orb.more !== null;
        // Where nothing on the arc can be called at all, every mark goes to the quiet tone: the source's own
        // colour would promise a tool that this agent's provider cannot be handed.
        const tone = isQuiet ? QUIET_MARK_COLOR : orb.color;
        const wire = isFold ? mixWithTransparent(tone, SPHERE_ORB_FOLD_DIM_PERCENT) : tone;
        const dash = isFold ? SPHERE_ORB_FOLD_DASH : undefined;
        /**
         * The shape says where the tool came from. A command's corner is a part of its size, so it holds
         * at every zoom, and never sharper than the least — this small, a hard corner reads as a speck.
         */
        const corner = orb.isCommand
          ? `${Math.max(SPHERE_ORB_SQUARE_LEAST_CORNER_PX, Math.round(size * SPHERE_ORB_SQUARE_CORNER_PART))}px`
          : "50%";
        const left = middle + SPHERE_ORB_RADIUS_PX * Math.cos(angle) - size / 2;
        const top = middle + SPHERE_ORB_RADIUS_PX * Math.sin(angle) - size / 2;

        return (
          <div
            key={`${orb.color}-${orb.more ?? ""}-${at}`}
            className="d-flex align-items-center justify-content-center"
            style={{
              position: "absolute",
              left,
              top,
              width: size,
              height: size,
              borderRadius: corner,
              // The sphere it belongs to stands back while another is chosen, and the arc stands back with it.
              opacity: isDimmed ? SPHERE_DIMMED_OPACITY : undefined,
              background: SPHERE_ORB_FILL,
              // Under the cursor a ring of the mini-sphere's own colour. What else the pointer resting
              // here raises is the canvas's own affair — the arc only says where the hand is.
              outline:
                pointedAt === at
                  ? `${SPHERE_ORB_RING_PX}px solid ${mixWithTransparent(tone, SPHERE_ORB_RING_PERCENT)}`
                  : undefined,
              outlineOffset: SPHERE_ORB_RING_PX,
            }}
          >
            <svg
              viewBox="0 0 24 24"
              width="100%"
              height="100%"
              style={{
                position: "absolute",
                inset: 0,
                overflow: "visible",
              }}
              aria-hidden
            >
              {/* A command is a rounded square with a prompt in it; a server is the globe of the arc. */}
              {orb.isCommand ? (
                <>
                  <rect
                    x={SPHERE_ORB_SQUARE_INSET}
                    y={SPHERE_ORB_SQUARE_INSET}
                    width={SPHERE_ORB_SQUARE_SIDE}
                    height={SPHERE_ORB_SQUARE_SIDE}
                    rx={SPHERE_ORB_SQUARE_CORNER}
                    fill="none"
                    stroke={wire}
                    strokeWidth={stroke}
                    strokeDasharray={dash}
                  />
                  {!isFold && (
                    <path
                      d={SPHERE_ORB_COMMAND_MARK}
                      fill="none"
                      stroke={wire}
                      strokeWidth={stroke}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      opacity={SPHERE_ORB_ELLIPSE_OPACITY}
                    />
                  )}
                </>
              ) : (
                <>
                  <circle
                    cx="12"
                    cy="12"
                    r={SPHERE_ORB_RADIUS}
                    fill="none"
                    stroke={wire}
                    strokeWidth={stroke}
                    strokeDasharray={dash}
                  />
                  {!isFold && (
                    <>
                      <ellipse
                        cx="12"
                        cy="12"
                        rx={SPHERE_ORB_RADIUS}
                        ry={SPHERE_ORB_ELLIPSE_THIN}
                        fill="none"
                        stroke={wire}
                        strokeWidth={stroke}
                        opacity={SPHERE_ORB_ELLIPSE_OPACITY}
                        transform={SPHERE_ORB_TILT}
                      />
                      <ellipse
                        cx="12"
                        cy="12"
                        rx={SPHERE_ORB_ELLIPSE_THIN}
                        ry={SPHERE_ORB_RADIUS}
                        fill="none"
                        stroke={wire}
                        strokeWidth={stroke}
                        opacity={SPHERE_ORB_ELLIPSE_OPACITY}
                        transform={SPHERE_ORB_TILT}
                      />
                    </>
                  )}
                </>
              )}
            </svg>
            {orb.more !== null && (
              <span
                className="font-monospace"
                style={{
                  position: "relative",
                  color: SPHERE_ORB_MORE_COLOR,
                  fontSize: SPHERE_ORB_MORE_FONT_SIZE_PX,
                }}
              >
                {orb.more}
              </span>
            )}
            {onPress !== undefined && (
              // The target is its own thing over the drawing — the drawing shrinks with the canvas, the
              // target does not. It is a button for the hand alone: the arc is read by pointing, and a scene of
              // dozens of marks in the way of Tab costs the keyboard more than it ever gave it.
              <button
                type="button"
                aria-label={orb.more ?? orb.color}
                onPointerEnter={(move) => {
                  setPointedAt(at);
                  onPointTo?.(orb, move.currentTarget);
                }}
                onPointerLeave={() => {
                  setPointedAt(null);
                  onPointAway?.();
                }}
                onClick={(press) => {
                  // The sphere under it is chosen by the same press; nothing else on the canvas hears it.
                  press.stopPropagation();
                  onPress(orb, press.currentTarget);
                }}
                style={{
                  position: "absolute",
                  left: (size - targetPx) / 2,
                  top: (size - targetPx) / 2,
                  width: targetPx,
                  height: targetPx,
                  padding: 0,
                  border: "none",
                  background: "transparent",
                  borderRadius: corner,
                  cursor: "pointer",
                }}
              />
            )}
          </div>
        );
      })}
    </>
  );
}
