import { useEffect, useState } from "react";
import { listProviders } from "../../features/providers";
import { hearingChoice, useReadAloud, useSoundPlayer, useSpeech, useVoiceAsk } from "../../features/speech";
import {
  openedStream,
  packAttachments,
  packCeiling,
  pickAttachment,
  questionTracks,
  refusedPickNote,
} from "../../features/conversation";
import {
  CLOSE_PROJECT_LABEL,
  NoAgents,
  OPEN_MAIN_LABEL,
  OpenProject,
  RunList,
  RunStrip,
  SphereCarousel,
  SphereStage,
  WidgetTools,
  WIDGET_WALK_HEIGHT_PX,
  WidgetField,
  WidgetFrame,
  WidgetHead,
  WidgetNote,
  WidgetOutput,
  openMainWindow,
  resizeWidget,
  useEndReading,
  useFocusLetGo,
  useWidget,
  useWidgetHistory,
  useWidgetKeys,
  useWidgetNote,
  useWidgetProjects,
  useWidgetRepeats,
  languageCode,
  widgetExchanges,
} from "../../features/widget";
import { ForgetRunConfirm, ForgetRunsConfirm, useLiveRun } from "../../features/record";
import { agentStands, chatStream, isWalking, walkingKeys } from "../../../../contracts";
import { thrownWords } from "../../utils/errors";
import type { HeardClip, ReadAloud } from "../../features/speech";
import type { PickedAttachment, ProviderState } from "../../interfaces";

/**
 * The desktop widget (52a–52k): with no project, an empty sphere and «Відкрити проєкт»; with one, the chosen agent as
 * one big sphere, every agent in the carousel under it, the conversation once there is one, and the field with its
 * microphone. A question said is sent the moment it is heard; the end of the walk is read aloud.
 */
