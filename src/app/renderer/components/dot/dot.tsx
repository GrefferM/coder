import type { DotProps } from "./interfaces";

/** A colored dot beside a name: a state, an agent, or an answering provider. */
export function Dot({ color, size, glow, border, className, label }: DotProps) {
  return (
    <span
      className={className}
      role={label === undefined ? undefined : "img"}
      aria-label={label}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        border,
        boxShadow: glow === undefined ? undefined : `0 0 ${glow}px ${color}`,
      }}
    />
  );
}
