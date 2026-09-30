import { fireEvent, render, screen, waitFor, waitForElementToBeRemoved, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Canvas } from "./canvas";
import {
  CANVAS_ADD_AGENT_LABEL,
  CANVAS_ADD_LINK_LABEL,
  LINK_DRAFT_CANCELLED_CROSS_COLOR,
  LINK_DRAFT_CANCELLED_LABEL,
  LINK_DRAFT_HINT,
  CANVAS_LINK_COLOR,
  CANVAS_LINK_DOOMED_COLOR,
  LINK_DIRECTION_OFFSET_Y_PX,
  CANVAS_LINK_DOOMED_DASH,
  CANVAS_LINK_HANDLE_SIZE_PX,
  CANVAS_LINK_SELECTED_PERCENT,
  CANVAS_LINK_SELECTED_WIDTH,
  CANVAS_LINK_DRAGGED_DASH,
  CANVAS_COPY_AGENT_LABEL,
  CANVAS_COPY_AGENT_SHORTCUT,
  CANVAS_DELETE_AGENT_LABEL,
  CANVAS_DELETE_AGENT_SHORTCUT,
  CANVAS_PASTE_AGENT_LABEL,
  CANVAS_EMPTY_TITLE,
  CANVAS_GRID_MOVING_DOT_COLOR,
  CANVAS_GRID_STEP_PX,
} from "../constants";
import { ZOOM_IN_LABEL, ZOOM_OUT_LABEL } from "../../../components/zoom-toolbar/constants";
import { mixWithTransparent } from "../../../utils/colors";
import { linkLine } from "../../links";
import { SPHERE_DIMMED_OPACITY, SPHERE_SIZE_PX } from "../../../components/sphere/constants";
import { DEAD_SPHERE_NOTE_LABEL } from "./components/dead-sphere/constants";
import { LINK_PILL_DELETE_LABEL, LINK_PILL_DELETE_SHORTCUT } from "./components/link-pill/constants";
import type { Agent, Link, ProjectModel } from "../../../interfaces";
import type {
  CanvasAgentActs,
  CanvasLinkActs,
  CanvasLiving,
  CanvasNotes,
  CanvasPicked,
  CanvasPlace,
  CanvasStanding,
  CanvasWriteActs,
} from "../interfaces";
import type { UndoOffer } from "../../project";
import { DELETED_PLACE_SIZE_PX } from "./components/deleted-place/constants";
import { UNDO_ACTION_LABEL } from "./components/undo-line/constants";
import { UNDO_STACK_FOLD_PREFIX } from "./components/undo-stack/constants";
import { aLink, aModel, anAgent } from "../../../testing";
import { ZOOM_MAX_SCALE, ZOOM_MIN_SCALE, ZOOM_SCALE_PERCENT } from "../../../components";

const MODELS: ProjectModel[] = [
  aModel({
    title: "Claude Sonnet 4.5",
    provider: "anthropic",
    contextCeiling: 200000,
  }),
];

const AGENTS: Agent[] = [
  anAgent({
    name: "EDITOR",
    color: "#38a3ff",
    x: 300,
    y: 200,
    maxCalls: 10,
    temperature: 0.3,
  }),
  anAgent({
    id: "agent-2",
    name: "REVIEWER",
    modelId: "model-missing",
    color: "#b18aff",
    isActive: false,
    x: 640,
    y: 420,
    maxCalls: 10,
    temperature: 0.3,
  }),
];
const LINKS: Link[] = [aLink()];

/**
 * Every part of the canvas laid flat, so a case names only what it changes; `canvasWith` puts each act back into its
 * owning part.
 */
interface CanvasSays extends CanvasStanding, CanvasLiving, CanvasPicked, CanvasNotes {
  opening: CanvasPlace | null;
  onViewChange: (place: CanvasPlace) => void;
  onSelectedAgentIdChange: CanvasAgentActs["onSelectedAgentIdChange"];
  onPickAgent: CanvasAgentActs["onPick"];
  onOpenAgentTools: CanvasAgentActs["onOpenTools"];
  onAddAgent: CanvasAgentActs["onAdd"];
  onCopyAgent: CanvasAgentActs["onCopy"];
  onPasteAgent: CanvasAgentActs["onPaste"];
  onPastedDismiss: CanvasAgentActs["onPastedDismiss"];
  onDeleteAgent: CanvasAgentActs["onDelete"];
  onMoveAgent: CanvasAgentActs["onMove"];
  onAddLink: CanvasLinkActs["onAdd"];
  onDeleteLink: CanvasLinkActs["onDelete"];
  onChosenLinkChange: CanvasLinkActs["onChosenChange"];
  onUndo: CanvasWriteActs["onUndo"];
  onWriteRetry: CanvasWriteActs["onRetry"];
  onWriteDismiss: CanvasWriteActs["onDismiss"];
}

function stands(): CanvasSays {
  return {
    agents: AGENTS,
    links: LINKS,
    models: MODELS,
    prompts: [],
    troubles: {},
    toolless: [],
    states: {},
    // Names the sources; the arc itself is built from the grants.
    sources: {
      commands: [],
      servers: [],
      looks: {},
      agents: [],
    },
    workingAgents: [],
    waitingAgents: [],
    linkLives: {},
    callsOut: {},
    selectedAgentId: null,
    aimedAgentId: null,
    isPanelOnAgent: true,
    pending: null,
    dimmedModelId: null,
    doomedAgentId: null,
    pasted: null,
    isPasteOffered: false,
    undoOffers: [],
    writeNote: null,
    opening: null,
    onViewChange: () => {},
    onWriteRetry: async () => {},
    onWriteDismiss: () => {},
    onSelectedAgentIdChange: () => {},
    onAddAgent: () => {},
    onCopyAgent: () => {},
    onAddLink: () => {},
    onPasteAgent: () => {},
    onPastedDismiss: () => {},
    onDeleteAgent: () => {},
    onDeleteLink: () => {},
    onChosenLinkChange: () => {},
    onMoveAgent: async () => {},
    onUndo: () => {},
    onOpenAgentTools: () => {},
    onPickAgent: () => {},
  };
}

