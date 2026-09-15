import { useEffect, useState, type RefObject } from "react";

/** How wide the element is right now, re-measured whenever it changes size; `0` until it is on screen. */
export function useBoxWidth(boxRef: RefObject<HTMLElement | null>): number {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const box = boxRef.current;

    if (box === null) {
      return undefined;
    }

    const measure = () => setWidth(box.getBoundingClientRect().width);

    measure();

    if (typeof ResizeObserver === "undefined") {
      return undefined;
    }

    const watching = new ResizeObserver(measure);

    watching.observe(box);

    return () => watching.disconnect();
  }, [boxRef]);

  return width;
}
