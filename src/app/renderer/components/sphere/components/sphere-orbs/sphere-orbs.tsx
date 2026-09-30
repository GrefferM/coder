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
  SPHERE_ORB_CORE_RADIUS,
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
 * The arc of mini-spheres over an agent: what it is armed with, each in its source's colour, plus a «+» of its own kind
 * where more than the arc holds. A miniature wireframe: no label, glow or state dot, a thinner wire.
 *
 * An arc, not a ring, so the label's place and the sideways links stay free. The layer scales with the canvas and does
 * not move for a call.
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
  // The layer is scaled, so a target that keeps its on-screen size grows as the drawing shrinks.
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
        /** A «+» is its kind's shape and colour, dimmed and dashed, as a bare outline without the inner wire. */
        const isFold = orb.more !== null;
        // Where nothing on the arc can be called, every mark goes quiet.
        const tone = isQuiet ? QUIET_MARK_COLOR : orb.color;
        const wire = isFold ? mixWithTransparent(tone, SPHERE_ORB_FOLD_DIM_PERCENT) : tone;
        const dash = isFold ? SPHERE_ORB_FOLD_DASH : undefined;
        /**
         * The shape says where the tool came from; a command's corner scales with its size and is never sharper than the least.
         */
        const corner =
          orb.source === "command"
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
              // The arc dims with its sphere while another is chosen.
              opacity: isDimmed ? SPHERE_DIMMED_OPACITY : undefined,
              background: SPHERE_ORB_FILL,
              // A ring of the mini-sphere's own colour under the cursor.
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
              {/*
               * A command is a rounded square with a prompt; a server a tilted globe; an agent an upright globe with a core.
               */}
              {orb.source === "command" ? (
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
                        transform={orb.source === "mcp" ? SPHERE_ORB_TILT : undefined}
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
                        transform={orb.source === "mcp" ? SPHERE_ORB_TILT : undefined}
                      />
                      {/* The core makes an agent read as a sphere, not another server. */}
                      {orb.source === "agent" && (
                        <circle cx="12" cy="12" r={SPHERE_ORB_CORE_RADIUS} fill={wire} stroke="none" />
                      )}
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
              // The target is separate from the drawing, so it keeps its size as the canvas shrinks; a button for the
              // pointer only, kept out of Tab.
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
                  // The same press chooses the sphere under it; nothing else on the canvas hears it.
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
