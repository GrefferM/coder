import { useEffect } from "react";
import { SCROLL_MARK_CLASS, SCROLL_MARK_MS } from "./constants";

/** Marks the box being scrolled, so the scrollbar is drawn only then. */
export function useScrollMark(): void {
  useEffect(() => {
    const fading = new Map<Element, number>();

    function onScroll(event: Event) {
      const box = event.target;

      if (!(box instanceof Element)) {
        return;
      }

      box.classList.add(SCROLL_MARK_CLASS);
      window.clearTimeout(fading.get(box));
      fading.set(
        box,
        window.setTimeout(() => {
          box.classList.remove(SCROLL_MARK_CLASS);
          fading.delete(box);
        }, SCROLL_MARK_MS),
      );
    }

    window.addEventListener("scroll", onScroll, true);

    return () => {
      window.removeEventListener("scroll", onScroll, true);
      fading.forEach((timer, box) => {
        window.clearTimeout(timer);
        box.classList.remove(SCROLL_MARK_CLASS);
      });
    };
  }, []);
}
