/**
 * A closed rounded-rectangle outline, traced as one SVG path — the line the glow's particles run along.
 *
 * A radius larger than half the box would have the corners cross each other, so it is held to that half:
 * a box asked for more corner than it has side is drawn as the roundest thing that still closes.
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
