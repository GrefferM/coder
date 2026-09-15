import { useEffect } from "react";

/** Count of steps standing inside the panel; a step replaces the panel's content and holds a draft. */
let steps = 0;

/** Whether a step stands inside the panel at this instant; read inside an event, not rendered. */
export function isStepStanding(): boolean {
  return steps > 0;
}

/** While a step stands, Escape belongs to it and the panel below it does nothing. */
export function useStandingStep(isStanding: boolean): void {
  useEffect(() => {
    if (!isStanding) {
      return;
    }

    steps += 1;

    return () => {
      steps -= 1;
    };
  }, [isStanding]);
}
