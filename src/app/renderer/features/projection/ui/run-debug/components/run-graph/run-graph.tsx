import { useEffect, useRef } from "react";

import { walkDrawing } from "../../../../logic";
import { WALK_COLUMN_WIDTH_PX, WALK_FIRST_COLUMN_X_PX } from "../../../../constants";
import { useZoomField, ZOOM_UNMOVED, ZoomToolbar } from "../../../../../../components";
import { GraphRuler, GraphTurn } from "./components";
import {
  RUN_GRAPH_COLUMN_LINE_COLOR,
  RUN_GRAPH_EDGE_WIDTH,
  RUN_GRAPH_OPEN_SCALE,
  RUN_GRAPH_REST_LINE_COLOR,
  RUN_GRAPH_SCALE_STOPS,
} from "./constants";
import type { RunGraphProps } from "./interfaces";

/**
 * One pass drawn flat: a numbered sphere per turn over a ruler of when each began. Moves with the canvas's gestures,
 * opens fitted and no closer than the record-reading scale. A pressed sphere opens its step; the sheet stands over the
 * field.
 */
export function RunGraph({ run, standings, openStepId, onOpen }: RunGraphProps) {
  const field = useRef<HTMLDivElement>(null);
  const view = useZoomField(
    field,
    () => undefined,
    () => undefined,
    {
      pan: ZOOM_UNMOVED,
      scale: RUN_GRAPH_OPEN_SCALE,
    },
    RUN_GRAPH_SCALE_STOPS,
  );
  const drawing = walkDrawing(run.walk);
  const spots = drawing.turns.map((turn) => turn.at);
  const asked = run.askedAt.getTime();

  // Each pass arrives fitted; zoom is not carried between passes.
  useEffect(() => {
    view.fitAll(spots, RUN_GRAPH_OPEN_SCALE);
  }, [asked]);

  return (
    <div
      ref={field}
      className="flex-fill"
      role="presentation"
      onMouseDown={view.grabField}
      onWheel={(event) => view.stepAround(-Math.sign(event.deltaY), view.pointAt(event.clientX, event.clientY))}
      onDoubleClick={() => view.fitAll(spots, RUN_GRAPH_OPEN_SCALE)}
      style={{
        position: "relative",
        minHeight: 0,
        overflow: "hidden",
        cursor: view.isPanning ? "grabbing" : undefined,
      }}
    >
      {/* Faint line down every column, moving and scaling with the field. */}
      <span
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `linear-gradient(to right, ${RUN_GRAPH_COLUMN_LINE_COLOR} 1px, transparent 1px)`,
          backgroundSize: `${WALK_COLUMN_WIDTH_PX * view.scale}px 100%`,
          backgroundPosition: `${view.pan.x + WALK_FIRST_COLUMN_X_PX * view.scale}px 0`,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `translate(${view.pan.x}px, ${view.pan.y}px) scale(${view.scale})`,
          transformOrigin: "0 0",
        }}
      >
        <svg
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            overflow: "visible",
            pointerEvents: "none",
          }}
        >
          {drawing.lines.map((line) => (
            <g key={line.id}>
              <path
                d={line.path}
                fill="none"
                stroke={RUN_GRAPH_REST_LINE_COLOR}
                strokeWidth={RUN_GRAPH_EDGE_WIDTH}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {line.arrow !== "" && <polygon points={line.arrow} fill={RUN_GRAPH_REST_LINE_COLOR} />}
            </g>
          ))}
          {/* The one head a turn draws for every line that comes into it. */}
          {drawing.heads.map((head) => (
            <polygon key={head.id} points={head.arrow} fill={RUN_GRAPH_REST_LINE_COLOR} />
          ))}
        </svg>
        {drawing.turns.map((turn) => (
          <GraphTurn
            key={turn.place.step.id}
            turn={turn}
            standing={standings.find((standing) => standing.id === turn.place.step.agentId) ?? null}
            isOpen={turn.place.step.id === openStepId}
            onOpen={() => onOpen(turn.place.step.id)}
          />
        ))}
      </div>
      {/* The scale is shown and stepped in the corner, as on the canvas. */}
      <ZoomToolbar
        scale={view.scale}
        stops={RUN_GRAPH_SCALE_STOPS}
        onZoomOut={() => view.stepAround(-1, view.boxCentre())}
        onZoomIn={() => view.stepAround(1, view.boxCentre())}
      />
      <GraphRuler turns={drawing.turns} askedAt={run.startedAt} pan={view.pan} scale={view.scale} />
    </div>
  );
}
