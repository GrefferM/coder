import { useCallback } from "react";
import { AimPicker, ChatIcon, useAgentChat, useLookAfterCall } from "../../../../features/conversation";
import { AgentsIcon, agentStates, followersOf, suppliersOf } from "../../../../features/agents";
import { useOpenedPass } from "../../../../features/projection";
import { useRailStanding } from "../use-rail-standing";
import { useShowCall } from "../use-show-call";
import { useShownStream } from "../use-shown-stream";
import { AgentsSection, ChatSection, ServersSection } from "../../components";
import { ModelsIcon, ModelsPanel } from "../../../../features/models";
import { CommandsIcon, CommandsPanel } from "../../../../features/commands";
import { PromptsIcon, PromptsPanel } from "../../../../features/prompts";
import { ProvidersIcon, ProvidersPanel, useProviders } from "../../../../features/providers";
import { ServersIcon, useServerConsent, useServers } from "../../../../features/servers";
import {
  AGENTS_PANEL_LABEL,
  AGENTS_SECTION_ID,
  CHAT_PANEL_LABEL,
  CHAT_SECTION_ID,
  COMMANDS_PANEL_LABEL,
  COMMANDS_SECTION_ID,
  MODELS_PANEL_LABEL,
  MODELS_SECTION_ID,
  NO_AGENT_STATE,
  PROMPTS_PANEL_LABEL,
  PROMPTS_SECTION_ID,
  PROVIDERS_PANEL_LABEL,
  PROVIDERS_SECTION_ID,
  SERVERS_PANEL_LABEL,
  SERVERS_SECTION_ID,
} from "../../constants";
import type { SidePanelItem } from "../../../../components";
import type { PageSubjects } from "../../interfaces";
import type { PageParts } from "./interfaces";

