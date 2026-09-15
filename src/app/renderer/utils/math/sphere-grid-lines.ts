import { SPHERE_GRID_SEGMENTS_PER_LINE } from "./constants";
import { type GridLine } from "./interfaces";
import { gridLinePath } from "./grid-line-path";
import { meridianPoint, parallelPoint } from "./sphere-point";
import { visibleRuns } from "./visible-runs";

function evenlySpacedAngles(count: number): number[] {
  const angles: number[] = [];
  for (let i = 1; i <= count; i++) {
    angles.push((i * Math.PI) / (count + 1));
  }

  return angles;
}

function boundaryLine(radius: number): GridLine {
  const points = Array.from(
    {
      length: SPHERE_GRID_SEGMENTS_PER_LINE,
    },
    (_, index) => {
      const angle = (index / SPHERE_GRID_SEGMENTS_PER_LINE) * 2 * Math.PI;

      return {
        x: radius * Math.cos(angle),
        y: radius * Math.sin(angle),
        z: 0,
      };
    },
  );

  return {
    path: gridLinePath([...points, points[0]], radius),
  };
}

/** The sphere's wireframe grid: the silhouette circle plus the near-facing arcs of its meridians and parallels. */
export function sphereGridLines(count: number, radius: number, tiltDegrees: number): GridLine[] {
  const tiltRadians = (tiltDegrees * Math.PI) / 180;
  const longitudes = evenlySpacedAngles(count);
  const latitudes = evenlySpacedAngles(count).map((angle) => angle - Math.PI / 2);

  const meridians = longitudes.flatMap((longitude) =>
    visibleRuns((psi) => meridianPoint(longitude, radius, tiltRadians, psi)).map((run) => ({
      path: gridLinePath(run, radius),
    })),
  );

  const parallels = latitudes.flatMap((latitude) =>
    visibleRuns((theta) => parallelPoint(latitude, radius, tiltRadians, theta)).map((run) => ({
      path: gridLinePath(run, radius),
    })),
  );

  return [boundaryLine(radius), ...meridians, ...parallels];
}
