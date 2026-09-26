import {
  ATTACH_WEIGHT_BYTE_SUFFIX,
  ATTACH_WEIGHT_GIGABYTE_SUFFIX,
  ATTACH_WEIGHT_KILOBYTE_SUFFIX,
  ATTACH_WEIGHT_MEGABYTE_SUFFIX,
  ATTACH_WEIGHT_ONE_PLACE_UNTIL,
  ATTACH_WEIGHT_STEP,
} from "../constants";

/** A whole number of a unit, or one place after the point where there are few enough of it to want one. */
function written(count: number): string {
  return count < ATTACH_WEIGHT_ONE_PLACE_UNTIL ? String(Math.round(count * 10) / 10) : String(Math.round(count));
}

/** The weight a chip says — «2.1 КБ», «184 КБ», «38 МБ» — climbing a unit at each step and never past ГБ. */
export function attachWeightLabel(bytes: number): string {
  if (bytes < ATTACH_WEIGHT_STEP) {
    return `${Math.max(0, Math.round(bytes))}${ATTACH_WEIGHT_BYTE_SUFFIX}`;
  }

  const kilobytes = bytes / ATTACH_WEIGHT_STEP;

  if (kilobytes < ATTACH_WEIGHT_STEP) {
    return `${written(kilobytes)}${ATTACH_WEIGHT_KILOBYTE_SUFFIX}`;
  }

  const megabytes = kilobytes / ATTACH_WEIGHT_STEP;

  if (megabytes < ATTACH_WEIGHT_STEP) {
    return `${written(megabytes)}${ATTACH_WEIGHT_MEGABYTE_SUFFIX}`;
  }

  return `${written(megabytes / ATTACH_WEIGHT_STEP)}${ATTACH_WEIGHT_GIGABYTE_SUFFIX}`;
}
