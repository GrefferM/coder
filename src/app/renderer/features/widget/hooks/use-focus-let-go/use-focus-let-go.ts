import { useEffect } from "react";

/** When the panel hides, a pressed button lets go of the focus, so the panel opens with no ring on it; a field keeps it. */
export function useFocusLetGo() {
  useEffect(() => {
    const letGo = () => {
      const held = document.activeElement;

      if (!(held instanceof HTMLElement) || held instanceof HTMLTextAreaElement || held instanceof HTMLInputElement) {
        return;
      }

      held.blur();
    };

    window.addEventListener("blur", letGo);

    return () => window.removeEventListener("blur", letGo);
  }, []);
}
