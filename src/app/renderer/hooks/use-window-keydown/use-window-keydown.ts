import { useEffect, useRef } from "react";

/** Hears the window's keydown while `isListening`. */
export function useWindowKeydown(isListening: boolean, onKeyDown: (event: KeyboardEvent) => void): void {
  const handler = useRef(onKeyDown);

  useEffect(() => {
    handler.current = onKeyDown;
  }, [onKeyDown]);

  useEffect(() => {
    if (!isListening) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      handler.current(event);
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isListening]);
}
