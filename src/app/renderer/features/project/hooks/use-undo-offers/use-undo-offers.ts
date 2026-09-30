import { useCallback, useEffect, useMemo, useState } from "react";
import { UNDO_STANDS_MS, DELETED_PLACE_MS } from "../../constants";
import { UNDO_TICK_MS } from "./constants";
import { MS_IN_SECOND } from "../../../../utils/dates/constants";
import type { TakenThings, UndoOffer } from "../../interfaces";
import type { UndoOffers } from "./interfaces";
import type { Point } from "../../../../utils/math";

/** An offer as held: the moment it was made, not the seconds left. */
interface StandingOffer {
  id: string;
  deletionId: string | null;
  taken: TakenThings;
  message: string;
  place: Point | null;
  madeAt: number;
}

/** The offer as drawn at a given moment: trace expired, countdown advanced. */
function shown(standing: StandingOffer, at: number): UndoOffer {
  const stoodFor = at - standing.madeAt;

  return {
    id: standing.id,
    deletionId: standing.deletionId,
    taken: standing.taken,
    message: standing.message,
    place: stoodFor >= DELETED_PLACE_MS ? null : standing.place,
    secondsLeft: Math.max(0, Math.ceil((UNDO_STANDS_MS - stoodFor) / MS_IN_SECOND)),
  };
}

/** Every deletion's undo, oldest first; one clock serves trace, countdown and exit. */
export function useUndoOffers(): UndoOffers {
  const [standing, setStanding] = useState<StandingOffer[]>([]);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (standing.length === 0) {
      return;
    }

    const tick = window.setInterval(() => {
      const moment = Date.now();

      setNow(moment);
      setStanding((offers) => {
        const left = offers.filter((offer) => moment - offer.madeAt < UNDO_STANDS_MS);

        return left.length === offers.length ? offers : left;
      });
    }, UNDO_TICK_MS);

    return () => window.clearInterval(tick);
  }, [standing.length]);

  const offers = useMemo(() => standing.map((offer) => shown(offer, now)), [now, standing]);

  const offer = useCallback((made: Omit<StandingOffer, "id" | "madeAt">) => {
    const madeAt = Date.now();

    setNow(madeAt);
    setStanding((standingOffers) => [
      ...standingOffers,
      {
        ...made,
        id: crypto.randomUUID(),
        madeAt,
      },
    ]);
  }, []);

  /** Removes the offer from the stack and returns it so the caller can restore its things. */
  const take = useCallback(
    (id: string): UndoOffer | null => {
      const found = standing.find((held) => held.id === id);

      if (found === undefined) {
        return null;
      }

      setStanding((standingOffers) => standingOffers.filter((held) => held.id !== id));

      return shown(found, Date.now());
    },
    [standing],
  );

  /** The history restored the thing itself, so the offer for that deletion is dropped. */
  const takeOfDeletion = useCallback((deletionId: string) => {
    setStanding((standingOffers) => standingOffers.filter((held) => held.deletionId !== deletionId));
  }, []);

  return {
    offers,
    offer,
    take,
    takeOfDeletion,
  };
}