function canvasWith(overrides: Partial<CanvasSays> = {}) {
  const said = {
    ...stands(),
    ...overrides,
  };

  return (
    <Canvas
      standing={{
        agents: said.agents,
        links: said.links,
        models: said.models,
        prompts: said.prompts,
        troubles: said.troubles,
        toolless: said.toolless,
        states: said.states,
        sources: said.sources,
      }}
      living={{
        workingAgents: said.workingAgents,
        waitingAgents: said.waitingAgents,
        linkLives: said.linkLives,
        callsOut: said.callsOut,
      }}
      picked={{
        selectedAgentId: said.selectedAgentId,
        aimedAgentId: said.aimedAgentId,
        isPanelOnAgent: said.isPanelOnAgent,
        pending: said.pending,
        dimmedModelId: said.dimmedModelId,
        doomedAgentId: said.doomedAgentId,
        pasted: said.pasted,
        isPasteOffered: said.isPasteOffered,
      }}
      notes={{
        undoOffers: said.undoOffers,
        writeNote: said.writeNote,
      }}
      view={{
        opening: said.opening,
        onChange: said.onViewChange,
      }}
      agentActs={{
        onSelectedAgentIdChange: said.onSelectedAgentIdChange,
        onPick: said.onPickAgent,
        onOpenTools: said.onOpenAgentTools,
        onAdd: said.onAddAgent,
        onCopy: said.onCopyAgent,
        onPaste: said.onPasteAgent,
        onPastedDismiss: said.onPastedDismiss,
        onDelete: said.onDeleteAgent,
        onMove: said.onMoveAgent,
      }}
      linkActs={{
        onAdd: said.onAddLink,
        onDelete: said.onDeleteLink,
        onChosenChange: said.onChosenLinkChange,
      }}
      writeActs={{
        onUndo: said.onUndo,
        onRetry: said.onWriteRetry,
        onDismiss: said.onWriteDismiss,
      }}
    />
  );
}

function renderCanvas(overrides: Partial<CanvasSays> = {}) {
  return render(canvasWith(overrides));
}

/** One offer to put a deletion back. */
function undoOffer(overrides: Partial<UndoOffer> = {}): UndoOffer {
  return {
    id: "offer-1",
    deletionId: "deletion-1",
    taken: {
      models: [],
      prompts: [],
      commands: [],
      servers: [],
      agents: [],
      links: [],
      promptTakenFrom: [],
      grantsTakenFrom: [],
    },
    message: "АГЕНТА ВИДАЛЕНО",
    place: null,
    secondsLeft: 30,
    ...overrides,
  };
}

