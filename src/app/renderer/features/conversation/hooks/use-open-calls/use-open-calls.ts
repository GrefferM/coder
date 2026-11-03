import { useState } from "react";
import type { OpenCalls } from "./interfaces";

/** A call is one line until opened by hand; held above the rows, as the working card and finished turn share it. */
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
