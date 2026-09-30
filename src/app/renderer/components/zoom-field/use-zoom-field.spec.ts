import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useZoomField } from "./use-zoom-field";
import { ZOOM_DEFAULT_SCALE, ZOOM_SCALE_STOPS, ZOOM_UNMOVED } from "./constants";
import type { ZoomPlace } from "./interfaces";
import type { MouseEvent as ReactMouseEvent } from "react";

const BOX = {
  left: 100,
  top: 50,
  width: 800,
  height: 600,
};

/** A canvas of known size and place; every point is counted against its box. */
function boxed() {
  const element = document.createElement("div");

  element.getBoundingClientRect = () =>
    <DOMRect>{
      ...BOX,
      right: BOX.left + BOX.width,
      bottom: BOX.top + BOX.height,
    };

  return {
    current: element,
  };
}

function view(opening: ZoomPlace | null = null) {
  const onDragStart = vi.fn();
  const onDragEnd = vi.fn();
  const rendered = renderHook(() => useZoomField(boxed(), onDragStart, onDragEnd, opening));

  return {
    ...rendered,
    onDragStart,
    onDragEnd,
  };
}

/** A press of the left button on the canvas itself. */
function press(clientX: number, clientY: number, button = 0) {
  return <ReactMouseEvent>(<unknown>{
    button,
    clientX,
    clientY,
  });
}

function moveTo(clientX: number, clientY: number) {
  window.dispatchEvent(
    new MouseEvent("mousemove", {
      clientX,
      clientY,
    }),
  );
}

describe("useZoomField · where the view stands", () => {
  it("opens unmoved and at the ordinary scale when this machine noted nothing", () => {
    const { result } = view();

    expect(result.current.pan).toEqual(ZOOM_UNMOVED);
    expect(result.current.scale).toBe(ZOOM_DEFAULT_SCALE);
  });

  it("opens where the machine left it", () => {
    const { result } = view({
      pan: {
        x: -120,
        y: 40,
      },
      scale: 0.5,
    });

    expect(result.current.pan).toEqual({
      x: -120,
      y: 40,
    });
    expect(result.current.scale).toBe(0.5);
  });

  it("holds a noted scale inside its bounds, however the note came to hold that number", () => {
    // A noted file can be older than the bounds, or hand-edited.
    expect(
      view({
        pan: ZOOM_UNMOVED,
        scale: 40,
      }).result.current.scale,
    ).toBe(ZOOM_SCALE_STOPS.max);
    expect(
      view({
        pan: ZOOM_UNMOVED,
        scale: 0.01,
      }).result.current.scale,
    ).toBe(ZOOM_SCALE_STOPS.min);
  });

  it("counts a pointer against its own box, and again in the coordinates agents are stored in", () => {
    const { result } = view();

    expect(result.current.pointAt(300, 250)).toEqual({
      x: 200,
      y: 200,
    });
    expect(result.current.contentPointAt(300, 250)).toEqual({
      x: 200,
      y: 200,
    });
  });

  it("says where the middle of its box is", () => {
    expect(view().result.current.boxCentre()).toEqual({
      x: 400,
      y: 300,
    });
  });
});

