import { Sphere, SphereOrbs } from "../../../../../components";
import { armedWith } from "../../../logic";
import { CallPill } from "../call-pill";
import { WaitPill } from "../wait-pill";
import { WorkPill } from "../work-pill";
import type { AgentSphereProps } from "./interfaces";

/** One agent's sphere at its place, wearing what it is doing and how it stands. */
export function AgentSphere({ agent, place, wearing, doing, acts }: AgentSphereProps) {
  return (
    <div
      onContextMenu={acts.onMenu}
      onMouseDown={acts.onGrab}
      // Double click on a sphere must not fit the graph.
      onDoubleClick={(event) => event.stopPropagation()}
      role="presentation"
      style={{
        position: "absolute",
        left: place.at.x,
        top: place.at.y,
        transform: "translate(-50%, -50%)",
        pointerEvents: place.isDragged ? "none" : "auto",
      }}
    >
      <Sphere
        name={agent.name}
        trouble={wearing.trouble}
        markScale={place.markScale}
        isDrawnSmall={place.isDrawnSmall}
        stateColor={wearing.stateColor}
        modelTitle={wearing.modelTitle}
        color={agent.color}
        isActive={wearing.isActive}
        isSelected={wearing.standing.isSelected}
        isAimed={wearing.standing.isAimed}
        isDimmed={wearing.standing.isDimmed}
        trail={wearing.trail}
        underLabel={
          doing.working !== null ? (
            <WorkPill startedAt={doing.working.startedAt} />
          ) : doing.waiting !== null ? (
            <WaitPill
              awaitedNames={doing.waiting.suppliers
                .filter((supplier) => supplier.state === "working")
                .map((supplier) => doing.agents.find((one) => one.id === supplier.agentId)?.name ?? "")}
              isAwaitingRepeat={doing.waiting.isAwaitingRepeat}
              answered={doing.waiting.suppliers.filter((supplier) => supplier.state === "answered").length}
              silent={doing.waiting.suppliers.filter((supplier) => supplier.state === "silent").length}
              ofSuppliers={doing.waiting.suppliers.length}
              color={agent.color}
            />
          ) : null
        }
        onSelect={acts.onSelect}
      />
      {/*
       * The arc stands beside the sphere's button, not inside it (its targets are buttons), and counts places from the
       * same box.
       */}
      <SphereOrbs
        orbs={armedWith(agent.tools, wearing.sources)}
        scale={place.scale}
        isDimmed={wearing.standing.isDimmed}
        isQuiet={wearing.isToolless}
        onPress={acts.onPressOrb}
        onPointTo={acts.onPointToOrb}
        onPointAway={acts.onPointAwayFromOrb}
      />
      {/* The call is said by this pill alone; the arc does not move. */}
      {doing.calling !== null && <CallPill name={doing.calling.name} source={doing.calling.source} />}
    </div>
  );
}