/** Composes the open project's machine, chat, stream and rail. */
export function usePageParts(
  subjects: PageSubjects,
  /** The agent's tab opens on its name after a copy is made. */
  isNamingCopy: boolean,
  onDeleteAgent: (agentId: string) => void,
): PageParts {
  const { project, agents, models, commands, servers: section, prompts, drafted, wayOut, actions } = subjects;
  const machine = useProviders();
  /** Every declared server, looked up live; nothing is persisted. */
  const servers = useServers(project.directory, project.config.servers);
  /** The consent window, opened by «ЗАПУСТИТИ» over a line this machine has not agreed to. */
  const consent = useServerConsent(project.config.servers, servers.restart);

  // A finished call refreshes the catalogue's look.
  useLookAfterCall(servers.look);
  const { sayNote } = actions;
  /** A refused pick is reported as a red write line, with no retry. */
  const sayRefused = useCallback(
    (words: string) =>
      sayNote({
        label: words,
        detail: null,
        reason: words,
        isRefusal: true,
        act: null,
      }),
    [sayNote],
  );
  const chat = useAgentChat(project, agents.selectedAgentId, machine.providers, machine.heard, sayRefused);
  /** The agent the stream targets; the selected one uses its unsaved draft. */
  const aimed =
    chat.aimedAgentId === agents.selectedAgentId && drafted.draft !== null
      ? drafted.draft
      : (project.config.agents.find((agent) => agent.id === chat.aimedAgentId) ?? null);
  const stream = useShownStream(project.directory, project.config.agents, chat, agents.select);
  /** The pass whose projection stands over the canvas. */
  const pass = useOpenedPass(project.config.agents, project.config.models, chat.written);
  const rail = useRailStanding(subjects, pass);
  // Opens the call a catalogue row refers to, in the chat.
  const showCall = useShowCall(stream, rail, chat.openCalls);

  /** Opens the projection for the run's pass; `null` when the stream has no row. */
  function openDebug(runId: string | null): ((questionId: string) => void) | null {
    return runId === null ? null : (questionId: string) => pass.open(runId, questionId);
  }

  /** Every agent's state, computed once per page. */
  const states = agentStates({
    config: project.config,
    providers: machine.providers,
    answers: machine.answers,
    looks: servers.looks,
    working: chat.working,
    waiting: chat.waiting,
    fellAt: chat.fellAt,
  });

  // Rail order: agents, models, MCP, commands, prompts; then the machine's chat and providers.
  const items: SidePanelItem[] = [
    {
      id: AGENTS_SECTION_ID,
      realm: "project",
      glyph: <AgentsIcon />,
      label: AGENTS_PANEL_LABEL,
      hasUnsaved: drafted.unsaved !== null,
      content: (
        <AgentsSection
          project={project}
          looks={servers.looks}
          agents={agents}
          drafted={drafted}
          state={states[agents.selectedAgentId ?? ""] ?? NO_AGENT_STATE}
          providers={machine.providers}
          suppliers={suppliersOf(project.config, agents.selectedAgentId)}
          followers={followersOf(project.config, agents.selectedAgentId)}
          startedAt={chat.startedAt}
          isNamingCopy={isNamingCopy}
          mending={rail.agentMend}
          toolsPress={rail.toolsPress}
          agentPress={rail.agentPress}
          onCollapse={() => rail.handleCollapsedChange(true)}
          onRevert={() => wayOut.guard(drafted.revert, "drop")}
          onDeleteAgent={onDeleteAgent}
        />
      ),
    },
    {
      id: MODELS_SECTION_ID,
      realm: "project",
      glyph: <ModelsIcon />,
      label: MODELS_PANEL_LABEL,
      count: project.config.models.length,
      hasUnsaved: models.unsaved !== null,
      content: (
        <ModelsPanel
          providers={machine.providers}
          providerAnswers={machine.answers}
          saved={models.saved}
          models={project.config.models}
          agents={project.config.agents}
          openModelId={models.openModelId}
          isMending={models.isMending}
          form={models.form}
          onOpenForm={(modelId) => wayOut.guard(() => models.openForm(modelId))}
          onCancelForm={() => wayOut.guard(() => models.openForm(null), "drop")}
          onFormChange={models.editForm}
          onSaveForm={models.saveForm}
          onArmedModelIdChange={models.arm}
        />
      ),
    },
    {
      id: SERVERS_SECTION_ID,
      realm: "project",
      glyph: <ServersIcon />,
      label: SERVERS_PANEL_LABEL,
      count: project.config.servers.length,
      hasUnsaved: section.unsaved !== null,
      content: (
        <ServersSection
          project={project}
          state={servers}
          consent={consent}
          section={section}
          wayOut={wayOut}
          onShowCall={showCall}
        />
      ),
    },
    {
      id: COMMANDS_SECTION_ID,
      realm: "project",
      glyph: <CommandsIcon />,
      label: COMMANDS_PANEL_LABEL,
      count: project.config.commands.length,
      hasUnsaved: commands.unsaved !== null,
      content: (
        <CommandsPanel
          commands={project.config.commands}
          openCommandId={commands.openCommandId}
          form={commands.form}
          onOpenForm={(commandId) => wayOut.guard(() => commands.openForm(commandId))}
          onFormChange={commands.editForm}
          onSaveForm={commands.saveForm}
          onCancelForm={() => wayOut.guard(() => commands.openForm(null), "drop")}
          onArmedCommandIdChange={commands.arm}
        />
      ),
    },
    {
      id: PROMPTS_SECTION_ID,
      realm: "project",
      glyph: <PromptsIcon />,
      label: PROMPTS_PANEL_LABEL,
      count: project.config.prompts.length,
      hasUnsaved: prompts.unsaved !== null,
      content: (
        <PromptsPanel
          prompts={project.config.prompts}
          agents={project.config.agents}
          chosenPromptId={prompts.chosenPromptId}
          onChosenPromptIdChange={prompts.setChosenPromptId}
          onEditPrompt={(promptId) => wayOut.guard(() => prompts.edit(promptId))}
          onDeletePrompt={prompts.arm}
        />
      ),
    },
    {
      id: CHAT_SECTION_ID,
      realm: "machine",
      glyph: <ChatIcon />,
      label: CHAT_PANEL_LABEL,
      hasUnsaved: false,
      // Header pill showing the stream's target and letting the person change it.
      pill: (
        <AimPicker
          agents={project.config.agents}
          aimedAgentId={chat.aimedAgentId}
          onAim={(agentId) =>
            wayOut.guard(() => {
              // Picking from the list aims the chat even at the already selected agent.
              agents.select(agentId);
              chat.aim(agentId);
            })
          }
        />
      ),
      content: (
        <ChatSection
          chat={chat}
          stream={stream}
          agents={project.config.agents}
          aimed={aimed}
          onOpenDebug={openDebug(stream.shownRunId)}
          onOpenProviders={() => rail.handleActiveIdChange(PROVIDERS_SECTION_ID)}
          onOpenModel={() => rail.openAgentModel(chat.aimedAgentId)}
          onShowConsent={consent.ask}
          onOpenAgentAt={rail.openAgentAt}
        />
      ),
    },
    {
      id: PROVIDERS_SECTION_ID,
      realm: "machine",
      glyph: <ProvidersIcon />,
      label: PROVIDERS_PANEL_LABEL,
      content: (
        <ProvidersPanel
          providers={machine.providers}
          answers={machine.answers}
          askingIds={machine.askingIds}
          models={project.config.models}
          agents={project.config.agents}
          onAsk={machine.ask}
          onSave={machine.save}
          onSwitch={machine.switchOff}
          onTakeUpModel={rail.takeUpModel}
        />
      ),
    },
  ];

  return {
    items,
    machine,
    chat,
    stream,
    pass,
    rail,
    agentStates: states,
    looks: servers.looks,
    consent,
  };
}
