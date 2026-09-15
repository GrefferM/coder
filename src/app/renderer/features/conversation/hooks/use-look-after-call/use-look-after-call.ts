import { useEffect, useRef } from "react";
import { useCallsEnded } from "../use-live-answer";

/**
 * A call ended on a server, so that server is asked again — otherwise the catalogue would keep what it learnt
 * when the project first named it. Only calls that ended since this screen stood are asked about.
 */
export function useLookAfterCall(look: (serverId: string) => void): void {
  const ended = useCallsEnded();
  // What was already asked about, by server id; a piece of the same call arriving twice does not ask twice.
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
