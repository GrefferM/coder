/** Whether the event target is an editable field that keeps its own keystrokes. */
export function isTypedIn(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || target.tagName === "INPUT" || target.tagName === "TEXTAREA")
  );
}
