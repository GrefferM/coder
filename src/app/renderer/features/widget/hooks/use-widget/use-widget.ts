import { useCallback, useEffect, useRef, useState } from "react";
import { changeWidget, peekProject, readWidget } from "../../api";
import { freshWalks, openWalks, putWalk, stopWalks } from "../../../conversation";
import { WALKS_CHANGED_CHANNEL, WIDGET_SETTINGS_CHANGED_CHANNEL } from "../../../../../../contracts";
import { thrownWords } from "../../../../utils/errors";
import type { PackedAttachment, WalkSnapshot, WidgetSettings } from "../../../../../../contracts";
import type { ProjectConfig } from "../../../../interfaces";
import type { WidgetState } from "../../interfaces";

/**
 * The desktop widget (52a, 52b), one with the main window: the project and the sphere are this machine's settings,
 * told to both windows whenever either changes them, and the conversation is the project's one, the chat's, told to
 * both by push. The project is read without being watched, and again whenever the widget comes back.
 */
export function useWidget(): WidgetState {
  const [settings, setSettings] = useState<WidgetSettings | null>(null);
  const [config, setConfig] = useState<ProjectConfig | null>(null);
  const [trouble, setTrouble] = useState<string | null>(null);
  const [walks, setWalks] = useState<WalkSnapshot | null>(null);
  /** The settings after the last change, so a change is laid over them and never over an older copy. */
  const held = useRef<WidgetSettings | null>(null);
  const directory = settings === null ? undefined : settings.directory;

  const change = useCallback(async (patch: Partial<WidgetSettings>) => {
    if (held.current === null) {
      return;
    }

    const next = {
      ...held.current,
      ...patch,
    };

    held.current = next;
    setSettings(next);
    await changeWidget(patch);
  }, []);

  useEffect(() => {
    const take = (told: WidgetSettings) => {
      held.current = told;
      setSettings(told);
    };

    void readWidget().then(take);

    return window.electronApi.subscribe(WIDGET_SETTINGS_CHANGED_CHANNEL, take);
  }, []);

  // The project is read, and its conversation opened with it, now and whenever the widget comes back.
  useEffect(() => {
    if (directory === undefined || directory === null) {
      setConfig(null);
      setWalks(null);

      return;
    }

    let isLive = true;
    const read = () => {
      peekProject(directory, false)
        .then(async (read) => {
          const opened = await openWalks(directory, read);

          if (isLive) {
            setConfig(read);
            setWalks(opened);
            setTrouble(null);
          }
        })
        .catch((failure: unknown) => {
          if (isLive) {
            setTrouble(thrownWords(failure));
          }
        });
    };

    read();
    window.addEventListener("focus", read);

    return () => {
      isLive = false;
      window.removeEventListener("focus", read);
    };
  }, [directory]);

  useEffect(() => window.electronApi.subscribe(WALKS_CHANGED_CHANNEL, setWalks), []);

  const chosenId = directory === undefined || directory === null ? null : (settings?.chosen[directory] ?? null);
  /** A chosen agent since deleted is no choice at all; nothing else is taken in its place. */
  const chosenAgentId = config?.agents.some((agent) => agent.id === chosenId) === true ? chosenId : null;

  const open = useCallback(
    async (next: string) => {
      setTrouble(null);

      // Opened here, the project joins the recent ones; a folder that is no project stops here and says why.
      try {
        await peekProject(next, true);
      } catch (failure) {
        setTrouble(thrownWords(failure));

        return;
      }

      await change({
        directory: next,
      });
    },
    [change],
  );

  const close = useCallback(async () => {
    await change({
      directory: null,
    });
  }, [change]);

  const choose = useCallback(
    async (agentId: string) => {
      if (held.current?.directory === null || held.current === null) {
        return;
      }

      await change({
        chosen: {
          ...held.current.chosen,
          [held.current.directory]: agentId,
        },
      });
    },
    [change],
  );

  const ask = useCallback(async (agentId: string, text: string, attached: PackedAttachment[]) => {
    const answer = await putWalk({
      agentId,
      text,
      attached,
      recordings: [],
    });

    return answer !== null;
  }, []);

  const stop = useCallback(() => {
    void stopWalks();
  }, []);

  const fresh = useCallback(() => {
    void freshWalks();
  }, []);

  return {
    directory,
    config,
    trouble,
    chosenAgentId,
    walks,
    open,
    close,
    choose,
    ask,
    stop,
    fresh,
  };
}
