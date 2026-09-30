import type { WalkPlace } from "../interfaces";
import type { WholeStep } from "../../record";

/** A turn not yet given a lane. */
const LANE_UNSET = -1;
const LANE_TOP = 0;

/**
 * One pass laid flat, a turn to a column. The top row holds turns no line flies over; bypassable turns hang below in
 * their own lane and return up where the paths meet. Lanes are reused.
 */
export function walkPlaces(walk: WholeStep[]): WalkPlace[] {
  const held = [...walk].sort((one, other) => one.place - other.place);
  const turns = new Map(held.map((step, turn) => [step.id, turn]));
  const lines = held.flatMap((step, turn) =>
    step.fromStepIds
      .map((id) => turns.get(id))
      .filter((from): from is number => from !== undefined)
      .map((from) => [from, turn]),
  );
  const lanes = held.map((step, turn) =>
    lines.some(([from, to]) => from < turn && to > turn) ? LANE_UNSET : LANE_TOP,
  );

  hangDown(lanes, lines);
  liftJoins(lanes, lines);

  return held.map((step, turn) => ({
    step,
    number: turn + 1,
    lane: lanes[turn],
  }));
}

/**
 * Hangs bypassable turns below: a lane is held from where the branch leaves the row to where it returns, so
 * non-overlapping branches share one.
 */
function hangDown(lanes: number[], lines: number[][]) {
  const ends: number[] = [];

  lanes.forEach((lane, turn) => {
    if (lane !== LANE_UNSET) {
      return;
    }

    const left = Math.min(turn, ...lines.filter(([, to]) => to === turn).map(([from]) => from));
    const right = Math.max(turn, ...lines.filter(([from]) => from === turn).map(([, to]) => to));
    let free = 0;

    while (ends[free] !== undefined && ends[free] > left) {
      free += 1;
    }

    ends[free] = right;
    lanes[turn] = free + 1;
  });
}

/**
 * Lifts a turn where paths have met back to the top row unless a line would fly over it; two equal branches both stay
 * below.
 */
function liftJoins(lanes: number[], lines: number[][]) {
  const fed = lanes.map((lane, turn) => lines.filter(([, to]) => to === turn).length);
  const travel = (from: number, to: number) => Math.max(lanes[from], lanes[to]);
  const over = (from: number, to: number) =>
    lanes.some((lane, turn) => lane === LANE_TOP && turn > Math.min(from, to) && turn < Math.max(from, to));

  for (let lifted = true; lifted;) {
    lifted = false;

    const wanting = lanes
      .map((lane, turn) => turn)
      .filter((turn) => lanes[turn] > LANE_TOP && fed[turn] > 1)
      .sort((one, other) => fed[other] - fed[one] || one - other);

    for (const turn of wanting) {
      const stood = lanes[turn];

      lanes[turn] = LANE_TOP;

      const hidden =
        lines.some(([from, to]) => from < turn && to > turn && travel(from, to) === LANE_TOP) ||
        lines.some(([from, to]) => (from === turn || to === turn) && travel(from, to) === LANE_TOP && over(from, to));

      if (hidden) {
        lanes[turn] = stood;
        continue;
      }

      lifted = true;
      break;
    }
  }
}
