import {
  BYTES_IN_GIGABYTE,
  BYTES_IN_MEGABYTE,
  GIGABYTE_SUFFIX,
  MEGABYTE_SUFFIX,
  SIZE_PLACES_UNTIL,
} from "../constants";

/** Size label beside an installed model's name. */
export function modelSizeLabel(sizeBytes: number | null): string | null {
  if (sizeBytes === null || sizeBytes <= 0) {
    return null;
  }

  if (sizeBytes < BYTES_IN_GIGABYTE) {
    return `${Math.max(1, Math.round(sizeBytes / BYTES_IN_MEGABYTE))}${MEGABYTE_SUFFIX}`;
  }

  const gigabytes = sizeBytes / BYTES_IN_GIGABYTE;
  const written = gigabytes < SIZE_PLACES_UNTIL ? Math.round(gigabytes * 10) / 10 : Math.round(gigabytes);

  return `${written}${GIGABYTE_SUFFIX}`;
}
