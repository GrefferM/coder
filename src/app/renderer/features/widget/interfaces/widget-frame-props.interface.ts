import type { ReactNode } from "react";

export interface WidgetFrameProps {
  children?: ReactNode;
  /** Given, the frame is as tall as what stands in it and says that height; absent, it fills the window. */
  onMeasure?: (height: number) => void;
}
