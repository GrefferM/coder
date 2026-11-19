import { useEffect, useRef } from "react";
import { WIDGET_BORDER_COLOR, WIDGET_BORDER_RADIUS_PX, WIDGET_GROUND_COLOR } from "../../constants";
import type { WidgetFrameProps } from "../../interfaces";

/**
 * The widget's window (52a): its ground and frame. A state that asks no height of its own is as tall as what stands in
 * it, and the window follows; one that does fills the window.
 */
export function WidgetFrame({ children, onMeasure }: WidgetFrameProps) {
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = box.current;

    if (node === null || onMeasure === undefined) {
      return;
    }

    const watch = new ResizeObserver(() => onMeasure(node.offsetHeight));

    watch.observe(node);

    return () => watch.disconnect();
  }, [onMeasure]);

  return (
    <div
      ref={box}
      className={`d-flex flex-column flex-fill overflow-hidden position-relative${onMeasure === undefined ? " vh-100" : " align-self-start"}`}
      style={{
        background: WIDGET_GROUND_COLOR,
        border: `1px solid ${WIDGET_BORDER_COLOR}`,
        borderRadius: WIDGET_BORDER_RADIUS_PX,
      }}
    >
      {children}
    </div>
  );
}
