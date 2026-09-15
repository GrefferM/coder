/** Background — dot grid over grain, white on dark. */

export const CANVAS_GRID_STEP_PX = 32;

export const CANVAS_GRID_DOT_COLOR = "rgba(255, 255, 255, 0.045)";

export const CANVAS_GRID_MOVING_DOT_COLOR = "rgba(255, 255, 255, 0.07)";

/** Grain: tiled fractal noise; does not move with the view. */
export const CANVAS_GRAIN_IMAGE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")";

export const CANVAS_GRAIN_OPACITY = 0.045;
