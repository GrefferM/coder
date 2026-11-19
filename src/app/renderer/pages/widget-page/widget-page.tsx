import { useCallback, useEffect, useState } from "react";
import { chooseProjectDirectory, listRecentProjects } from "../../features/project";
import { listProviders } from "../../features/providers";
import { hearingChoice, useReadAloud, useSpeech, useVoiceAsk } from "../../features/speech";
import { packAttachments, packCeiling, pickAttachment, refusedPickNote } from "../../features/conversation";
import {
  CLOSE_PROJECT_LABEL,
  HIDE_WIDGET_LABEL,
  NoAgents,
  OPEN_MAIN_LABEL,
  OpenProject,
  SphereCarousel,
  SphereStage,
  StopReading,
  WIDGET_WALK_HEIGHT_PX,
  WidgetField,
  WidgetFrame,
  WidgetHead,
  WidgetNote,
  WidgetOutput,
  hideWidget,
  openMainWindow,
  resizeWidget,
  useEndReading,
  useWidget,
  useWidgetNote,
  useWidgetRepeats,
  widgetExchanges,
} from "../../features/widget";
import { agentStands, isWalking } from "../../../../contracts";
import type { PickedAttachment, ProjectEntry, ProviderState } from "../../interfaces";

/**
 * The desktop widget (52a–52k): with no project, an empty sphere and «Відкрити проєкт»; with one, the chosen agent as
 * one big sphere, every agent in the carousel under it, the conversation once there is one, and the field with its
 * microphone. A question said is sent the moment it is heard; the end of the walk is read aloud.
 */
