import { type CSSProperties } from "react";

/** A style object that also sets Electron's window-drag region, which `CSSProperties` doesn't know about. */
export type DraggableStyle = CSSProperties & { WebkitAppRegion?: "drag" | "no-drag" };
