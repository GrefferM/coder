import { useCallback, useSyncExternalStore } from "react";
import { standingCalls } from "../../logic";
import { RUN_CALL_RUNNING } from "../../../record";
import { forgotten } from "../../../../utils/records";
import type { LiveAnswer } from "../../interfaces";
import type { CallOut, LiveCall } from "../../../../interfaces";

/** Nothing has arrived for this turn — one object for every such turn, so a card reading it stands still. */
const NOTHING: LiveAnswer = {
  text: "",
  calls: [],
};

/**
 * The words arriving this moment, by turn. They come tens of times a second, so they stand apart from the walk
 * state: only the card of that turn reads them, and the picture of the project is not redrawn by one of them.
 */
let arriving: Record<string, LiveAnswer> = {};
let listening: Record<string, Set<() => void>> = {};

/** Everyone drawing this turn is told; nobody else hears anything. */
function tell(turnId: string): void {
  for (const listener of listening[turnId] ?? []) {
    listener();
  }
}

/** One piece of a turn's answer — the text grows by it, and a call stands for the rest of the turn. */
export function sayPiece(turnId: string, text: string, call: LiveCall | null): void {
  const was = arriving[turnId] ?? NOTHING;
  const calls = call === null ? was.calls : standingCalls(was.calls, call);

  arriving = {
    ...arriving,
    [turnId]: {
      text: `${was.text}${text}`,
      // A call stands for the rest of the turn: it is an event, not a state.
      calls,
    },
  };
  tell(turnId);
  markCallOut(turnId, calls.find((one) => one.state === RUN_CALL_RUNNING) ?? null);

  if (call !== null) {
    markCallEnded(call);
  }
}

/** The turn came back — what it said is a card of its own now, and nothing arrives for it any more. */
export function forgetLive(turnId: string): void {
  markCallOut(turnId, null);

  if (arriving[turnId] === undefined) {
    return;
  }

  arriving = forgotten(arriving, turnId);
  tell(turnId);
}

/**
 * Which function each turn has out this moment, and nothing else. It stands apart from the words because the
 * canvas draws off it: a call is an event a few times a turn, a token sixty times a second.
 */
let callsOut: Record<string, CallOut> = {};
let watching = new Set<() => void>();

function markCallOut(turnId: string, call: LiveCall | null): void {
  const was = callsOut[turnId] ?? null;
  /**
   * A call to a server is said by the **server's** name; a command and an agent have no server and are said by
   * their own. The call carries both, so nothing is looked up here.
   */
  const now =
    call === null
      ? null
      : {
          name: call.serverId === null ? call.name : call.serverName,
          source: call.source,
        };

  // The whole point of this store is that a token never redraws the canvas, so an equal call is no news.
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

/** What is out right now, by turn — a command by its name, a server by the server's. */
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
 * The last call to have ended on each server, by server id — the catalogue reads it and asks that server again.
 * The call's id and not a count: a piece of the same call arriving twice is the same call.
 */
let endedOn: Record<string, string> = {};
let noticing = new Set<() => void>();

function markCallEnded(call: LiveCall): void {
  // A call still out has ended nothing; a command's call ended on no server at all.
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

/** The last call that ended on each server, by server id — what makes the catalogue ask it again. */
export function useCallsEnded(): Record<string, string> {
  const listen = useCallback((listener: () => void) => {
    noticing = new Set(noticing).add(listener);

    return () => {
      noticing.delete(listener);
    };
  }, []);

  return useSyncExternalStore(listen, () => endedOn);
}

/** What one turn has said so far and what it has run, redrawn where it stands and nowhere else. */
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