export function WidgetPage() {
  const widget = useWidget();
  const { note, say } = useWidgetNote();
  const speech = useSpeech(say);
  const [recent, setRecent] = useState<ProjectEntry[]>([]);
  const [providers, setProviders] = useState<ProviderState[]>([]);
  const [isListOpen, setIsListOpen] = useState(false);
  /** What a state with no height of its own measures, as the frame tells it. */
  const [measured, setMeasured] = useState(0);
  const { directory, config, chosenAgentId } = widget;
  const snapshot = chosenAgentId === null ? null : (widget.walks[chosenAgentId] ?? null);
  const isOut = snapshot !== null && isWalking(snapshot);
  const exchanges = snapshot === null || config === null ? [] : widgetExchanges(snapshot, config);
  const chosen = config?.agents.find((agent) => agent.id === chosenAgentId) ?? null;
  /** The files and folders picked for the next question, under the field. */
  const [attachments, setAttachments] = useState<PickedAttachment[]>([]);
  /** How much the chosen agent's model takes; nothing to count against where there is none. */
  const ceiling = chosen === null || config === null ? 0 : packCeiling(agentStands(chosen, config, providers));
  const repeating = useWidgetRepeats({
    isOut,
    put: widget.ask,
  });
  /** Packs the picked files under the model's ceiling and puts the question with them, as many times as «x1» says. */
  const send = async (text: string) => {
    const packed =
      attachments.length === 0
        ? []
        : await packAttachments(
            attachments.map((one) => one.path),
            ceiling,
          );
    const went = await repeating.send(text, packed);

    if (went) {
      setAttachments([]);
    }

    return went;
  };
  const attach = () => {
    const used = attachments.reduce((sum, one) => sum + one.least, 0);

    void pickAttachment(ceiling > 0 ? Math.max(0, ceiling - used) : null).then(
      (pick) => {
        setAttachments((was) => [...was, ...pick.picked]);

        if (pick.refused.length > 0) {
          say({
            words: pick.refused.map(refusedPickNote).join("; "),
            act: null,
          });
        }
      },
      // The chooser did not open: nothing picked.
      () => undefined,
    );
  };
  const voice = useVoiceAsk({
    hearing: config === null ? null : hearingChoice(config, providers, speech.settings),
    onHeard: (words) => void send(words),
    onNote: say,
    onOpenSpeech: () => void openMainWindow(),
    endsOnPause: true,
  });
  const aloud = useReadAloud({
    voiceName: speech.settings.voiceName,
    voiceRate: speech.settings.voiceRate,
    onNote: say,
    onOpenSpeech: () => void openMainWindow(),
  });
  /** A sphere with a conversation asks the full height; every other state is as tall as what stands in it. */
  const hasTalk = config !== null && config.agents.length > 0 && exchanges.length > 0;
  const height = hasTalk ? WIDGET_WALK_HEIGHT_PX : measured;

  useEndReading(exchanges, aloud);

  useEffect(() => {
    void listProviders().then(setProviders);
  }, []);

  // The window takes the height its state asks, its top edge where it stands.
  useEffect(() => {
    if (height > 0) {
      void resizeWidget(height);
    }
  }, [height]);

  const loadRecent = useCallback(() => void listRecentProjects().then(setRecent), []);
  const open = useCallback(
    async (next: string) => {
      setIsListOpen(false);
      await widget.open(next);
    },
    [widget],
  );
  const openFolder = useCallback(async () => {
    const picked = await chooseProjectDirectory();

    if (picked !== null) {
      await open(picked);
    }
  }, [open]);

  if (directory === undefined) {
    return <WidgetFrame />;
  }

  if (directory === null || config === null) {
    return (
      <WidgetFrame onMeasure={setMeasured}>
        <OpenProject
          recent={recent}
          trouble={widget.trouble}
          isListOpen={isListOpen}
          onToggleList={() => {
            if (!isListOpen) {
              loadRecent();
            }

            setIsListOpen(!isListOpen);
          }}
          onOpen={(picked) => void open(picked)}
          onOpenFolder={() => void openFolder()}
        />
      </WidgetFrame>
    );
  }

  return (
    <WidgetFrame onMeasure={hasTalk ? undefined : setMeasured}>
      <WidgetHead
        name={config.name}
        directory={directory}
        recent={recent}
        canBeginAgain={!isOut && exchanges.length > 0}
        onBeginAgain={widget.fresh}
        onOpenList={loadRecent}
        onOpen={(picked) => void open(picked)}
        onOpenFolder={() => void openFolder()}
        quietActs={[
          {
            label: CLOSE_PROJECT_LABEL,
            onPress: () => void widget.close(),
          },
          {
            label: OPEN_MAIN_LABEL,
            onPress: () => void openMainWindow(),
          },
          {
            label: HIDE_WIDGET_LABEL,
            onPress: () => void hideWidget(),
          },
        ]}
      />
      <StopReading isReading={aloud.readingId !== null} onStop={aloud.stop} />
      {config.agents.length === 0 ? (
        <NoAgents onOpenMain={() => void openMainWindow()} />
      ) : (
        <>
          <SphereStage
            agent={chosen}
            links={config.links}
            level={voice.standing === "recording" ? (voice.levels.at(-1) ?? 0) : null}
            isShimmering={isOut || aloud.readingId !== null}
          />
          <SphereCarousel
            agents={config.agents}
            chosenAgentId={chosenAgentId}
            onChoose={(agentId) => void widget.choose(agentId)}
          />
          {exchanges.length > 0 && <WidgetOutput exchanges={exchanges} agents={config.agents} />}
          {note !== null && <WidgetNote note={note} />}
          <WidgetField
            agentName={chosen?.name ?? null}
            isWalking={isOut}
            voice={voice}
            attachments={attachments}
            repeats={repeating.repeats}
            repeating={repeating.repeating}
            onAttach={attach}
            onDetach={(path) => setAttachments((was) => was.filter((one) => one.path !== path))}
            onRepeats={repeating.setRepeats}
            onSend={send}
            onStop={() => {
              repeating.drop();
              widget.stop();
            }}
          />
        </>
      )}
    </WidgetFrame>
  );
}
