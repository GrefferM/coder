/** The weight on an attachment chip: bytes, then КБ, then МБ, then ГБ — the step and the words it is said in. */
export const ATTACH_WEIGHT_STEP = 1024;
/** Below this many of a unit the weight keeps one place after the point; at or above it, a whole number. */
export const ATTACH_WEIGHT_ONE_PLACE_UNTIL = 10;
export const ATTACH_WEIGHT_BYTE_SUFFIX = " Б";
export const ATTACH_WEIGHT_KILOBYTE_SUFFIX = " КБ";
export const ATTACH_WEIGHT_MEGABYTE_SUFFIX = " МБ";
export const ATTACH_WEIGHT_GIGABYTE_SUFFIX = " ГБ";