describe("Canvas", () => {
  it("takes the offer up on «Скасувати»", async () => {
    const onUndo = vi.fn();

    renderCanvas({
      undoOffers: [
        undoOffer({
          place: {
            x: 300,
            y: 200,
          },
        }),
      ],
      onUndo,
    });
    await userEvent.click(screen.getByText(UNDO_ACTION_LABEL));

    expect(onUndo).toHaveBeenCalledWith("offer-1");
  });

  it("holds the place a deleted sphere left, while the step back is offered", () => {
    const empty = renderCanvas();

    expect(empty.container.querySelector(`[style*="${DELETED_PLACE_SIZE_PX}px"]`)).toBeNull();
    empty.unmount();

    const { container } = renderCanvas({
      undoOffers: [
        undoOffer({
          place: {
            x: 300,
            y: 200,
          },
        }),
      ],
    });

    // The hole stays where the agent was.
    expect(container.querySelector(`[style*="${DELETED_PLACE_SIZE_PX}px"]`)).not.toBeNull();
  });

  it("draws one sphere per agent", () => {
    renderCanvas();

    expect(
      screen.getByRole("button", {
        name: "EDITOR",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: "REVIEWER",
      }),
    ).toBeInTheDocument();
  });

  it("centres each sphere on the position saved with its agent", () => {
    renderCanvas();

    expect(
      screen.getByRole("button", {
        name: "EDITOR",
      }).parentElement,
    ).toHaveStyle({
      left: "300px",
      top: "200px",
      transform: "translate(-50%, -50%)",
    });
  });

  it("names each agent's model beneath it", () => {
    renderCanvas();

    expect(screen.getByText("Claude Sonnet 4.5")).toBeInTheDocument();
  });

  it("draws an agent whose model is gone without one, rather than not at all", () => {
    renderCanvas({
      models: [],
    });

    expect(
      screen.getByRole("button", {
        name: "EDITOR",
      }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Claude Sonnet 4.5")).not.toBeInTheDocument();
  });

  it("reports which agent was clicked", async () => {
    const onSelectedAgentIdChange = vi.fn();

    renderCanvas({
      onSelectedAgentIdChange,
    });

    await userEvent.click(
      screen.getByRole("button", {
        name: "REVIEWER",
      }),
    );

    expect(onSelectedAgentIdChange).toHaveBeenCalledWith("agent-2");
  });

  it("clears the selection when the space between spheres is clicked", async () => {
    const onSelectedAgentIdChange = vi.fn();

    const { container } = renderCanvas({
      selectedAgentId: "agent-1",
      onSelectedAgentIdChange,
    });

    await userEvent.click(container.firstElementChild as HTMLElement);

    expect(onSelectedAgentIdChange).toHaveBeenCalledWith(null);
  });

  it("opens its menu where the canvas was right-clicked", async () => {
    const { container } = renderCanvas();

    await userEvent.pointer({
      keys: "[MouseRight]",
      target: container.firstElementChild as HTMLElement,
    });

    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  it("asks for an agent at the point the menu was opened on", async () => {
    const onAddAgent = vi.fn();
    const { container } = renderCanvas({
      onAddAgent,
    });

    await userEvent.pointer({
      keys: "[MouseRight]",
      target: container.firstElementChild as HTMLElement,
    });
    await userEvent.click(
      screen.getByRole("menuitem", {
        name: CANVAS_ADD_AGENT_LABEL,
      }),
    );

    expect(onAddAgent).toHaveBeenCalledWith({
      x: 0,
      y: 0,
    });
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("puts the menu away when the canvas is clicked", async () => {
    const { container } = renderCanvas();

    await userEvent.pointer({
      keys: "[MouseRight]",
      target: container.firstElementChild as HTMLElement,
    });
    await userEvent.click(container.firstElementChild as HTMLElement);

    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("tells the user how to add the first agent to an empty project", () => {
    renderCanvas({
      agents: [],
    });

    expect(screen.getByText(CANVAS_EMPTY_TITLE)).toBeInTheDocument();
  });

  it("draws nothing at the point an agent is being created at — no sphere, and no mark either", () => {
    renderCanvas({
      pending: {
        kind: "point",
        at: {
          x: 480,
          y: 260,
        },
      },
    });

    // Only a sphere carries `aria-pressed`; the toolbar's buttons do not.
    expect(screen.getAllByRole("button").filter((button) => button.hasAttribute("aria-pressed"))).toHaveLength(
      AGENTS.length,
    );
  });

  it("drops the hint once an agent is being created, since it is being followed", () => {
    renderCanvas({
      agents: [],
      pending: {
        kind: "centre",
      },
    });

    expect(screen.queryByText(CANVAS_EMPTY_TITLE)).not.toBeInTheDocument();
  });

  it("opens a sphere's own menu on right-click, offering to delete it", async () => {
    const onDeleteAgent = vi.fn();

    renderCanvas({
      onDeleteAgent,
    });
    await userEvent.pointer({
      keys: "[MouseRight]",
      target: screen.getByRole("button", {
        name: "EDITOR",
      }),
    });
    await userEvent.click(
      screen.getByRole("menuitem", {
        name: `${CANVAS_DELETE_AGENT_LABEL}${CANVAS_DELETE_AGENT_SHORTCUT}`,
      }),
    );

    expect(onDeleteAgent).toHaveBeenCalledWith("agent-1");
  });

  it("dims every agent on the model whose deletion is being confirmed", () => {
    renderCanvas({
      dimmedModelId: "model-1",
    });

    // The sphere's own wireframe, not the links layer, which also draws `g` elements.
    const sphere = screen.getByRole("button", {
      name: "EDITOR",
    });

    expect(sphere.querySelectorAll("g")[1]).toHaveAttribute("stroke", "#4a5268");
  });

  it("moves a sphere with the pointer, holding a ghost circle on its old place", async () => {
    const onMoveAgent = vi.fn().mockResolvedValue(undefined);
    const onSelectedAgentIdChange = vi.fn();

    const { container } = renderCanvas({
      onMoveAgent,
      onSelectedAgentIdChange,
    });

    // Grabbed 10 right of and 5 below its centre at (300, 200); the sphere keeps that grip.
    fireEvent.mouseDown(
      screen.getByRole("button", {
        name: "EDITOR",
      }),
      {
        button: 0,
        clientX: 310,
        clientY: 205,
      },
    );
    fireEvent.mouseMove(window, {
      clientX: 400,
      clientY: 300,
    });

    expect(
      screen.getByRole("button", {
        name: "EDITOR",
      }).parentElement,
    ).toHaveStyle({
      left: "390px",
      top: "295px",
      pointerEvents: "none",
    });
    const ghost = container.querySelector("span[style*='dashed']");

    expect(ghost).toHaveStyle({
      left: "300px",
      top: "200px",
      width: "130px",
      height: "130px",
    });
    expect(ghost?.getAttribute("style")).toContain("1px dashed rgb(38, 43, 58)");

    fireEvent.mouseUp(window, {
      clientX: 400,
      clientY: 300,
    });

    expect(onMoveAgent).toHaveBeenCalledWith("agent-1", {
      x: 390,
      y: 295,
    });

    // The click fired by the release lands on the canvas and must not clear the selection.
    fireEvent.click(container.firstElementChild as HTMLElement);
    expect(onSelectedAgentIdChange).not.toHaveBeenCalled();

    // Until the save returns, the sphere holds where it was dropped.
    expect(
      screen.getByRole("button", {
        name: "EDITOR",
      }).parentElement,
    ).toHaveStyle({
      left: "390px",
      top: "295px",
    });
    await waitFor(() => expect(container.querySelector("span[style*='dashed']")).not.toBeInTheDocument());
  });

  it("lets a sphere be clicked again after a move that could not be written", async () => {
    const onMoveAgent = vi.fn().mockRejectedValue(new Error("проєкт не записався"));
    const onSelectedAgentIdChange = vi.fn();

    renderCanvas({
      onMoveAgent,
      onSelectedAgentIdChange,
    });

    fireEvent.mouseDown(
      screen.getByRole("button", {
        name: "EDITOR",
      }),
      {
        button: 0,
        clientX: 300,
        clientY: 200,
      },
    );
    fireEvent.mouseMove(window, {
      clientX: 400,
      clientY: 300,
    });
    fireEvent.mouseUp(window, {
      clientX: 400,
      clientY: 300,
    });

    expect(onMoveAgent).toHaveBeenCalledOnce();

    // A failed write releases the drop point: the sphere stands at its saved place.
    await waitFor(() =>
      expect(
        screen.getByRole("button", {
          name: "EDITOR",
        }).parentElement,
      ).toHaveStyle({
        left: "300px",
        top: "200px",
        pointerEvents: "auto",
      }),
    );

    await userEvent.click(
      screen.getByRole("button", {
        name: "EDITOR",
      }),
    );

    expect(onSelectedAgentIdChange).toHaveBeenCalledWith("agent-1");
  });

  it("keeps a press that barely moved a click rather than a drag", () => {
    const onMoveAgent = vi.fn().mockResolvedValue(undefined);

    renderCanvas({
      onMoveAgent,
    });

    fireEvent.mouseDown(
      screen.getByRole("button", {
        name: "EDITOR",
      }),
      {
        button: 0,
        clientX: 300,
        clientY: 200,
      },
    );
    fireEvent.mouseMove(window, {
      clientX: 302,
      clientY: 201,
    });
    fireEvent.mouseUp(window, {
      clientX: 302,
      clientY: 201,
    });

    expect(onMoveAgent).not.toHaveBeenCalled();
  });

  it("leaves the right button to the sphere's menu rather than dragging with it", () => {
    const onMoveAgent = vi.fn().mockResolvedValue(undefined);

    const { container } = renderCanvas({
      onMoveAgent,
    });

    fireEvent.mouseDown(
      screen.getByRole("button", {
        name: "EDITOR",
      }),
      {
        button: 2,
        clientX: 300,
        clientY: 200,
      },
    );
    fireEvent.mouseMove(window, {
      clientX: 400,
      clientY: 300,
    });

    expect(container.querySelector("span[style*='dashed']")).not.toBeInTheDocument();
  });

  it("drags the canvas with the space between spheres, moving the spheres and the grid together", () => {
    const onSelectedAgentIdChange = vi.fn();

    const { container } = renderCanvas({
      onSelectedAgentIdChange,
    });
    const canvas = container.firstElementChild as HTMLElement;

    fireEvent.mouseDown(canvas, {
      button: 0,
      clientX: 500,
      clientY: 500,
    });
    fireEvent.mouseMove(window, {
      clientX: 420,
      clientY: 560,
    });

    expect(
      screen.getByRole("button", {
        name: "EDITOR",
      }).parentElement?.parentElement,
    ).toHaveStyle({
      transform: "translate(-80px, 60px) scale(1)",
    });
    expect(canvas).toHaveStyle({
      backgroundPosition: "-80px 60px",
      cursor: "grabbing",
    });
    expect(canvas.getAttribute("style")).toContain(CANVAS_GRID_MOVING_DOT_COLOR);

    fireEvent.mouseUp(window, {
      clientX: 420,
      clientY: 560,
    });
    fireEvent.click(canvas);

    // What is selected does not change under a drag of the canvas.
    expect(onSelectedAgentIdChange).not.toHaveBeenCalled();
  });

  it("leaves the agent where it was saved, since dragging the canvas moves the view", async () => {
    const onAddAgent = vi.fn();
    const { container } = renderCanvas({
      onAddAgent,
    });
    const canvas = container.firstElementChild as HTMLElement;

    fireEvent.mouseDown(canvas, {
      button: 0,
      clientX: 500,
      clientY: 500,
    });
    fireEvent.mouseMove(window, {
      clientX: 400,
      clientY: 500,
    });
    fireEvent.mouseUp(window, {
      clientX: 400,
      clientY: 500,
    });

    expect(
      screen.getByRole("button", {
        name: "EDITOR",
      }).parentElement,
    ).toHaveStyle({
      left: "300px",
      top: "200px",
    });

    // A right-click point is read in agent coordinates.
    await userEvent.pointer({
      keys: "[MouseRight]",
      target: canvas,
    });
    await userEvent.click(
      screen.getByRole("menuitem", {
        name: CANVAS_ADD_AGENT_LABEL,
      }),
    );

    expect(onAddAgent).toHaveBeenCalledWith({
      x: 100,
      y: 0,
    });
  });

  it("keeps a press on the canvas that barely moved a click, so the selection still clears", () => {
    const onSelectedAgentIdChange = vi.fn();

    const { container } = renderCanvas({
      onSelectedAgentIdChange,
    });
    const canvas = container.firstElementChild as HTMLElement;

    fireEvent.mouseDown(canvas, {
      button: 0,
      clientX: 500,
      clientY: 500,
    });
    fireEvent.mouseMove(window, {
      clientX: 502,
      clientY: 501,
    });
    fireEvent.mouseUp(window, {
      clientX: 502,
      clientY: 501,
    });
    fireEvent.click(canvas);

    expect(canvas).toHaveStyle({
      backgroundPosition: "0px 0px",
    });
    expect(onSelectedAgentIdChange).toHaveBeenCalledWith(null);
  });

  it("moves the sphere and not the canvas when the press started on a sphere", () => {
    const onMoveAgent = vi.fn().mockResolvedValue(undefined);

    const { container } = renderCanvas({
      onMoveAgent,
    });
    const canvas = container.firstElementChild as HTMLElement;

    fireEvent.mouseDown(
      screen.getByRole("button", {
        name: "EDITOR",
      }),
      {
        button: 0,
        clientX: 300,
        clientY: 200,
      },
    );
    fireEvent.mouseMove(window, {
      clientX: 360,
      clientY: 200,
    });
    fireEvent.mouseUp(window, {
      clientX: 360,
      clientY: 200,
    });

    expect(onMoveAgent).toHaveBeenCalledOnce();
    expect(canvas).toHaveStyle({
      backgroundPosition: "0px 0px",
    });
  });

  it("moves nothing on any button but the left one", () => {
    const { container } = renderCanvas();
    const canvas = container.firstElementChild as HTMLElement;

    fireEvent.mouseDown(canvas, {
      button: 1,
      clientX: 500,
      clientY: 500,
    });
    fireEvent.mouseMove(window, {
      clientX: 400,
      clientY: 400,
    });
    fireEvent.mouseUp(window, {
      clientX: 400,
      clientY: 400,
    });

    expect(canvas).toHaveStyle({
      backgroundPosition: "0px 0px",
    });
  });

  it("scales the canvas from the toolbar, holding the middle of the box still", async () => {
    const { container } = renderCanvas();

    expect(screen.getByText("100%")).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", {
        name: ZOOM_OUT_LABEL,
      }),
    );

    expect(screen.getByText("90%")).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: "EDITOR",
      }).parentElement?.parentElement,
    ).toHaveStyle({
      transform: "translate(0px, 0px) scale(0.9)",
    });
    // The grid is drawn at the same scale as the content.
    expect(container.firstElementChild).toHaveStyle({
      backgroundSize: `${CANVAS_GRID_STEP_PX * 0.9}px ${CANVAS_GRID_STEP_PX * 0.9}px`,
    });
  });

  it("opens at the ceiling: the typical scale is the closest there is, so «+» is dead from the start", () => {
    renderCanvas();

    expect(screen.getByText(`${ZOOM_MAX_SCALE * ZOOM_SCALE_PERCENT}%`)).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: ZOOM_IN_LABEL,
      }),
    ).toBeDisabled();
  });

  it("puts the whole graph into the window on a double click over empty canvas", async () => {
    const box = vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue(new DOMRect(0, 0, 800, 600));
    const { container } = renderCanvas();

    await userEvent.dblClick(container.firstElementChild as HTMLElement);

    // Both spheres (340 by 220 apart, 120 margin) would fit at 130%, but the ceiling stops at 100%, centred.
    expect(screen.getByText("100%")).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: "EDITOR",
      }).parentElement?.parentElement,
    ).toHaveStyle({
      transform: `translate(${400 - 470}px, ${300 - 310}px) scale(1)`,
    });

    box.mockRestore();
  });

  it("does not fit the graph from on top of a sphere, which is not empty canvas", async () => {
    const box = vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue(new DOMRect(0, 0, 800, 600));
    renderCanvas();

    await userEvent.dblClick(
      screen.getByRole("button", {
        name: "EDITOR",
      }),
    );

    expect(screen.getByText("100%")).toBeInTheDocument();

    box.mockRestore();
  });

  it("holds the point under the pointer still while the wheel changes the scale", () => {
    const { container } = renderCanvas();
    const canvas = container.firstElementChild as HTMLElement;

    fireEvent.wheel(canvas, {
      deltaY: 1,
      clientX: 400,
      clientY: 300,
    });

    // (400, 300) stays on the same content point: the pan is 400 − 400 × 0.9.
    expect(canvas).toHaveStyle({
      backgroundPosition: "40px 30px",
    });
  });

  it("goes no further than the ends of the scale, and says so on the button", async () => {
    renderCanvas();

    const zoomOut = screen.getByRole("button", {
      name: ZOOM_OUT_LABEL,
    });

    for (let step = 0; step < 10; step += 1) {
      await userEvent.click(zoomOut);
    }

    expect(screen.getByText(`${ZOOM_MIN_SCALE * ZOOM_SCALE_PERCENT}%`)).toBeInTheDocument();
    expect(zoomOut).toBeDisabled();
  });

  it("keeps every label at every scale: the graph shrinks whole, and nothing is taken off it", async () => {
    renderCanvas();

    expect(screen.getByText("Claude Sonnet 4.5")).toBeInTheDocument();

    const zoomOut = screen.getByRole("button", {
      name: ZOOM_OUT_LABEL,
    });

    // Five steps down: 100% → 50%.
    for (let step = 0; step < 5; step += 1) {
      await userEvent.click(zoomOut);
    }

    expect(screen.getByText("Claude Sonnet 4.5")).toBeInTheDocument();
    expect(screen.getByText("EDITOR")).toBeInTheDocument();
  });

  it("widens the grid's step where the dots would run together", async () => {
    const { container } = renderCanvas();

    const zoomOut = screen.getByRole("button", {
      name: ZOOM_OUT_LABEL,
    });

    for (let step = 0; step < 5; step += 1) {
      await userEvent.click(zoomOut);
    }

    expect(container.firstElementChild).toHaveStyle({
      backgroundSize: `${CANVAS_GRID_STEP_PX * 0.5 * 2}px ${CANVAS_GRID_STEP_PX * 0.5 * 2}px`,
    });
  });

  it("offers a copy of the sphere it was opened on", async () => {
    const onCopyAgent = vi.fn();

    renderCanvas({
      onCopyAgent,
    });
    await userEvent.pointer({
      keys: "[MouseRight]",
      target: screen.getByRole("button", {
        name: "EDITOR",
      }),
    });
    await userEvent.click(
      screen.getByRole("menuitem", {
        name: `${CANVAS_COPY_AGENT_LABEL}${CANVAS_COPY_AGENT_SHORTCUT}`,
      }),
    );

    expect(onCopyAgent).toHaveBeenCalledWith("agent-1");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("offers the paste only once there is something to paste", async () => {
    const onPasteAgent = vi.fn();
    const { container, rerender } = renderCanvas({
      onPasteAgent,
    });

    await userEvent.pointer({
      keys: "[MouseRight]",
      target: container.firstElementChild as HTMLElement,
    });

    expect(screen.getByText(CANVAS_PASTE_AGENT_LABEL).closest("button")).toBeDisabled();

    rerender(
      canvasWith({
        isPasteOffered: true,
        onPasteAgent,
      }),
    );
    await userEvent.click(screen.getByText(CANVAS_PASTE_AGENT_LABEL).closest("button") as HTMLElement);

    expect(onPasteAgent).toHaveBeenCalledWith({
      x: 0,
      y: 0,
    });
  });

  it("marks the copy just put down, saying whose it is", () => {
    renderCanvas({
      pasted: {
        agentId: "agent-2",
        sourceName: "EDITOR",
      },
    });

    expect(screen.getByText("КОПІЯ EDITOR · ВСТАВЛЕНО")).toBeInTheDocument();
  });

  it("takes that mark away on the next click, wherever it lands", async () => {
    const onPastedDismiss = vi.fn();

    renderCanvas({
      pasted: {
        agentId: "agent-2",
        sourceName: "EDITOR",
      },
      onPastedDismiss,
    });

    // The click that placed the copy is still on its way to the window at mount.
    window.dispatchEvent(new MouseEvent("mousedown"));
    expect(onPastedDismiss).not.toHaveBeenCalled();

    await userEvent.click(document.body);

    expect(onPastedDismiss).toHaveBeenCalledOnce();
  });

  it("takes it away on the first click even where the click travels no further", async () => {
    const onPastedDismiss = vi.fn();

    renderCanvas({
      pasted: {
        agentId: "agent-2",
        sourceName: "EDITOR",
      },
      onPastedDismiss,
    });

    // The toolbar keeps its own click and press.
    await userEvent.click(
      screen.getByRole("button", {
        name: ZOOM_OUT_LABEL,
      }),
    );

    expect(onPastedDismiss).toHaveBeenCalledOnce();
  });

  it("draws a line per link, under the spheres, with an arrow at the end it arrives at", () => {
    const { container } = renderCanvas();
    const lines = container.querySelectorAll("svg line");

    // Three lines per link: the line, the drift over it, and the invisible click stroke.
    expect(lines).toHaveLength(3);
    expect(container.querySelectorAll("svg polygon")).toHaveLength(1);
    expect(lines[0]).toHaveAttribute("stroke", CANVAS_LINK_COLOR);
  });

  it("lights the selected agent's outgoing links in its colour and leaves the incoming ones grey", () => {
    const { container } = renderCanvas({
      links: [
        ...LINKS,
        aLink({
          id: "link-2",
          from: "agent-2",
          to: "agent-1",
        }),
      ],
      selectedAgentId: "agent-1",
    });
    const lines = container.querySelectorAll("svg line");

    // The lit link draws four lines (glow, line, drift, click stroke), the grey one three.
    expect(lines[1]).toHaveAttribute("stroke", mixWithTransparent(AGENTS[0].color, CANVAS_LINK_SELECTED_PERCENT));
    expect(lines[4]).toHaveAttribute("stroke", CANVAS_LINK_COLOR);
    // The handle belongs to a link chosen itself, not one lit by its agent.
    expect(container.querySelector("svg rect")).not.toBeInTheDocument();
  });

  it("stands every other sphere back while one is selected, and counts what it is tied to", () => {
    renderCanvas({
      selectedAgentId: "agent-1",
      isPanelOnAgent: true,
    });

    expect(
      screen.getByRole("button", {
        name: AGENTS[1].name,
      }),
    ).toHaveStyle({
      opacity: String(SPHERE_DIMMED_OPACITY),
    });
    expect(
      screen.getByRole("button", {
        name: AGENTS[0].name,
      }),
    ).not.toHaveStyle({
      opacity: String(SPHERE_DIMMED_OPACITY),
    });
    expect(screen.getByText("1 вихідний")).toBeInTheDocument();
    expect(screen.queryByText(/вхідн/)).not.toBeInTheDocument();
  });

  it("leaves every sphere alone while the chat is the panel, and breathes the one it writes to", () => {
    const { container } = renderCanvas({
      selectedAgentId: "agent-1",
      aimedAgentId: "agent-1",
      isPanelOnAgent: false,
    });

    // Choosing whom to write to is frequent, so no wide redraw.
    expect(
      screen.getByRole("button", {
        name: AGENTS[1].name,
      }),
    ).not.toHaveStyle({
      opacity: String(SPHERE_DIMMED_OPACITY),
    });
    expect(
      screen
        .getByRole("button", {
          name: AGENTS[0].name,
        })
        .querySelector(".sphere-breathe"),
    ).toBeInTheDocument();
    expect(container.querySelectorAll(".sphere-breathe")).toHaveLength(1);
  });

  it("raises no card for an agent tied to nothing", () => {
    renderCanvas({
      links: [],
      selectedAgentId: "agent-1",
    });

    expect(screen.queryByText(/вихідн|вхідн/)).not.toBeInTheDocument();
  });

  it("turns the links of an agent being asked about to a dashed red, and stops their drift", () => {
    const { container } = renderCanvas({
      doomedAgentId: "agent-1",
    });
    const lines = container.querySelectorAll("svg line");

    // The line and its click stroke; no drift on a link about to go.
    expect(lines).toHaveLength(2);
    expect(lines[0]).toHaveAttribute("stroke", CANVAS_LINK_DOOMED_COLOR);
    expect(lines[0]).toHaveAttribute("stroke-dasharray", CANVAS_LINK_DOOMED_DASH);
    expect(container.querySelector("svg polygon")).toHaveAttribute("fill", CANVAS_LINK_DOOMED_COLOR);
  });

  it("thickens the line clicked, handles it, and raises the pill with its direction", async () => {
    const { container } = renderCanvas();
    const hit = container.querySelectorAll("svg line")[2] as SVGLineElement;

    await userEvent.click(hit);

    const lines = container.querySelectorAll("svg line");

    expect(lines[1]).toHaveAttribute("stroke", mixWithTransparent(AGENTS[0].color, CANVAS_LINK_SELECTED_PERCENT));
    expect(lines[1]).toHaveAttribute("stroke-width", String(CANVAS_LINK_SELECTED_WIDTH));
    expect(container.querySelector("svg rect")).toHaveAttribute("width", String(CANVAS_LINK_HANDLE_SIZE_PX));

    const pill = screen.getByRole("button", {
      name: `${LINK_PILL_DELETE_SHORTCUT} ${LINK_PILL_DELETE_LABEL}`,
    }).parentElement as HTMLElement;

    expect(within(pill).getByText(AGENTS[0].name)).toBeInTheDocument();
    expect(within(pill).getByText(AGENTS[1].name)).toBeInTheDocument();
  });

  it("takes the link away from the pill, and from the key the pill prints", async () => {
    const onDeleteLink = vi.fn();
    const { container } = renderCanvas({
      onDeleteLink,
    });

    await userEvent.click(container.querySelectorAll("svg line")[2] as SVGLineElement);
    await userEvent.click(
      screen.getByRole("button", {
        name: `${LINK_PILL_DELETE_SHORTCUT} ${LINK_PILL_DELETE_LABEL}`,
      }),
    );

    expect(onDeleteLink).toHaveBeenCalledWith(LINKS[0].id);

    await userEvent.click(container.querySelectorAll("svg line")[2] as SVGLineElement);
    fireEvent.keyDown(window, {
      key: "Backspace",
    });

    expect(onDeleteLink).toHaveBeenCalledTimes(2);
  });

  it("says which link stands chosen, so the page knows a destructive key is the link's", async () => {
    // One press must not both take the link away and ask about the agent.
    const onChosenLinkChange = vi.fn();
    const { container } = renderCanvas({
      onChosenLinkChange,
    });

    await userEvent.click(container.querySelectorAll("svg line")[2] as SVGLineElement);

    expect(onChosenLinkChange).toHaveBeenLastCalledWith(LINKS[0].id);

    fireEvent.keyDown(window, {
      key: "Escape",
    });

    expect(onChosenLinkChange).toHaveBeenLastCalledWith(null);
  });

  it("lets the chosen link go on Escape, and on the next click on empty canvas", async () => {
    const { container } = renderCanvas();
    const hitLine = () => container.querySelectorAll("svg line")[2] as SVGLineElement;

    await userEvent.click(hitLine());
    fireEvent.keyDown(window, {
      key: "Escape",
    });

    expect(container.querySelector("svg rect")).not.toBeInTheDocument();

    await userEvent.click(hitLine());

    expect(container.querySelector("svg rect")).toBeInTheDocument();

    await userEvent.click(container.querySelector("[role='presentation']") as HTMLElement);

    expect(container.querySelector("svg rect")).not.toBeInTheDocument();
  });

  it("draws a link whose agent is gone, and stands a dead sphere at its far end", () => {
    // The line is drawn as the file holds it.
    const { container } = renderCanvas({
      links: [
        ...LINKS,
        aLink({
          id: "link-2",
          to: "agent-gone",
        }),
      ],
    });

    expect(container.querySelectorAll("svg polygon")).toHaveLength(2);
    expect(screen.getByText("AGENT-GO")).toBeInTheDocument();
    expect(screen.getByText(DEAD_SPHERE_NOTE_LABEL)).toBeInTheDocument();
  });

  it("raises the pill for a line with a dead end, naming the agent and the id the line carries", async () => {
    // Choosing a dead-end line must draw, not throw.
    const { container } = renderCanvas({
      links: [
        ...LINKS,
        aLink({
          id: "link-2",
          to: "agent-gone",
        }),
      ],
    });
    const lines = container.querySelectorAll("svg line");

    await userEvent.click(lines[lines.length - 1] as SVGLineElement);

    const pill = screen.getByRole("button", {
      name: `${LINK_PILL_DELETE_SHORTCUT} ${LINK_PILL_DELETE_LABEL}`,
    }).parentElement as HTMLElement;

    expect(within(pill).getByText(AGENTS[0].name)).toBeInTheDocument();
    expect(within(pill).getByText("AGENT-GO")).toBeInTheDocument();
  });

  it("takes away a line with a dead end like any other, since the file is what holds it", async () => {
    const onDeleteLink = vi.fn();
    const { container } = renderCanvas({
      links: [
        ...LINKS,
        aLink({
          id: "link-2",
          to: "agent-gone",
        }),
      ],
      onDeleteLink,
    });
    const lines = container.querySelectorAll("svg line");

    await userEvent.click(lines[lines.length - 1] as SVGLineElement);
    await userEvent.click(
      screen.getByRole("button", {
        name: `${LINK_PILL_DELETE_SHORTCUT} ${LINK_PILL_DELETE_LABEL}`,
      }),
    );

    expect(onDeleteLink).toHaveBeenCalledWith("link-2");
  });

  it("stands no dead sphere where every line names agents the project has", () => {
    const { container } = renderCanvas({});

    expect(container.querySelectorAll("svg polygon")).toHaveLength(1);
    expect(screen.queryByText(DEAD_SPHERE_NOTE_LABEL)).not.toBeInTheDocument();
  });

  it("draws no line at all where both of its ends are gone", () => {
    const { container } = renderCanvas({
      links: [
        aLink({
          id: "link-2",
          from: "gone-one",
          to: "gone-two",
        }),
      ],
    });

    expect(container.querySelectorAll("svg polygon")).toHaveLength(0);
    expect(screen.queryByText(DEAD_SPHERE_NOTE_LABEL)).not.toBeInTheDocument();
  });

  it("has a dragged sphere's links follow it, dashed and no longer drifting", () => {
    const { container } = renderCanvas();

    fireEvent.mouseDown(
      screen.getByRole("button", {
        name: "EDITOR",
      }),
      {
        button: 0,
        clientX: 300,
        clientY: 200,
      },
    );
    fireEvent.mouseMove(window, {
      clientX: 300,
      clientY: 600,
    });

    const lines = container.querySelectorAll("svg line");

    // No drift line while it moves: the link is the line and its click stroke.
    expect(lines).toHaveLength(2);
    expect(lines[0]).toHaveAttribute("stroke-dasharray", CANVAS_LINK_DRAGGED_DASH);
    // agent-1 sits at (300, 200) and is dragged 400 down; the line leaves its edge.
    expect(Number(lines[0].getAttribute("y1"))).toBeGreaterThan(400);
  });

  it("puts a line on the pointer from a sphere's menu, and makes the link on the sphere it lands on", async () => {
    const onAddLink = vi.fn();
    const onSelectedAgentIdChange = vi.fn();

    // No line drawn between them yet.
    const { container } = renderCanvas({
      links: [],
      onAddLink,
      onSelectedAgentIdChange,
    });

    await userEvent.pointer({
      keys: "[MouseRight]",
      target: screen.getByRole("button", {
        name: "EDITOR",
      }),
    });
    await userEvent.click(
      screen.getByRole("menuitem", {
        name: CANVAS_ADD_LINK_LABEL,
      }),
    );

    // Over empty canvas it says where it wants to land.
    expect(screen.getByText(LINK_DRAFT_HINT)).toBeInTheDocument();

    fireEvent.mouseMove(container.firstElementChild as HTMLElement, {
      clientX: 640,
      clientY: 420,
    });
    await userEvent.click(
      screen.getByRole("button", {
        name: "REVIEWER",
      }),
    );

    expect(onAddLink).toHaveBeenCalledWith("agent-1", "agent-2");
    // The click made a link, not a selection; the only selection call is the line's own clearing.
    expect(onSelectedAgentIdChange).toHaveBeenCalledExactlyOnceWith(null);
    expect(screen.queryByText(LINK_DRAFT_HINT)).not.toBeInTheDocument();
  });

  it("takes no line that would close a ring: the sphere back is no landing place at all", async () => {
    const onAddLink = vi.fn();

    renderCanvas({
      onAddLink,
    });

    await userEvent.pointer({
      keys: "[MouseRight]",
      target: screen.getByRole("button", {
        name: "REVIEWER",
      }),
    });
    await userEvent.click(
      screen.getByRole("menuitem", {
        name: CANVAS_ADD_LINK_LABEL,
      }),
    );
    await userEvent.click(
      screen.getByRole("button", {
        name: "EDITOR",
      }),
    );

    // EDITOR → REVIEWER already stands, so the line back would be a ring; the line stays in draft.
    expect(onAddLink).not.toHaveBeenCalled();
    expect(screen.getByText(LINK_DRAFT_HINT)).toBeInTheDocument();
  });

  it("names the direction once the line is over a sphere", async () => {
    const { container } = renderCanvas();

    await userEvent.pointer({
      keys: "[MouseRight]",
      target: screen.getByRole("button", {
        name: "EDITOR",
      }),
    });
    await userEvent.click(
      screen.getByRole("menuitem", {
        name: CANVAS_ADD_LINK_LABEL,
      }),
    );
    // agent-2 at (640, 420); jsdom gives a zero box, so the pointer is content.
    fireEvent.mouseMove(container.firstElementChild as HTMLElement, {
      clientX: 640,
      clientY: 420,
    });

    const direction = screen.getByText("EDITOR → REVIEWER");

    expect(direction).toBeInTheDocument();
    expect(screen.queryByText(LINK_DRAFT_HINT)).not.toBeInTheDocument();
    // Over the middle of the run, not over the target sphere.
    const middle = linkLine(AGENTS[0], AGENTS[1], SPHERE_SIZE_PX / 2).middle;

    expect(direction).toHaveStyle({
      // jsdom keeps three decimals of whatever it is given.
      left: `${middle.x.toFixed(3)}px`,
      top: `${(middle.y - LINK_DIRECTION_OFFSET_Y_PX).toFixed(3)}px`,
      transform: "translate(-50%, -100%)",
    });
    expect(
      screen.getByRole("button", {
        name: "EDITOR",
      }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("lights only the sphere a line is drawn from, and closes the panel behind it", async () => {
    const onSelectedAgentIdChange = vi.fn();

    // With no line between them, REVIEWER is a valid landing.
    renderCanvas({
      links: [],
      selectedAgentId: "agent-2",
      onSelectedAgentIdChange,
    });

    await userEvent.pointer({
      keys: "[MouseRight]",
      target: screen.getByRole("button", {
        name: "EDITOR",
      }),
    });
    await userEvent.click(
      screen.getByRole("menuitem", {
        name: CANVAS_ADD_LINK_LABEL,
      }),
    );

    const drawnFrom = screen.getByRole("button", {
      name: "EDITOR",
    });
    const selected = screen.getByRole("button", {
      name: "REVIEWER",
    });

    expect(drawnFrom).toHaveAttribute("aria-pressed", "true");
    expect(selected).toHaveAttribute("aria-pressed", "false");
    // Nothing is left selected behind the line.
    expect(onSelectedAgentIdChange).toHaveBeenCalledWith(null);
    // Nothing stands back while the line is being drawn.
    expect(selected).not.toHaveStyle({
      opacity: String(SPHERE_DIMMED_OPACITY),
    });
  });

  it("dims the sphere a line already runs to, so a second copy of it cannot be asked for", async () => {
    const onAddLink = vi.fn();

    renderCanvas({
      onAddLink,
    });

    await userEvent.pointer({
      keys: "[MouseRight]",
      target: screen.getByRole("button", {
        name: "EDITOR",
      }),
    });
    await userEvent.click(
      screen.getByRole("menuitem", {
        name: CANVAS_ADD_LINK_LABEL,
      }),
    );

    const standing = screen.getByRole("button", {
      name: "REVIEWER",
    });

    expect(standing).toHaveStyle({
      opacity: String(SPHERE_DIMMED_OPACITY),
    });

    await userEvent.click(standing);

    expect(onAddLink).not.toHaveBeenCalled();
  });

  it("drops the line on a click over nothing, and on Escape, without making anything", async () => {
    const onAddLink = vi.fn();

    const { container } = renderCanvas({
      onAddLink,
    });
    const canvas = container.firstElementChild as HTMLElement;

    async function startLine() {
      await userEvent.pointer({
        keys: "[MouseRight]",
        target: screen.getByRole("button", {
          name: "EDITOR",
        }),
      });
      await userEvent.click(
        screen.getByRole("menuitem", {
          name: CANVAS_ADD_LINK_LABEL,
        }),
      );
    }

    await startLine();
    await userEvent.click(canvas);

    expect(screen.queryByText(LINK_DRAFT_HINT)).not.toBeInTheDocument();

    await startLine();
    fireEvent.keyDown(window, {
      key: "Escape",
    });

    expect(screen.queryByText(LINK_DRAFT_HINT)).not.toBeInTheDocument();
    expect(onAddLink).not.toHaveBeenCalled();
  });

  it("draws a line let go over nothing going out, and then nothing at all", async () => {
    const { container } = renderCanvas();

    await userEvent.pointer({
      keys: "[MouseRight]",
      target: screen.getByRole("button", {
        name: "EDITOR",
      }),
    });
    await userEvent.click(
      screen.getByRole("menuitem", {
        name: CANVAS_ADD_LINK_LABEL,
      }),
    );
    await userEvent.click(container.querySelector("[role='presentation']") as HTMLElement);

    // The neutral tone, the cross on the loose end, and the cancel label.
    expect(screen.getByText(LINK_DRAFT_CANCELLED_LABEL)).toBeInTheDocument();
    expect(container.querySelector("svg path")).toHaveAttribute("stroke", LINK_DRAFT_CANCELLED_CROSS_COLOR);
    expect(screen.queryByText(LINK_DRAFT_HINT)).not.toBeInTheDocument();

    await waitForElementToBeRemoved(() => screen.queryByText(LINK_DRAFT_CANCELLED_LABEL));

    expect(container.querySelector("svg circle")).not.toBeInTheDocument();
  });

  it("carries the last deletion's line, and its way back", async () => {
    const onUndo = vi.fn();

    renderCanvas({
      undoOffers: [undoOffer()],
      onUndo,
    });
    await userEvent.click(screen.getByText("СКАСУВАТИ ⌘Z"));

    expect(screen.getByText("АГЕНТА ВИДАЛЕНО")).toBeInTheDocument();
    expect(onUndo).toHaveBeenCalledOnce();
  });

  it("stands two deletions one over the other, each with its own way back", async () => {
    const onUndo = vi.fn();

    renderCanvas({
      undoOffers: [
        undoOffer({
          id: "offer-1",
          message: "ЗВ’ЯЗОК ВИДАЛЕНО",
          secondsLeft: 27,
        }),
        undoOffer({
          id: "offer-2",
          message: "МОДЕЛЬ ВИДАЛЕНО",
        }),
      ],
      onUndo,
    });

    // The first deletion is not overwritten by the second and keeps its own seconds.
    expect(screen.getByText("ЗВ’ЯЗОК ВИДАЛЕНО")).toBeInTheDocument();
    expect(screen.getByText("МОДЕЛЬ ВИДАЛЕНО")).toBeInTheDocument();
    expect(screen.getByText("27 С")).toBeInTheDocument();
    expect(screen.getByText("30 С")).toBeInTheDocument();

    await userEvent.click(screen.getAllByText(UNDO_ACTION_LABEL)[0]);

    expect(onUndo).toHaveBeenCalledWith("offer-1");
  });

  it("folds everything past three into a count", () => {
    renderCanvas({
      undoOffers: [1, 2, 3, 4, 5].map((number) =>
        undoOffer({
          id: `offer-${number}`,
          message: `ВИДАЛЕНО ${number}`,
        }),
      ),
    });

    // Three rows stand; the two oldest collapse into one line with a count.
    expect(screen.queryByText("ВИДАЛЕНО 1")).not.toBeInTheDocument();
    expect(screen.queryByText("ВИДАЛЕНО 2")).not.toBeInTheDocument();
    expect(screen.getByText("ВИДАЛЕНО 3")).toBeInTheDocument();
    expect(screen.getByText(`${UNDO_STACK_FOLD_PREFIX} 2`)).toBeInTheDocument();
  });
});
