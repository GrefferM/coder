import { useEffect, useState } from "react";
import { AGENT_CHAT_FOUND_MS } from "../../ui/agent-chat/constants";

/**
 * The message the search stands on is lit for a moment and then let go, however it was reached. Every new
 * arrival starts the moment over, so two are never lit at once.
 */
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
