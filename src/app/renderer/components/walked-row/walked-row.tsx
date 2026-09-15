import { walkRing } from "../../utils/focus";
import type { WalkedRowProps } from "./interfaces";

/** Where the keyboard stands wears the ring — and the pointer moving over a row takes the walk with it. */
export function WalkedRow({ walk, index, borderRadius, children }: WalkedRowProps) {
  const isWalked = index === walk.walked;

  return (
    <div
      ref={isWalked ? walk.walkedRow : null}
      className="d-flex flex-column"
      onMouseEnter={() => walk.walkTo(index)}
      style={{
        position: "relative",
        borderRadius,
      }}
    >
      {children}
      {/* The ring lies over the row, not under it: a row with a ground of its own would otherwise cover it. */}
      <span
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          borderRadius,
          boxShadow: walkRing(isWalked),
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
