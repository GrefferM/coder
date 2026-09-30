import { useEffect, useRef } from "react";
import { useCallsEnded } from "../use-live-answer";

/** A call ended on a server, so the server is asked again; only calls ended since this screen stood count. */
export function useLookAfterCall(look: (serverId: string) => void): void {
  const ended = useCallsEnded();
  // Already asked about, by server id; a piece of the same call arriving twice does not ask twice.
  const asked = useRef(ended);

  useEffect(() => {
    for (const [serverId, callId] of Object.entries(ended)) {
      if (asked.current[serverId] !== callId) {
        asked.current = {
          ...asked.current,
          [serverId]: callId,
        };
        look(serverId);
      }
    }
  }, [ended, look]);
}
