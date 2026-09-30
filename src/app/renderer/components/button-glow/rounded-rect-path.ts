/**
 * A closed rounded-rectangle outline as one SVG path, the line the glow's particles run along; the radius is capped at
 * half the shorter side.
 */
export function roundedRectPath(width: number, height: number, radius: number): string {
  const corner = Math.max(0, Math.min(radius, width / 2, height / 2));

  return (
    `M${corner},0 H${width - corner} ` +
    `A${corner},${corner} 0 0 1 ${width},${corner} ` +
    `V${height - corner} ` +
    `A${corner},${corner} 0 0 1 ${width - corner},${height} ` +
    `H${corner} A${corner},${corner} 0 0 1 0,${height - corner} ` +
    `V${corner} A${corner},${corner} 0 0 1 ${corner},0 Z`
  );
}