export function WidgetPage() {
  const widget = useWidget();
  const { note, say } = useWidgetNote();
  const speech = useSpeech(say);
  const projects = useWidgetProjects(widget.open);
  const [providers, setProviders] = useState<ProviderState[]>([]);
  /** What a state with no height of its own measures, as the frame tells it. */
  const [measured, setMeasured] = useState(0);
  const { directory, config, chosenAgentId } = widget;
  const history = useWidgetHistory({
    directory,
    sphereId: chosenAgentId,
    onNote: say,
  });
  /** The project's one conversation, the chat's: a walk out anywhere in it holds the field, as in the chat. */
  const snapshot = widget.walks;
  const isOut = snapshot !== null && isWalking(snapshot);
  const live = snapshot === null ? [] : chatStream(snapshot);
  /** The live conversation's record, which holds what was said into it from the main window. */
  const recorded = useLiveRun(history.opened === null ? (snapshot?.flowRunId ?? null) : null);
  /** The conversation on screen: the live one, or a run opened from the history with the live words under it. */
  const messages = history.opened === null ? live : openedStream(history.opened, live);
  const exchanges =
    snapshot === null || config === null || chosenAgentId === null
      ? []
      : widgetExchanges({
          messages,
          out: Object.values(snapshot.out),
          walking: walkingKeys(snapshot),
          config,
          agentId: chosenAgentId,
        });
  /** The sphere's question whose walk is out: its way stands in the carousel's place meanwhile. */
  const walking = exchanges.find((exchange) => exchange.isOut);
  const chosen = config?.agents.find((agent) => agent.id === chosenAgentId) ?? null;
  /** The files and folders picked for the next question, under the field. */
  const [attachments, setAttachments] = useState<PickedAttachment[]>([]);
  /** How much the chosen agent's model takes; nothing to count against where there is none. */
  const ceiling = chosen === null || config === null ? 0 : packCeiling(agentStands(chosen, config, providers));
  const repeating = useWidgetRepeats({
    isOutOf: () => isOut,
    // A question the backend refused, or a folder gone, is said on the widget's line, and the repeats end.
    put: (question) =>
      widget.ask(question).catch((failure: unknown) => {
        say({
          words: thrownWords(failure),
          act: null,
        });

        return false;
      }),
  });
  /**
   * Packs the picked files under the model's ceiling and puts the question with them, as many times as «x1» says; a
   * question said goes with its recording.
   */
  const send = async (text: string, clips: HeardClip[] = []) => {
    if (chosenAgentId === null) {
      return false;
    }

    const packed =
      attachments.length === 0
        ? []
        : await packAttachments(
            attachments.map((one) => one.path),
            ceiling,
          );
    // A question asked shows its conversation, not the history over it.
    history.close();

    const went = await repeating.send({
      agentId: chosenAgentId,
      text,
      attached: packed,
      clips,
    });

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
    onHeard: (words, clip) => void send(words, [clip]),
    onNote: say,
    onOpenSpeech: () => void openMainWindow(),
  });
  const reading = useReadAloud({
    voiceName: speech.settings.voiceName,
    ukrainianVoiceName: speech.settings.ukrainianVoiceName,
    voiceRate: speech.settings.voiceRate,
    ukrainianVoiceRate: speech.settings.ukrainianVoiceRate,
    onNote: say,
    onOpenSpeech: () => void openMainWindow(),
  });
  /** One recording for the widget; it and a reading stop each other, as in the main window (4l). */
  const player = useSoundPlayer({
    onPlay: reading.stop,
  });
  const aloud: ReadAloud = {
    ...reading,
    read: (id, text) => {
      player.stop();
      reading.read(id, text);
    },
  };
  /** The recordings each question on screen was said with: the record's, said in either window, and those said here. */
  const tracks = questionTracks(widget.heardBy, history.opened ?? recorded);
  /** A sphere with a conversation, or the history open, asks the full height; every other state is as tall as it is. */
  const hasTalk = config !== null && config.agents.length > 0 && (exchanges.length > 0 || history.isOpen);
  const height = hasTalk ? WIDGET_WALK_HEIGHT_PX : measured;

  /** Stops the walk out and the repeats waiting behind it. */
  const stopWalk = () => {
    repeating.drop();
    widget.stop();
  };

  useWidgetKeys({
    voice,
    isWalking: isOut,
    isAsked: history.doomedRun !== null || history.isForgettingAll,
    onStopWalk: stopWalk,
    onStopReading: () => {
      aloud.stop();
      player.stop();
    },
  });

  useFocusLetGo();

  useEndReading({
    exchanges,
    aloud,
    sphereId: chosenAgentId,
    isSilent: widget.isSilent,
  });

  useEffect(() => {
    void listProviders().then(setProviders);
  }, []);

  // The window takes the height its state asks, its top edge where it stands.
  useEffect(() => {
    if (height > 0) {
      void resizeWidget(height);
    }
  }, [height]);

  if (directory === undefined) {
    return <WidgetFrame />;
  }

  if (directory === null || config === null) {
    return (
      <WidgetFrame onMeasure={setMeasured}>
        <OpenProject
          recent={projects.recent}
          trouble={widget.trouble}
          isListOpen={projects.isListOpen}
          onToggleList={projects.toggleList}
          onOpen={projects.open}
          onOpenFolder={projects.openFolder}
          onForget={projects.forget}
        />
      </WidgetFrame>
    );
  }

  return (
    <WidgetFrame onMeasure={hasTalk ? undefined : setMeasured}>
      <WidgetHead
        name={config.name}
        directory={directory}
        recent={projects.recent}
        onOpenList={projects.load}
        onOpen={projects.open}
        onOpenFolder={projects.openFolder}
        onForget={projects.forget}
        quietActs={[
          {
            label: CLOSE_PROJECT_LABEL,
            onPress: () => void widget.close(),
          },
          {
            label: OPEN_MAIN_LABEL,
            onPress: () => void openMainWindow(),
          },
        ]}
      />
      <WidgetTools
        canBeginAgain={!isOut && exchanges.length > 0}
        onBeginAgain={() => {
          history.leave();
          widget.fresh();
        }}
        isHistoryOpen={history.isOpen}
        onToggleHistory={history.toggle}
        isSilent={widget.isSilent}
        onToggleSilent={() => {
          // Silence is set first, so the reading stopped leaves no end waiting to be read in its place.
          void widget.silence(!widget.isSilent);

          if (!widget.isSilent) {
            aloud.stop();
          }
        }}
        onOpenMain={() => void openMainWindow()}
      />
      {config.agents.length === 0 ? (
        <NoAgents onOpenMain={() => void openMainWindow()} />
      ) : (
        <>
          <SphereStage
            agent={chosen}
            links={config.links}
            level={voice.standing === "recording" ? (voice.levels.at(-1) ?? 0) : null}
            isShimmering={isOut || aloud.readingId !== null}
            hasOnward={walking === undefined}
          />
          {walking === undefined || chosenAgentId === null ? (
            <SphereCarousel
              agents={config.agents}
              chosenAgentId={chosenAgentId}
              onChoose={(agentId) => void widget.choose(agentId)}
            />
          ) : (
            <RunStrip agents={config.agents} links={config.links} sphereId={chosenAgentId} exchange={walking} />
          )}
          {history.isOpen ? (
            <RunList
              runs={history.runs}
              openedRunId={history.opened?.id ?? null}
              onOpen={history.open}
              onForget={history.askToForget}
              onForgetAll={history.askToForgetAll}
            />
          ) : (
            exchanges.length > 0 && (
              <WidgetOutput
                exchanges={exchanges}
                agents={config.agents}
                aloud={aloud}
                tracks={tracks}
                player={player}
              />
            )
          )}
          {note !== null && <WidgetNote note={note} />}
          <WidgetField
            agentName={chosen?.name ?? null}
            isWalking={isOut}
            voice={voice}
            attachments={attachments}
            language={
              speech.settings.isMacHearing &&
              speech.settings.macLocale !== null &&
              speech.settings.macSecondLocale !== null
                ? languageCode(speech.settings.macLocale)
                : null
            }
            onSwitchLanguage={() =>
              void speech.save({
                macLocale: speech.settings.macSecondLocale,
                macSecondLocale: speech.settings.macLocale,
              })
            }
            repeats={repeating.repeats}
            repeating={repeating.repeating}
            onAttach={attach}
            onDetach={(path) => setAttachments((was) => was.filter((one) => one.path !== path))}
            onRepeats={repeating.setRepeats}
            onSend={send}
            onStop={stopWalk}
          />
        </>
      )}
      {history.doomedRun !== null && (
        <ForgetRunConfirm run={history.doomedRun} onConfirm={history.confirm} onDismiss={history.dismiss} />
      )}
      {history.isForgettingAll && (
        <ForgetRunsConfirm
          runs={history.endedRuns}
          agentName={chosen?.name}
          onConfirm={history.confirm}
          onDismiss={history.dismiss}
        />
      )}
    </WidgetFrame>
  );
}
