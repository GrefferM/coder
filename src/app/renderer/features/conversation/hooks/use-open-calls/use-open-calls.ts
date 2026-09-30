import { useState } from "react";
import type { OpenCalls } from "./interfaces";

/**
 * A call is one line until the person opens it; nothing opens or folds by itself. Kept above the rows because the
 * working card and the finished turn both draw the same call.
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
