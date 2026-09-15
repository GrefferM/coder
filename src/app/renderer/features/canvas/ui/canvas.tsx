import { forwardRef, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from "react";
import { useWindowDismiss } from "../../../hooks";
import { useCanvasWindows, useChosenLink, useLinkDraft, useSphereDrag } from "../hooks";
import { useZoomField, ZOOM_UNMOVED } from "../../../components";
import { CanvasGrain, CanvasLayers, CanvasMenu, CanvasOver, MarkWindow, RightClickHint } from "./components";
import { CANVAS_GRID_DOT_COLOR, CANVAS_GRID_MOVING_DOT_COLOR, CANVAS_LABEL_TONE_SCALE } from "../constants";
import { freePlaceNear } from "../../../utils/math";
import { cannotDrawLink } from "../../links";
import { draftTarget, gridStep, linkTally, troubleMarkScale } from "../logic";
import type { CanvasProps } from "../interfaces";
import type { CanvasHandle } from "../../../interfaces";
import type { Point } from "../../../utils/math";

/** One sphere per agent at its saved place; dragging a sphere moves data, dragging the canvas moves the view. */
export const Canvas = forwardRef<CanvasHandle, CanvasProps>(function Canvas(
  { standing, living, picked, notes, view, agentActs, linkActs, writeActs },
  handle,
) {
  const { agents, links } = standing;
  const { selectedAgentId, pending, pasted, isPasteOffered } = picked;
  const { undoOffers, writeNote } = notes;
  const canvasRef = useRef<HTMLDivElement>(null);
  const { menu, mark, openMenu, close, pressOrb, pointToOrb, pointAwayFromOrb, holdMark, openMarkRow } =
    useCanvasWindows(agentActs.onOpenTools, agentActs.onPick);
  const { pan, scale, isPanning, pointAt, contentPointAt, stepAround, fitAll, boxCentre, grabField } = useZoomField(
    canvasRef,
    close,
    forgetDragClick,
    view.opening,
  );

  // The view is reported up on every change; this machine notes it beside the open project.
  const noteView = view.onChange;

  // The hand itself is what this stands on — never the part holding it, which is a fresh object each render.
  useEffect(() => {
    noteView({
      pan,
      scale,
    });
  }, [noteView, pan, scale]);
  const { drag, grabSphere } = useSphereDrag(contentPointAt, agentActs.onMove, close, forgetDragClick);
  const line = useLinkDraft();
  const { chosenLinkId, choose: chooseLink } = useChosenLink(linkActs.onChosenChange, linkActs.onDelete);
  // Set while the click of a finished drag is still in flight.
  const hasJustDraggedRef = useRef(false);
  const [centreClaim, setCentreClaim] = useState<Point | null>(null);

  // Paste mark dismisses on the next press anywhere, in the capture phase.
  useWindowDismiss(pasted !== null, agentActs.onPastedDismiss, "press", false);
  useImperativeHandle(handle, () => ({
    centre: () => centreClaim ?? ZOOM_UNMOVED,
  }));

  useLayoutEffect(() => {
    if (pending?.kind !== "centre") {
      setCentreClaim(null);

      return;
    }

    const centre = boxCentre();

    setCentreClaim(
      freePlaceNear(
        {
          x: (centre.x - pan.x) / scale,
          y: (centre.y - pan.y) / scale,
        },
        agents,
      ),
    );
    // The claim's place is decided once, here.
  }, [pending]);

  /** Swallows the click a finished drag fires, one task later. */
  function forgetDragClick() {
    hasJustDraggedRef.current = true;
    setTimeout(() => {
      hasJustDraggedRef.current = false;
    });
  }

  const selectedAgent = agents.find((agent) => agent.id === selectedAgentId) ?? null;
  const selectedAgentLinks = linkTally(selectedAgent, links);
  const draft = line.drawn;
  const cancelled = line.cancelled;
  const target = draft === null ? null : draftTarget(agents, draft.agentId, draft.at);
  const gridStepPx = gridStep(scale);
  const markScale = troubleMarkScale(scale);
  const isDrawnSmall = scale < CANVAS_LABEL_TONE_SCALE;

  return (
    <div
      ref={canvasRef}
      className="d-flex flex-fill align-items-center justify-content-center"
      onClickCapture={(event) => {
        if (hasJustDraggedRef.current) {
          event.stopPropagation();
        }
      }}
      onClick={() => {
        close();

        // The click cancels the line being drawn; the selection stays.
        if (draft !== null) {
          line.cancel();

          return;
        }

        chooseLink(null);
        agentActs.onSelectedAgentIdChange(null);
      }}
      onMouseDown={grabField}
      onMouseMove={(event) => line.followTo(contentPointAt(event.clientX, event.clientY))}
      onWheel={(event) => stepAround(-Math.sign(event.deltaY), pointAt(event.clientX, event.clientY))}
      // Double click on empty canvas replaces «повернутись у центр».
      onDoubleClick={() => fitAll(agents)}
      onContextMenu={(event) => {
        event.preventDefault();
        openMenu({
          at: pointAt(event.clientX, event.clientY),
          contentAt: contentPointAt(event.clientX, event.clientY),
          agentId: null,
        });
      }}
      role="presentation"
      style={{
        position: "relative",
        // Lets the canvas give up width before the panel does.
        minWidth: 0,
        overflow: "hidden",
        cursor: isPanning ? "grabbing" : undefined,
        backgroundImage: `radial-gradient(circle, ${isPanning ? CANVAS_GRID_MOVING_DOT_COLOR : CANVAS_GRID_DOT_COLOR} 1px, transparent 1px)`,
        backgroundSize: `${gridStepPx}px ${gridStepPx}px`,
        backgroundPosition: `${pan.x}px ${pan.y}px`,
      }}
    >
      <CanvasGrain />
      {agents.length === 0 && !pending && <RightClickHint />}
      <CanvasLayers
        standing={standing}
        living={living}
        picked={picked}
        drawing={{
          drag,
          draft,
          cancelled,
          target,
          chosenLinkId,
          markScale,
          isDrawnSmall,
        }}
        undoOffers={undoOffers}
        pan={pan}
        scale={scale}
        onSelectLink={(linkId) => {
          close();
          chooseLink(linkId);
          // Choosing a link closes the panel.
          agentActs.onSelectedAgentIdChange(null);
        }}
        onDeleteLink={(linkId) => {
          linkActs.onDelete(linkId);
          chooseLink(null);
        }}
        onSphereMenu={(event, agentId) => {
          // The sphere's own menu, kept from the canvas behind it.
          event.preventDefault();
          event.stopPropagation();
          openMenu({
            at: pointAt(event.clientX, event.clientY),
            contentAt: contentPointAt(event.clientX, event.clientY),
            agentId,
          });
        }}
        onGrabSphere={grabSphere}
        onPressOrb={pressOrb}
        onPointToOrb={pointToOrb}
        onPointAwayFromOrb={pointAwayFromOrb}
        onSelectSphere={(agent) => {
          chooseLink(null);

          if (draft !== null) {
            // Drop on a sphere completes the link; if it cannot be drawn, drawing continues.
            if (cannotDrawLink(links, draft.agentId, agent.id)) {
              return;
            }

            linkActs.onAdd(draft.agentId, agent.id);
            line.finish();

            return;
          }

          agentActs.onSelectedAgentIdChange(agent.id);
        }}
      />
      <CanvasOver
        tally={selectedAgentLinks}
        scale={scale}
        undoOffers={undoOffers}
        writeNote={writeNote}
        onZoomOut={() => stepAround(-1, boxCentre())}
        onZoomIn={() => stepAround(1, boxCentre())}
        onWriteRetry={writeActs.onRetry}
        onWriteDismiss={writeActs.onDismiss}
        onUndo={writeActs.onUndo}
      />
      {mark !== null && <MarkWindow {...mark} onOpen={openMarkRow} onDismiss={close} onHold={holdMark} />}
      {menu && (
        <CanvasMenu
          {...menu}
          isPasteOffered={isPasteOffered}
          onAddAgent={agentActs.onAdd}
          onPasteAgent={agentActs.onPaste}
          onDrawLink={(agentId, from) => {
            line.drawFrom(agentId, from);
            chooseLink(null);
            agentActs.onSelectedAgentIdChange(null);
          }}
          onCopyAgent={agentActs.onCopy}
          onDeleteAgent={agentActs.onDelete}
          onDismiss={close}
        />
      )}
    </div>
  );
});
