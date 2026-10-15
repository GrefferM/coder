import { useCallback, useSyncExternalStore } from "react";
import { standingCalls } from "../../logic";
import { RUN_CALL_RUNNING } from "../../../record";
import { forgotten } from "../../../../utils/records";
import type { LiveAnswer } from "../../interfaces";
import type { CallOut, LiveCall } from "../../../../interfaces";

/** Nothing has arrived: one shared object for every such turn, so a card reading it stays still. */
const NOTHING: LiveAnswer = {
  text: "",
  calls: [],
};

/**
 * Words arriving now, by turn. Kept apart from the walk state: tens of updates a second, read only by that turn's card,
 * never redrawing the project.
 */
let arriving: Record<string, LiveAnswer> = {};
let listening: Record<string, Set<() => void>> = {};

function tell(turnId: string): void {
  for (const listener of listening[turnId] ?? []) {
    listener();
  }
}

/** One piece of a turn's answer: the text grows by it and a call stands for the rest of the turn. */
export function sayPiece(turnId: string, text: string, call: LiveCall | null): void {
  const was = arriving[turnId] ?? NOTHING;
  const calls = call === null ? was.calls : standingCalls(was.calls, call);

  arriving = {
    ...arriving,
    [turnId]: {
      text: `${was.text}${text}`,
      calls,
    },
  };
  tell(turnId);
  markCallOut(turnId, calls.find((one) => one.state === RUN_CALL_RUNNING) ?? null);

  if (call !== null) {
    markCallEnded(call);
  }
}

/** The turn came back; its words are a card of their own and nothing arrives for it. */
export function forgetLive(turnId: string): void {
  markCallOut(turnId, null);

  if (arriving[turnId] === undefined) {
    return;
  }

  arriving = forgotten(arriving, turnId);
  tell(turnId);
}

/**
 * The function each turn has out now. Apart from the words because the canvas draws off it: a call is an event a few
 * times a turn, a token sixty times a second.
 */
let callsOut: Record<string, CallOut> = {};
let watching = new Set<() => void>();

function markCallOut(turnId: string, call: LiveCall | null): void {
  const was = callsOut[turnId] ?? null;
  /**
   * A call to a server is named by the server; a command or an agent has no server and is named by its own name. The call
   * carries both.
   */
  const now =
    call === null
      ? null
      : {
          name: call.serverId === null ? call.name : call.serverName,
          source: call.source,
        };

  // A token must never redraw the canvas, so an equal call is no news.
  if (was?.name === now?.name && was?.source === now?.source) {
    return;
  }

  callsOut =
    now === null
      ? forgotten(callsOut, turnId)
      : {
          ...callsOut,
          [turnId]: now,
        };

  for (const listener of watching) {
    listener();
  }
}

/** What is out now, by turn: a command by its name, a server by the server's. */
export function useCallsOut(): Record<string, CallOut> {
  const listen = useCallback((listener: () => void) => {
    watching = new Set(watching).add(listener);

    return () => {
      watching.delete(listener);
    };
  }, []);

  return useSyncExternalStore(listen, () => callsOut);
}

/**
 * The last call ended on each server, by server id; the catalogue reads it and asks that server again. Keyed by the
 * call's id, so a piece of the same call arriving twice counts once.
 */
let endedOn: Record<string, string> = {};
let noticing = new Set<() => void>();

function markCallEnded(call: LiveCall): void {
  // A call still out has ended nothing; a command's call ended on no server.
  if (call.serverId === null || call.state === RUN_CALL_RUNNING || endedOn[call.serverId] === call.id) {
    return;
  }

  endedOn = {
    ...endedOn,
    [call.serverId]: call.id,
  };

  for (const listener of noticing) {
    listener();
  }
}

/** The last call ended on each server, by server id; makes the catalogue ask again. */
export function useCallsEnded(): Record<string, string> {
  const listen = useCallback((listener: () => void) => {
    noticing = new Set(noticing).add(listener);

    return () => {
      noticing.delete(listener);
    };
  }, []);

  return useSyncExternalStore(listen, () => endedOn);
}

/** What one turn has said and run so far, redrawn only where it stands. */
export function useLiveAnswer(turnId: string): LiveAnswer {
  const listen = useCallback(
    (listener: () => void) => {
      listening = {
        ...listening,
        [turnId]: (listening[turnId] ?? new Set()).add(listener),
      };

      return () => {
        listening[turnId]?.delete(listener);
      };
    },
    [turnId],
  );

  return useSyncExternalStore(listen, () => arriving[turnId] ?? NOTHING);
}
