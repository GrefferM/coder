import { useEffect, useRef, useState } from "react";
import { ATTENTION_PULSE_LEG_MS } from "../../constants";
import type { AttentionPulse } from "./interfaces";

/** Attention pulse: `strike` restarts a running pulse; unmount clears the pending timer. */
export function useAttentionPulse(): AttentionPulse {
  const [isStruck, setIsStruck] = useState(false);
  const held = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (held.current !== null) {
        clearTimeout(held.current);
      }
    },
    [],
  );

  function strike() {
    if (held.current !== null) {
      clearTimeout(held.current);
    }

    setIsStruck(true);
    held.current = setTimeout(() => {
      held.current = null;
      setIsStruck(false);
    }, ATTENTION_PULSE_LEG_MS);
  }

  return {
    isStruck,
    strike,
  };
}