describe("useZoomField · scaling", () => {
  it("holds still whatever is under the pointer while the scale steps", () => {
    // Zooms around the pointer, keeping the pointed-at thing still.
    const { result } = view({
      pan: {
        x: -60,
        y: -20,
      },
      scale: 0.6,
    });
    const under = result.current.contentPointAt(500, 400);

    act(() =>
      result.current.stepAround(-1, {
        x: 400,
        y: 350,
      }),
    );

    const stillUnder = result.current.contentPointAt(500, 400);

    expect(result.current.scale).toBeLessThan(0.6);
    expect(stillUnder.x).toBeCloseTo(under.x, 0);
    expect(stillUnder.y).toBeCloseTo(under.y, 0);
  });

  it("walks the stops and stands at the ceiling and at the floor, never past them", () => {
    const { result } = view();
    const at = {
      x: 400,
      y: 300,
    };

    for (let step = 0; step < 20; step += 1) {
      act(() => result.current.stepAround(-1, at));
    }

    expect(result.current.scale).toBe(ZOOM_SCALE_STOPS.min);

    for (let step = 0; step < 20; step += 1) {
      act(() => result.current.stepAround(1, at));
    }

    expect(result.current.scale).toBe(ZOOM_SCALE_STOPS.max);
  });

  it("leaves an empty project's canvas exactly as it stands", () => {
    // A double click on nothing fits nothing; the view does not jump.
    const { result } = view({
      pan: {
        x: -60,
        y: -20,
      },
      scale: 0.6,
    });

    act(() => result.current.fitAll([]));

    expect(result.current.pan).toEqual({
      x: -60,
      y: -20,
    });
    expect(result.current.scale).toBe(0.6);
  });

  it("brings the whole graph into the box and puts its middle in the middle", () => {
    // A double click fits the graph at the largest stop where it still stands inside, with room around it.
    const { result } = view();
    const points = [
      {
        x: 0,
        y: 0,
      },
      {
        x: 1_000,
        y: 600,
      },
    ];

    act(() => result.current.fitAll(points));

    // The middle of the graph stands in the middle of the box.
    expect(500 * result.current.scale + result.current.pan.x).toBeCloseTo(BOX.width / 2, 0);
    expect(300 * result.current.scale + result.current.pan.y).toBeCloseTo(BOX.height / 2, 0);

    for (const point of points) {
      const onScreen = {
        x: point.x * result.current.scale + result.current.pan.x,
        y: point.y * result.current.scale + result.current.pan.y,
      };

      expect(onScreen.x).toBeGreaterThanOrEqual(0);
      expect(onScreen.y).toBeGreaterThanOrEqual(0);
      expect(onScreen.x).toBeLessThanOrEqual(BOX.width);
      expect(onScreen.y).toBeLessThanOrEqual(BOX.height);
    }
  });

  it("comes no closer than the ceiling, however small the graph is", () => {
    // Two spheres would fit at any scale; the canvas still stops at 100%.
    const { result } = view();

    act(() =>
      result.current.fitAll([
        {
          x: 0,
          y: 0,
        },
        {
          x: 10,
          y: 10,
        },
      ]),
    );

    expect(result.current.scale).toBe(ZOOM_SCALE_STOPS.max);
  });

  it("stands no lower than the floor, however wide the graph is spread", () => {
    // A graph too wide for the floor does not fit; the canvas stays at its floor.
    const { result } = view();

    act(() =>
      result.current.fitAll([
        {
          x: 0,
          y: 0,
        },
        {
          x: 40_000,
          y: 30_000,
        },
      ]),
    );

    expect(result.current.scale).toBe(ZOOM_SCALE_STOPS.min);
  });
});

describe("useZoomField · the hand on empty space", () => {
  it("stays a click while the hand has not really left the place it pressed", () => {
    // Panning begins only past the threshold; a trembling press is still a press.
    const { result, onDragStart } = view();

    act(() => result.current.grabField(press(300, 250)));
    act(() => moveTo(302, 251));

    expect(result.current.pan).toEqual(ZOOM_UNMOVED);
    expect(result.current.isPanning).toBe(false);
    expect(onDragStart).not.toHaveBeenCalled();
  });

  it("pans by exactly what the hand walked, once it has really left", () => {
    const { result, onDragStart, onDragEnd } = view();

    act(() => result.current.grabField(press(300, 250)));
    act(() => moveTo(340, 280));

    expect(result.current.pan).toEqual({
      x: 40,
      y: 30,
    });
    expect(result.current.isPanning).toBe(true);
    expect(onDragStart).toHaveBeenCalled();

    act(() => {
      window.dispatchEvent(new MouseEvent("mouseup"));
    });

    expect(result.current.isPanning).toBe(false);
    expect(onDragEnd).toHaveBeenCalled();
  });

  it("lets go of the window when the press ends, so a later move moves nothing", () => {
    const { result } = view();

    act(() => result.current.grabField(press(300, 250)));
    act(() => moveTo(340, 280));
    act(() => {
      window.dispatchEvent(new MouseEvent("mouseup"));
    });
    act(() => moveTo(600, 600));

    expect(result.current.pan).toEqual({
      x: 40,
      y: 30,
    });
  });

  it("does not take the canvas by any button but the left one", () => {
    // The right button belongs to the menu that places a new agent.
    const { result, onDragStart } = view();

    act(() => result.current.grabField(press(300, 250, 2)));
    act(() => moveTo(400, 400));

    expect(result.current.pan).toEqual(ZOOM_UNMOVED);
    expect(onDragStart).not.toHaveBeenCalled();
  });
});
