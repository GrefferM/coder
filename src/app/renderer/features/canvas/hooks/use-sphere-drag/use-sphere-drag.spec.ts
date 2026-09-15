import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useSphereDrag } from "./use-sphere-drag";
import { anAgent } from "../../../../testing";
import type { MouseEvent as ReactMouseEvent } from "react";
import type { Point } from "../../../../utils/math";

const AGENT = anAgent({
  id: "agent-1",
  x: 300,
  y: 200,
});

/** The canvas stands unmoved and unscaled here, so a client point and a content point are the same point. */
function contentPointAt(clientX: number, clientY: number): Point {
  return {
    x: clientX,
    y: clientY,
  };
}

function drag(onMoveAgent: (agentId: string, at: Point) => Promise<void> = vi.fn(async () => undefined)) {
  const onDragStart = vi.fn();
  const onDragEnd = vi.fn();
  const rendered = renderHook(() => useSphereDrag(contentPointAt, onMoveAgent, onDragStart, onDragEnd));

  return {
    ...rendered,
    onMoveAgent,
    onDragStart,
    onDragEnd,
  };
}

/** A press on the sphere itself; the canvas behind must not hear it. */
function press(clientX: number, clientY: number, button = 0) {
  const stopPropagation = vi.fn();

  return {
    event: <ReactMouseEvent>(<unknown>{
      button,
      clientX,
      clientY,
      stopPropagation,
    }),
    stopPropagation,
  };
}

function moveTo(clientX: number, clientY: number) {
  window.dispatchEvent(
    new MouseEvent("mousemove", {
      clientX,
      clientY,
    }),
  );
}

function letGoAt(clientX: number, clientY: number) {
  window.dispatchEvent(
    new MouseEvent("mouseup", {
      clientX,
      clientY,
    }),
  );
}

describe("useSphereDrag", () => {
  it("keeps the press from the canvas behind, which would pan on it", () => {
    const { result } = drag();
    const pressed = press(310, 210);

    act(() => result.current.grabSphere(pressed.event, AGENT));

    expect(pressed.stopPropagation).toHaveBeenCalled();
  });

  it("stays a click while the hand has not really left the sphere", () => {
    // A press that trembles selects the sphere; it does not move it by two pixels.
    const { result, onDragStart, onMoveAgent } = drag();

    act(() => result.current.grabSphere(press(310, 210).event, AGENT));
    act(() => moveTo(312, 211));
    act(() => letGoAt(312, 211));

    expect(result.current.drag).toBeNull();
    expect(onDragStart).not.toHaveBeenCalled();
    expect(onMoveAgent).not.toHaveBeenCalled();
  });

  it("keeps the grip it was taken by, so the sphere does not jump under the pointer", () => {
    // Grabbed by its edge, it stays grabbed by that edge — no snapping of the centre to the hand.
    const { result } = drag();

    // The sphere stands at 300,200 and is taken 10 to the right and 10 below its centre.
    act(() => result.current.grabSphere(press(310, 210).event, AGENT));
    act(() => moveTo(410, 310));

    expect(result.current.drag).toEqual({
      agentId: "agent-1",
      from: {
        x: 300,
        y: 200,
      },
      at: {
        x: 400,
        y: 300,
      },
    });
  });

  it("writes the place it was dropped at, and says the drag is over", () => {
    const { result, onMoveAgent, onDragEnd } = drag();

    act(() => result.current.grabSphere(press(310, 210).event, AGENT));
    act(() => moveTo(410, 310));
    act(() => letGoAt(420, 320));

    expect(onDragEnd).toHaveBeenCalled();
    expect(onMoveAgent).toHaveBeenCalledWith("agent-1", {
      x: 410,
      y: 310,
    });
  });

  it("holds the sphere where it was dropped until the write settles", async () => {
    // Letting go before the file answers would snap the sphere back to its old place and then forward again.
    let settle: () => void = () => undefined;
    const held = vi.fn(
      async () =>
        new Promise<void>((resolve) => {
          settle = () => resolve();
        }),
    );
    const { result } = drag(held);

    act(() => result.current.grabSphere(press(310, 210).event, AGENT));
    act(() => moveTo(410, 310));
    act(() => letGoAt(410, 310));

    expect(result.current.drag?.at).toEqual({
      x: 400,
      y: 300,
    });

    await act(async () => {
      settle();
    });

    expect(result.current.drag).toBeNull();
  });

  it("lets the sphere go back to the project's own word when the write fails", async () => {
    // The write failed, so the file still says where the agent stands — and the canvas draws the file, not the hand.
    const { result } = drag(vi.fn(async () => Promise.reject(new Error("no file"))));

    act(() => result.current.grabSphere(press(310, 210).event, AGENT));
    act(() => moveTo(410, 310));
    act(() => letGoAt(410, 310));

    await waitFor(() => expect(result.current.drag).toBeNull());
  });

  it("does not take a sphere by any button but the left one", () => {
    // The right button opens the menu over the sphere, and must not start a drag under it.
    const { result, onDragStart } = drag();
    const pressed = press(310, 210, 2);

    act(() => result.current.grabSphere(pressed.event, AGENT));
    act(() => moveTo(410, 310));

    expect(result.current.drag).toBeNull();
    expect(onDragStart).not.toHaveBeenCalled();
    expect(pressed.stopPropagation).not.toHaveBeenCalled();
  });

  it("lets go of the window when the press ends, so a later move moves nothing", () => {
    // The write is still out, so the sphere stands where it was dropped — and stays there while the hand wanders.
    const { result } = drag(vi.fn(() => new Promise<void>(() => undefined)));

    act(() => result.current.grabSphere(press(310, 210).event, AGENT));
    act(() => moveTo(410, 310));
    act(() => letGoAt(410, 310));
    act(() => moveTo(700, 700));

    expect(result.current.drag?.at).toEqual({
      x: 400,
      y: 300,
    });
  });
});
