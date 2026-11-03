import { useEffect, useState } from "react";
import { AGENT_CHAT_FOUND_MS } from "../../ui/agent-chat/constants";

/** Lights the found message for a moment, however reached; each arrival restarts it, so two are never lit at once. */
export function useFoundFlash(foundId: string | null): string | null {
  const [lit, setLit] = useState<string | null>(null);

  useEffect(() => {
    setLit(foundId);

    if (foundId === null) {
      return;
    }

    const going = setTimeout(() => setLit(null), AGENT_CHAT_FOUND_MS);

    return () => clearTimeout(going);
  }, [foundId]);

  return lit;
}
