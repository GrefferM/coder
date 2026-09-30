import { type CSSProperties } from "react";

/** A style that also sets Electron's window-drag region, unknown to `CSSProperties`. */
export type DraggableStyle = CSSProperties & { WebkitAppRegion?: "drag" | "no-drag" };
