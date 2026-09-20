import { useRef, useState } from "react";
import { SidePanel } from "../../components";
import { isSomethingOpen, useWayOut } from "../../hooks";
import { useNotedView, usePageKeys, usePageParts, useProjectActions } from "./hooks";
import { useAgentClipboard, useAgentDraft, useAgentSelection } from "../../features/agents";
import { agentTrouble, takesNoTools } from "../../features/agents";
import { RunDebug } from "../../features/projection";
import { useModelSection } from "../../features/models";
import { closeProject, ProjectSwitcher, useProjectFile } from "../../features/project";
import { useCommandSection } from "../../features/commands";
import { useServerSection } from "../../features/servers";
import { usePromptSection } from "../../features/prompts";
import { Canvas } from "../../features/canvas";
import { useCallsOut } from "../../features/conversation";
import { MainQuestions } from "./components";
import { RIGHT_SIDE_PANEL_WIDTH_PX, RUN_DEBUG_LAYER_STYLE } from "./constants";
import type { CanvasHandle } from "../../interfaces";
import type { MainPageProps, PageSubjects } from "./interfaces";

/** The screen an open project is worked on; the page keeps the keyboard and the wiring between subjects. */
export function MainPage({ project, setProject }: MainPageProps) {
  const canvasRef = useRef<CanvasHandle>(null);
  // The link the canvas holds chosen; the page keeps it only to know whose a key press is.
  const [chosenLinkId, setChosenLinkId] = useState<string | null>(null);
  const actions = useProjectActions(project, setProject);
  const clipboard = useAgentClipboard(project, actions);
  const agents = useAgentSelection(project, actions, canvasRef, clipboard.dismissPasted);
  const drafted = useAgentDraft(project, actions, agents.selectedAgentId);
  const models = useModelSection(project, actions);
  const commands = useCommandSection(project, actions);
  const servers = useServerSection(project, actions);
  const prompts = usePromptSection(project, actions);
  // Only the open section can be holding unsaved work.
  const wayOut = useWayOut(drafted.unsaved ?? models.unsaved ?? commands.unsaved ?? servers.unsaved ?? prompts.unsaved);
  // The subjects the screen is worked through, gathered once; the page's own hooks take them whole.
  const subjects: PageSubjects = {
    project,
    agents,
    clipboard,
    drafted,
    models,
    commands,
    servers,
    prompts,
    actions,
    wayOut,
  };
  const parts = usePageParts(subjects, clipboard.pasted !== null, requestDeleteAgent);
  /** Which function each turn has out; it changes a few times a turn, not sixty times a second. */
  const callsOut = useCallsOut();

  const file = useProjectFile(project, setProject, wayOut.unsaved, actions.sayNote);
  // Where the canvas stands is this machine's note about this project, kept beside the open section.
  const noteView = useNotedView(project.directory, parts);

  /** A copy put down is the one selected, and the claim that stood goes with it. */
  async function putCopy(put: () => Promise<string | null>) {
    const agentId = await put();

    if (agentId !== null) {
      agents.takePut(agentId);
    }
  }

  /** Deleting another agent asks about an open draft first; deleting the edited one takes it with them. */
  function requestDeleteAgent(agentId: string) {
    const raise = () => {
      agents.requestDelete(agentId);
      parts.rail.openAgentsSection();
    };

    if (agentId === agents.selectedAgentId) {
      raise();

      return;
    }

    wayOut.guard(raise);
  }

  usePageKeys(subjects, parts, {
    chosenLinkId,
    requestDeleteAgent,
    putCopy,
  });

  return (
    // Positioned so the project badge can sit over the canvas's top-left corner.
    <div
      className="d-flex flex-fill"
      style={{
        position: "relative",
      }}
    >
      <ProjectSwitcher
        project={project}
        onProjectChange={(next) => wayOut.guard(() => setProject(next))}
        // With no project open the start screen is what stands; unsaved work asks first, as a switch does.
        onClose={() =>
          wayOut.guard(() => {
            // The folder of a project nobody has open is nobody's to watch.
            void closeProject();
            setProject(null);
          })
        }
      />
      <Canvas
        ref={canvasRef}
        standing={{
          agents: drafted.drawnAgents,
          links: project.config.links,
          models: project.config.models,
          prompts: project.config.prompts,
          troubles: Object.fromEntries(
            drafted.drawnAgents.map((agent) => [
              agent.id,
              agentTrouble(agent, project.config, parts.machine.providers, parts.looks),
            ]),
          ),
          // Their tools are still in the file and still listed; what the arc says is that none of them can be called.
          toolless: drafted.drawnAgents
            .filter((agent) => takesNoTools(agent.modelId, project.config.models, parts.machine.providers))
            .map((agent) => agent.id),
          states: Object.fromEntries(
            drafted.drawnAgents.map((agent) => [agent.id, parts.agentStates[agent.id]?.color ?? ""]),
          ),
          // A mini-sphere names its source, and the names live in the project file and in the looks.
          sources: {
            commands: project.config.commands,
            servers: project.config.servers,
            looks: parts.looks,
          },
        }}
        living={{
          workingAgents: parts.chat.working,
          waitingAgents: parts.chat.waiting,
          linkLives: parts.chat.linkLives,
          // What each turn has out this moment, and nothing of what it is saying — the canvas is not
          // redrawn by an arriving token.
          callsOut,
        }}
        picked={{
          selectedAgentId: agents.selectedAgentId,
          aimedAgentId: parts.rail.isChatOpen ? parts.chat.aimedAgentId : null,
          isPanelOnAgent: parts.rail.isPanelOnAgent,
          pending: agents.pending,
          dimmedModelId: models.armedModelId,
          doomedAgentId: agents.doomedAgentId,
          pasted: clipboard.pasted,
          isPasteOffered: clipboard.isPasteOffered,
        }}
        notes={{
          undoOffers: actions.undoOffers,
          writeNote: actions.writeNote,
        }}
        view={{
          opening:
            project.view === null
              ? null
              : {
                  pan: project.view.pan,
                  scale: project.view.scale,
                },
          onChange: noteView,
        }}
        agentActs={{
          onSelectedAgentIdChange: (agentId) => {
            // A list, menu or switcher standing open takes the first click for itself; the canvas does nothing.
            if (isSomethingOpen()) {
              return;
            }

            // The click is still the way out of a half-written catalogue, so the question is asked first.
            wayOut.guard(() => {
              /** Empty canvas lets the agent go only while the panel is the selection's. */
              if (agentId === null && !parts.rail.isPanelOnAgent) {
                return;
              }

              agents.select(agentId);

              if (agentId === null) {
                parts.rail.closeAgentsSection();
              } else {
                // A click aims the chat at that sphere — said here and not left to a change of selection, since
                // the history moves the aim on its own and a click on the already-selected sphere must still land.
                parts.chat.aim(agentId);
                // The sphere is the agent, so the tab stands at the agent — not on a step left open behind.
                parts.rail.openAgentSelf(agentId);
              }
            });
          },
          // The list a «+» raised chooses the sphere under it and nothing else — the tab stays put.
          onPick: agents.select,
          onOpenTools: (agentId, group, grantId) => {
            // One press, one choice — the sphere is selected exactly as a press on the sphere selects it.
            agents.select(agentId);
            parts.rail.openAgentTools(group, grantId);
          },
          onAdd: (at) =>
            wayOut.guard(() => {
              agents.claimPoint(at);
              parts.rail.openAgentForm();
            }),
          onCopy: clipboard.copy,
          onPaste: (at) => wayOut.guard(() => void putCopy(() => clipboard.putCopyAt(at))),
          onPastedDismiss: clipboard.dismissPasted,
          onDelete: requestDeleteAgent,
          onMove: actions.moveAgent,
        }}
        linkActs={{
          onAdd: (fromAgentId, toAgentId) => void actions.addLink(fromAgentId, toAgentId),
          onDelete: (linkId) => void actions.deleteLink(linkId),
          onChosenChange: setChosenLinkId,
        }}
        writeActs={{
          onUndo: (offerId) => void actions.undoOffer(offerId),
          onRetry: actions.retryWrite,
          onDismiss: actions.dismissWriteNote,
        }}
      />
      <MainQuestions
        project={project}
        file={file}
        wayOut={wayOut}
        agents={agents}
        models={models}
        commands={commands}
        prompts={prompts}
        servers={servers}
        parts={parts}
      />
      <SidePanel
        items={parts.items}
        side="right"
        activeId={parts.rail.activeSectionId}
        onActiveIdChange={parts.rail.handleActiveIdChange}
        widthPx={RIGHT_SIDE_PANEL_WIDTH_PX}
        isCollapsed={parts.rail.isCollapsed}
        onCollapsedChange={parts.rail.handleCollapsedChange}
      />
      {/* The projection takes the whole field the canvas stands in; the rail stays. */}
      {parts.pass.isOpen && (
        <div className="d-flex" style={RUN_DEBUG_LAYER_STYLE}>
          <RunDebug
            run={parts.pass.run}
            isFailed={parts.pass.isFailed}
            standings={parts.pass.standings}
            changes={parts.pass.changes}
            place={parts.pass.place}
            passes={parts.pass.passes}
            onGo={parts.pass.go}
            onClose={parts.pass.close}
          />
        </div>
      )}
    </div>
  );
}
