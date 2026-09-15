import { type Point3 } from "./interfaces";

/** A point on a meridian of the tilted sphere, projected orthographically. */
export function meridianPoint(
  longitudeRadians: number,
  radius: number,
  tiltRadians: number,
  psiRadians: number,
): Point3 {
  const cosPsi = Math.cos(psiRadians);
  const sinPsi = Math.sin(psiRadians);
  const x = radius * Math.cos(longitudeRadians) * cosPsi;
  const y = radius * (Math.cos(tiltRadians) * sinPsi - Math.sin(longitudeRadians) * Math.sin(tiltRadians) * cosPsi);
  const z = radius * (Math.sin(tiltRadians) * sinPsi + Math.sin(longitudeRadians) * Math.cos(tiltRadians) * cosPsi);

  return {
    x,
    y,
    z,
  };
}

/** A point on a parallel of the tilted sphere, projected orthographically. */
export function parallelPoint(
  latitudeRadians: number,
  radius: number,
  tiltRadians: number,
  thetaRadians: number,
): Point3 {
  const latitudeRadius = radius * Math.cos(latitudeRadians);
  const cosTilt = Math.cos(tiltRadians);
  const sinTilt = Math.sin(tiltRadians);
  const x = latitudeRadius * Math.cos(thetaRadians);
  const y = radius * Math.sin(latitudeRadians) * cosTilt - latitudeRadius * sinTilt * Math.sin(thetaRadians);
  const z = radius * Math.sin(latitudeRadians) * sinTilt + latitudeRadius * cosTilt * Math.sin(thetaRadians);

  return {
    x,
    y,
    z,
  };
}
