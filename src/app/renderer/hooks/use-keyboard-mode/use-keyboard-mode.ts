import { useSyncExternalStore } from "react";

/** The window-wide keyboard mode the focus ring reads; a navigation key turns it on, a pointer press off. */
let isKeyboard = false;
const listeners = new Set<() => void>();

function set(next: boolean) {
  if (isKeyboard === next) {
    return;
  }

  isKeyboard = next;
  listeners.forEach((listener) => listener());
}

// Only navigation keys count; typing keys and shortcuts do not.
function onKeyDown(event: KeyboardEvent) {
  if (event.key.length === 1 || event.metaKey || event.ctrlKey || event.altKey) {
    return;
  }

  set(true);
}

function onPointerDown() {
  set(false);
}

function listen(onChange: () => void) {
  listeners.add(onChange);

  if (listeners.size === 1) {
    window.addEventListener("keydown", onKeyDown, true);
    window.addEventListener("pointerdown", onPointerDown, true);
  }

  return () => {
    listeners.delete(onChange);

    if (listeners.size === 0) {
      window.removeEventListener("keydown", onKeyDown, true);
      window.removeEventListener("pointerdown", onPointerDown, true);
    }
  };
}

/** Whether keyboard mode is on. */
export function useKeyboardMode(): boolean {
  return useSyncExternalStore(
    listen,
    () => isKeyboard,
    () => false,
  );
}
