import { useState } from "react";
import type { OpenCalls } from "./interfaces";

/**
 * A call is one line until the person opens it. Nothing opens by itself — a turn with a dozen calls would unfold
 * into a dozen blocks nobody asked for — and nothing folds by itself either.
 *
 * It lives above the rows because the same call is drawn twice: by the working card while the turn is out, and by
 * the finished turn afterwards. A memory kept inside either component would go out with it.
 */
export function useOpenCalls(): OpenCalls {
  const [opened, setOpened] = useState<Record<string, boolean>>({});

  return {
    isOpen: (callId) => opened[callId] === true,
    toggle: (callId) =>
      setOpened((standing) => ({
        ...standing,
        [callId]: standing[callId] !== true,
      })),
    open: (callId) =>
      setOpened((standing) => ({
        ...standing,
        [callId]: true,
      })),
  };
}
