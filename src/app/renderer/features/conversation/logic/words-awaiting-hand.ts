import { isOnScreen } from "./is-on-screen";
import { standsWithRepeat } from "./stands-with-repeat";
import type { WalkState, WordsAwaitingHand } from "../interfaces";

/**
 * Words of this session with a repeat under them, split by whether the person is looking at them; the elsewhere part
 * feeds the dot on «ІСТОРІЯ». Runs broken before the app opened live in the record, not here.
 */
export function wordsAwaitingHand(walk: WalkState): WordsAwaitingHand {
  const elsewhere: string[] = [];
  const onScreen: string[] = [];

  for (const [runKey, held] of Object.entries(walk.walks)) {
    const waiting = held.said
      .filter((said) => standsWithRepeat(said) && !walk.saidAgain.includes(said.id))
      .map((said) => said.id);

    (isOnScreen(walk, runKey) ? onScreen : elsewhere).push(...waiting);
  }

  return {
    elsewhere,
    onScreen,
  };
}
