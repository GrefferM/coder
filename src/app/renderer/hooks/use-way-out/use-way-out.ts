import { useState } from "react";
import type { UnsavedWork } from "../../interfaces";
import type { HeldWayOut, WayOut, WayOutAsk } from "./interfaces";

/** The gate every way out of a panel passes through, «Скасувати» included. */
export function useWayOut(unsaved: UnsavedWork | null): WayOut {
  const [held, setHeld] = useState<HeldWayOut | null>(null);

  /** Lets the way out happen, or holds it until the question is answered. */
  function guard(wayOut: () => void, ask: WayOutAsk = "leave") {
    if (unsaved === null) {
      wayOut();

      return;
    }

    setHeld({
      run: wayOut,
      ask,
    });
  }

  /** «Зберегти»: write the work and take the way out; a blocked draft does neither. */
  async function saveAndLeave() {
    if (unsaved === null || unsaved.blocked.length > 0) {
      return;
    }

    const wayOut = held?.run;

    setHeld(null);
    await unsaved.save();
    wayOut?.();
  }

  /** «Не зберігати»: drop the work and take the way out. */
  function discardAndLeave() {
    const wayOut = held?.run;

    setHeld(null);
    unsaved?.discard();
    wayOut?.();
  }

  /** «Лишитись тут»: drop the way out, nothing else moves. */
  function stay() {
    setHeld(null);
  }

  return {
    // A held way out with nothing unsaved never stands.
    isHeld: held !== null && unsaved !== null,
    ask: held?.ask ?? "leave",
    unsaved,
    guard,
    saveAndLeave,
    discardAndLeave,
    stay,
  };
}
