import type { DotProps } from "./interfaces";

/** The dot that carries a colour beside a name — a state, an agent, or a provider that answers. */
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
