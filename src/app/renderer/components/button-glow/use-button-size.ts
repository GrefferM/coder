import { useEffect, useState, type RefObject } from "react";
import { type ButtonSize } from "./interfaces";

/** Measures `buttonRef`'s rendered width, height and border-radius, re-measuring on resize. */
export function useButtonSize(buttonRef: RefObject<HTMLElement | null>): ButtonSize | null {
  const [size, setSize] = useState<ButtonSize | null>(null);

  useEffect(() => {
    const buttonElement = buttonRef.current;

    if (!buttonElement) {
      return undefined;
    }

    const measure = () => {
      const rect = buttonElement.getBoundingClientRect();
      const borderRadius = Number.parseFloat(getComputedStyle(buttonElement).borderRadius) || 0;

      setSize({
        width: rect.width,
        height: rect.height,
        borderRadius,
      });
    };

    measure();

    if (typeof ResizeObserver === "undefined") {
      return undefined;
    }

    const resizeObserver = new ResizeObserver(measure);

    resizeObserver.observe(buttonElement);

    return () => resizeObserver.disconnect();
  }, [buttonRef]);

  return size;
}
