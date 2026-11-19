import { useCallback, useEffect, useRef, useState } from "react";
import { chooseProjectDirectory, forgetProject, listRecentProjects } from "../../features/project";
import { listProviders } from "../../features/providers";
import { hearingChoice, useReadAloud, useSpeech, useVoiceAsk } from "../../features/speech";
import {
  openedStream,
  packAttachments,
  packCeiling,
  pickAttachment,
  refusedPickNote,
} from "../../features/conversation";
import {
  CLOSE_PROJECT_LABEL,
  NoAgents,
  OPEN_MAIN_LABEL,
  OpenProject,
  RunList,
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
  useWidget,
  useWidgetNote,
  useWidgetRepeats,
  languageCode,
  widgetExchanges,
} from "../../features/widget";
import { ForgetRunConfirm, ForgetRunsConfirm } from "../../features/record";
import { WIDGET_LISTEN_CHANNEL, agentStands, chatStream, isWalking } from "../../../../contracts";
import { thrownWords } from "../../utils/errors";
import { useWindowKeydown } from "../../hooks";
import type { PickedAttachment, ProjectEntry, ProviderState } from "../../interfaces";
import type { RunRow } from "../../../../contracts";

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
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  /** The run a cross asked to delete, awaiting the answer. */
  const [doomedRun, setDoomedRun] = useState<RunRow | null>(null);
  const [isForgettingAll, setIsForgettingAll] = useState(false);
  /** What a state with no height of its own measures, as the frame tells it. */
  const [measured, setMeasured] = useState(0);
  const { directory, config, chosenAgentId } = widget;
  /** The project's one conversation, the chat's: a walk out anywhere in it holds the field, as in the chat. */
  const snapshot = widget.walks;
  const isOut = snapshot !== null && isWalking(snapshot);
  const live = snapshot === null ? [] : chatStream(snapshot);
  /** The conversation on screen: the live one, or a run opened from the history with the live words under it. */
  const messages = widget.opened === null ? live : openedStream(widget.opened, live);
  const exchanges =
    snapshot === null || config === null || chosenAgentId === null
      ? []
      : widgetExchanges(messages, Object.values(snapshot.out), config, chosenAgentId);
  const chosen = config?.agents.find((agent) => agent.id === chosenAgentId) ?? null;
  /** The files and folders picked for the next question, under the field. */
  const [attachments, setAttachments] = useState<PickedAttachment[]>([]);
  /** How much the chosen agent's model takes; nothing to count against where there is none. */
  const ceiling = chosen === null || config === null ? 0 : packCeiling(agentStands(chosen, config, providers));
  const repeating = useWidgetRepeats({
    isOutOf: () => isOut,
    // A question the backend refused, or a folder gone, is said on the widget's line, and the repeats end.
    put: (agentId, text, attached) =>
      widget.ask(agentId, text, attached).catch((failure: unknown) => {
        say({
          words: thrownWords(failure),
          act: null,
        });

        return false;
      }),
  });
  /** Packs the picked files under the model's ceiling and puts the question with them, as many times as «x1» says. */
  const send = async (text: string) => {
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
    setIsHistoryOpen(false);

    const went = await repeating.send(chosenAgentId, text, packed);

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
  });
  const aloud = useReadAloud({
    voiceName: speech.settings.voiceName,
    ukrainianVoiceName: speech.settings.ukrainianVoiceName,
    voiceRate: speech.settings.voiceRate,
    ukrainianVoiceRate: speech.settings.ukrainianVoiceRate,
    onNote: say,
    onOpenSpeech: () => void openMainWindow(),
  });
  /** A sphere with a conversation, or the history open, asks the full height; every other state is as tall as it is. */
  const hasTalk = config !== null && config.agents.length > 0 && (exchanges.length > 0 || isHistoryOpen);
  /** The history lists the chosen sphere's runs only. */
  const sphereRuns = widget.runs.filter((run) => run.startedByAgentId === chosenAgentId);
  const endedSphereRuns = sphereRuns.filter((run) => run.endedAt !== null);
  /** Deletes runs once answered; a refusal is said on the widget's line. */
  const forgetRuns = (runIds: string[]) => {
    setDoomedRun(null);
    setIsForgettingAll(false);
    void widget.forgetRuns(runIds).catch((failure: unknown) =>
      say({
        words: thrownWords(failure),
        act: null,
      }),
    );
  };
  const height = hasTalk ? WIDGET_WALK_HEIGHT_PX : measured;

  /** Stops the walk out and the repeats waiting behind it. */
  const stopWalk = () => {
    repeating.drop();
    widget.stop();
  };

  // Escape stops what goes on: a take being said is dropped unheard, a walk out is stopped, a reading is silenced. A
  // dialog open takes Escape for itself.
  useWindowKeydown(doomedRun === null && !isForgettingAll, (event) => {
    if (event.key !== "Escape") {
      return;
    }

    if (voice.standing === "recording") {
      voice.cancel();

      return;
    }

    if (isOut) {
      stopWalk();
    }

    aloud.stop();
  });

  useEndReading({
    exchanges,
    aloud,
    sphereId: chosenAgentId,
    isSilent: widget.isSilent,
  });

  // The listening shortcut, pressed in any app: a question begins, the one being said ends and goes, and one being
  // heard is left to its words.
  const listening = useRef(voice);

  listening.current = voice;

  useEffect(
    () =>
      window.electronApi.subscribe(WIDGET_LISTEN_CHANNEL, () => {
        if (listening.current.standing !== "hearing") {
          listening.current.press();
        }
      }),
    [],
  );

  // The history open is read again with every change of the conversation, so a run just asked stands in it.
  const { listRuns } = widget;

  useEffect(() => {
    if (isHistoryOpen) {
      void listRuns();
    }
  }, [isHistoryOpen, snapshot, listRuns]);

  // A history left with no run of the sphere, as after deleting them all, folds away: the widget stands as at rest.
  useEffect(() => {
    if (isHistoryOpen && sphereRuns.length === 0) {
      setIsHistoryOpen(false);
    }
  }, [isHistoryOpen, sphereRuns.length]);

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
  const forget = useCallback(
    async (gone: string) => {
      await forgetProject(gone);
      loadRecent();
    },
    [loadRecent],
  );
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
          onForget={(gone) => void forget(gone)}
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
        onOpenList={loadRecent}
        onOpen={(picked) => void open(picked)}
        onOpenFolder={() => void openFolder()}
        onForget={(gone) => void forget(gone)}
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
          setIsHistoryOpen(false);
          widget.fresh();
        }}
        isHistoryOpen={isHistoryOpen}
        onToggleHistory={() => {
          if (isHistoryOpen) {
            setIsHistoryOpen(false);

            return;
          }

          // A sphere with no runs has no history to show, and the widget stays as it is.
          void widget.listRuns().then((rows) => {
            if (rows.some((run) => run.startedByAgentId === chosenAgentId)) {
              setIsHistoryOpen(true);
            }
          });
        }}
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
          />
          <SphereCarousel
            agents={config.agents}
            chosenAgentId={chosenAgentId}
            onChoose={(agentId) => void widget.choose(agentId)}
          />
          {isHistoryOpen ? (
            <RunList
              runs={sphereRuns}
              openedRunId={widget.opened?.id ?? null}
              onOpen={(runId) => {
                setIsHistoryOpen(false);
                void widget.openRun(runId);
              }}
              onForget={setDoomedRun}
              onForgetAll={() => setIsForgettingAll(true)}
            />
          ) : (
            exchanges.length > 0 && <WidgetOutput exchanges={exchanges} agents={config.agents} aloud={aloud} />
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
      {doomedRun !== null && (
        <ForgetRunConfirm
          run={doomedRun}
          onConfirm={() => forgetRuns([doomedRun.id])}
          onDismiss={() => setDoomedRun(null)}
        />
      )}
      {isForgettingAll && (
        <ForgetRunsConfirm
          runs={endedSphereRuns}
          onConfirm={() => forgetRuns(endedSphereRuns.map((run) => run.id))}
          onDismiss={() => setIsForgettingAll(false)}
        />
      )}
    </WidgetFrame>
  );
}
