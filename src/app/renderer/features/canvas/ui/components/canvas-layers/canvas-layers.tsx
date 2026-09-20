import { AgentSphere } from "../agent-sphere";
import { DeadSphere } from "../dead-sphere";
import { DeletedPlace } from "../deleted-place";
import { LinkDraft } from "../link-draft";
import { LinkLayer } from "../link-layer";
import { LinkPill } from "../link-pill";
import { PastedMarker } from "../pasted-marker";
import { CANVAS_DRAG_GHOST_BORDER_COLOR, CANVAS_DRAG_GHOST_SIZE_PX } from "../../../constants";
import { linkLine } from "../../../../links";
import { SPHERE_SIZE_PX } from "../../../../../components/sphere/constants";
import { armedTally, callOut, deadEnd, deadEnds, sphereStanding } from "../../../logic";
import type { CanvasLayersProps } from "./interfaces";
import type { LinkEnd } from "../../../interfaces";

/** Everything the canvas draws in its own coordinates: the lines, the line in hand, the spheres and their marks. */
export function CanvasLayers({
  standing,
  living,
  picked,
  drawing,
  undoOffers,
  pan,
  scale,
  onSelectLink,
  onDeleteLink,
  onSphereMenu,
  onGrabSphere,
  onSelectSphere,
  onPressOrb,
  onPointToOrb,
  onPointAwayFromOrb,
}: CanvasLayersProps) {
  const { agents, links, models, prompts, troubles, toolless, states, sources } = standing;
  const { workingAgents, waitingAgents, linkLives, callsOut } = living;
  const { selectedAgentId, isPanelOnAgent, dimmedModelId, doomedAgentId, pasted } = picked;
  const { drag, draft, cancelled, target, chosenLinkId, markScale, isDrawnSmall } = drawing;
  const isDragged = drag !== null && agents.some((agent) => agent.id === drag.agentId);
  const selectedLink = links.find((link) => link.id === chosenLinkId) ?? null;
  // A line the file holds is drawn as it is; the end that names nobody is a dead sphere in free space (50a).
  const dead = deadEnds(agents, links);
  /** One end of the chosen line, whether an agent stands there or only the id the line carries. */
  const endOf = (agentId: string): LinkEnd | null => {
    const agent = agents.find((one) => one.id === agentId) ?? null;

    if (agent !== null) {
      return agent;
    }

    const place = dead[agentId];

    return place === undefined ? null : deadEnd(agentId, place);
  };
  const selectedLinkEnds =
    selectedLink === null
      ? null
      : {
          from: endOf(selectedLink.from),
          to: endOf(selectedLink.to),
        };
  const pastedAgent = pasted === null ? null : (agents.find((agent) => agent.id === pasted.agentId) ?? null);
  const draftAgent = draft === null ? null : (agents.find((agent) => agent.id === draft.agentId) ?? null);
  const cancelledAgent = cancelled === null ? null : (agents.find((agent) => agent.id === cancelled.agentId) ?? null);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
        transformOrigin: "top left",
        pointerEvents: "none",
      }}
    >
      {/*
       * Outgoing lines take the agent's colour for the panel's sake and never for the
       * aim's — a coloured line from a source is how work flowing reads, and an aim stands for hours.
       */}
      <LinkLayer
        links={links}
        deadEnds={dead}
        linkLives={linkLives}
        agents={agents}
        selectedAgentId={isPanelOnAgent ? selectedAgentId : null}
        selectedLinkId={chosenLinkId}
        doomedAgentId={doomedAgentId}
        draggedAgentId={drag?.agentId}
        draggedAt={drag?.at}
        onSelectLink={onSelectLink}
      />
      {draftAgent !== null && draft !== null && (
        <LinkDraft from={draftAgent} at={draft.at} target={target ?? undefined} />
      )}
      {cancelledAgent !== null && cancelled !== null && (
        <LinkDraft from={cancelledAgent} at={cancelled.at} isCancelled />
      )}
      {isDragged && (
        <span
          style={{
            position: "absolute",
            left: drag.from.x,
            top: drag.from.y,
            transform: "translate(-50%, -50%)",
            width: CANVAS_DRAG_GHOST_SIZE_PX,
            height: CANVAS_DRAG_GHOST_SIZE_PX,
            borderRadius: "50%",
            border: `1px dashed ${CANVAS_DRAG_GHOST_BORDER_COLOR}`,
          }}
        />
      )}
      {Object.entries(dead).map(([agentId, at]) => (
        <DeadSphere key={agentId} agentId={agentId} at={at} />
      ))}
      {agents.map((agent) => (
        <AgentSphere
          key={agent.id}
          agent={agent}
          place={{
            at: drag?.agentId === agent.id ? drag.at : agent,
            scale,
            markScale,
            isDrawnSmall,
            isDragged: drag?.agentId === agent.id,
          }}
          wearing={{
            standing: sphereStanding(agent, {
              picked,
              drawnFrom: draft?.agentId ?? null,
              isLinkChosen: selectedLink !== null,
              links,
            }),
            isActive: agent.isActive && agent.modelId !== dimmedModelId,
            stateColor: states[agent.id],
            modelTitle: models.find((model) => model.id === agent.modelId)?.title,
            trouble: troubles[agent.id] ?? null,
            /**
             * The trail's third line. A prompt the project has let go is not a prompt the trail may show — the
             * sphere's own mark says it is gone — and the key counts only what can actually be called.
             */
            trail: {
              hasPrompt: prompts.some((prompt) => prompt.id === agent.promptId),
              tools: armedTally(agent.tools, sources),
            },
            sources,
            isToolless: toolless.includes(agent.id),
          }}
          doing={{
            // An agent may work in several walks at once, and the sphere is no list of works —
            // the rows come oldest first, so its first one is the turn the pill wears.
            working: workingAgents.find((held) => held.agentId === agent.id) ?? null,
            waiting: waitingAgents.find((held) => held.agentId === agent.id) ?? null,
            // What this agent has out this moment — said by a pill beside the sphere, and the
            // arc under it does not move at all.
            calling: callOut(workingAgents, callsOut, agent.id),
            agents,
          }}
          acts={{
            onSelect: () => onSelectSphere(agent),
            onGrab: (event) => onGrabSphere(event, agent),
            onMenu: (event) => onSphereMenu(event, agent.id),
            onPressOrb: (orb, at) => onPressOrb(agent, orb, at),
            onPointToOrb: (orb, at) => onPointToOrb(agent, orb, at),
            onPointAwayFromOrb,
          }}
        />
      ))}
      {selectedLink !== null && selectedLinkEnds?.from && selectedLinkEnds.to && (
        <LinkPill
          from={selectedLinkEnds.from}
          to={selectedLinkEnds.to}
          at={
            linkLine(
              drag?.agentId === selectedLink.from ? drag.at : selectedLinkEnds.from,
              drag?.agentId === selectedLink.to ? drag.at : selectedLinkEnds.to,
              SPHERE_SIZE_PX / 2,
            ).middle
          }
          onDelete={() => onDeleteLink(selectedLink.id)}
        />
      )}
      {undoOffers.map((offer) => offer.place !== null && <DeletedPlace key={offer.id} at={offer.place} />)}
      {pastedAgent !== null && pasted !== null && <PastedMarker sourceName={pasted.sourceName} at={pastedAgent} />}
    </div>
  );
}
