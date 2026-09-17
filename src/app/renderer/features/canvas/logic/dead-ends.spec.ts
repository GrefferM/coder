import { describe, expect, it } from "vitest";
import { deadEnds } from "./dead-ends";
import { CANVAS_DEAD_PLACE_AWAY_PX } from "../constants";
import { FREE_PLACE_CLEARANCE_PX } from "../../../utils/math/constants";
import { aLink, anAgent } from "../../../testing";

const EDITOR = anAgent({
  id: "agent-1",
  x: 100,
  y: 100,
});

describe("deadEnds", () => {
  it("gives a place to the end the file names and the project does not have", () => {
    const places = deadEnds(
      [EDITOR],
      [
        aLink({
          from: "agent-1",
          to: "agent-gone",
        }),
      ],
    );

    expect(Object.keys(places)).toEqual(["agent-gone"]);
  });

  it("stands it a clear field away from the agent it hangs from, not merely clear of it", () => {
    const [place] = Object.values(
      deadEnds(
        [EDITOR],
        [
          aLink({
            from: "agent-1",
            to: "agent-gone",
          }),
        ],
      ),
    );

    expect(Math.hypot(place.x - EDITOR.x, place.y - EDITOR.y)).toBeGreaterThanOrEqual(CANVAS_DEAD_PLACE_AWAY_PX);
  });

  it("answers for a line drawn the other way round, since a dead end is an end either way", () => {
    const places = deadEnds(
      [EDITOR],
      [
        aLink({
          from: "agent-gone",
          to: "agent-1",
        }),
      ],
    );

    expect(Object.keys(places)).toEqual(["agent-gone"]);
  });

  it("gives one place to an id two lines name, so it is one sphere and not two", () => {
    const places = deadEnds(
      [
        EDITOR,
        anAgent({
          id: "agent-2",
          x: 400,
          y: 100,
        }),
      ],
      [
        aLink({
          id: "link-1",
          from: "agent-1",
          to: "agent-gone",
        }),
        aLink({
          id: "link-2",
          from: "agent-2",
          to: "agent-gone",
        }),
      ],
    );

    expect(Object.keys(places)).toEqual(["agent-gone"]);
  });

  it("stands two dead ends clear of each other", () => {
    const places = deadEnds(
      [EDITOR],
      [
        aLink({
          id: "link-1",
          from: "agent-1",
          to: "gone-one",
        }),
        aLink({
          id: "link-2",
          from: "agent-1",
          to: "gone-two",
        }),
      ],
    );
    const [one, other] = Object.values(places);

    expect(Math.hypot(one.x - other.x, one.y - other.y)).toBeGreaterThanOrEqual(FREE_PLACE_CLEARANCE_PX);
  });

  it("says nothing about a line with both ends dead: nobody can call it, so it is drawn nowhere", () => {
    expect(
      deadEnds(
        [EDITOR],
        [
          aLink({
            from: "gone-one",
            to: "gone-two",
          }),
        ],
      ),
    ).toEqual({});
  });

  it("says nothing where every line the file holds names agents it has", () => {
    expect(
      deadEnds(
        [
          EDITOR,
          anAgent({
            id: "agent-2",
          }),
        ],
        [aLink({})],
      ),
    ).toEqual({});
  });
});
