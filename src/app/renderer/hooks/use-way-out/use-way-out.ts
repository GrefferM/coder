import { useState } from "react";
import type { UnsavedWork } from "../../interfaces";
import type { HeldWayOut, WayOut, WayOutAsk } from "./interfaces";

/** The one gate every way out of a panel passes through, «Скасувати» under the fields included. */
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

  /** «Зберегти»: the work is written and the way out taken; a blocked draft is neither written nor left. */
  async function saveAndLeave() {
    if (unsaved === null || unsaved.blocked.length > 0) {
      return;
    }

    const wayOut = held?.run;

    setHeld(null);
    await unsaved.save();
    wayOut?.();
  }

  /** «Не зберігати»: the work goes, and the way out is taken anyway. */
  function discardAndLeave() {
    const wayOut = held?.run;

    setHeld(null);
    unsaved?.discard();
    wayOut?.();
  }

  /** «Лишитись тут»: the way out is dropped and nothing else moves. */
  function stay() {
    setHeld(null);
  }

  return {
    // A way out held while nothing is unsaved has nothing to ask about, so it never stands.
    isHeld: held !== null && unsaved !== null,
    ask: held?.ask ?? "leave",
    unsaved,
    guard,
    saveAndLeave,
    discardAndLeave,
    stay,
  };
}
