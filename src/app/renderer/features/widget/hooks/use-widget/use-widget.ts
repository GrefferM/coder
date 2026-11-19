import { useCallback, useEffect, useRef, useState } from "react";
import {
  freshWidgetWalk,
  peekProject,
  putWidgetWalk,
  readWidget,
  saveWidget,
  stopWidgetWalk,
  widgetWalks,
} from "../../api";
import { WIDGET_WALK_CHANGED_CHANNEL } from "../../../../../../contracts";
import { thrownWords } from "../../../../utils/errors";
import type { PackedAttachment, WalkSnapshot, WidgetSettings } from "../../../../../../contracts";
import type { ProjectConfig } from "../../../../interfaces";
import type { WidgetState } from "../../interfaces";

/**
 * The desktop widget (52a, 52b): this machine's settings for it, its project read without being watched, the sphere
 * chosen in it, and every sphere's walks, told again by push.
 */
export function useWidget(): WidgetState {
  const [settings, setSettings] = useState<WidgetSettings | null>(null);
  const [config, setConfig] = useState<ProjectConfig | null>(null);
  const [trouble, setTrouble] = useState<string | null>(null);
  const [walks, setWalks] = useState<Record<string, WalkSnapshot>>({});
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
    await saveWidget(next);
  }, []);

  useEffect(() => {
    void readWidget().then((read) => {
      held.current = read;
      setSettings(read);
    });
  }, []);

  // The project is read again whenever the widget comes back, since it is not watched.
  useEffect(() => {
    if (directory === undefined || directory === null) {
      setConfig(null);
      setWalks({});

      return;
    }

    let isLive = true;
    const read = () => {
      peekProject(directory)
        .then((read) => {
          if (isLive) {
            setConfig(read);
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
    void widgetWalks(directory).then((told) => {
      if (isLive) {
        setWalks(Object.fromEntries(told.map((walk) => [walk.agentId, walk.snapshot])));
      }
    });
    window.addEventListener("focus", read);

    return () => {
      isLive = false;
      window.removeEventListener("focus", read);
    };
  }, [directory]);

  useEffect(
    () =>
      window.electronApi.subscribe(WIDGET_WALK_CHANGED_CHANNEL, (walk) =>
        setWalks((was) => ({
          ...was,
          [walk.agentId]: walk.snapshot,
        })),
      ),
    [],
  );

  const chosenId = directory === undefined || directory === null ? null : (settings?.chosen[directory] ?? null);
  /** A chosen agent since deleted is no choice at all; nothing else is taken in its place. */
  const chosenAgentId = config?.agents.some((agent) => agent.id === chosenId) === true ? chosenId : null;

  const open = useCallback(
    async (next: string) => {
      setTrouble(null);
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

  const ask = useCallback(
    async (text: string, attached: PackedAttachment[]) => {
      if (directory === undefined || directory === null || chosenAgentId === null) {
        return false;
      }

      // Read afresh, so the walk goes along the lines as the folder holds them now.
      const read = await peekProject(directory);

      setConfig(read);

      const answer = await putWidgetWalk({
        directory,
        config: read,
        agentId: chosenAgentId,
        text,
        attached,
      });

      return answer !== null;
    },
    [directory, chosenAgentId],
  );

  const stop = useCallback(() => {
    if (chosenAgentId !== null) {
      void stopWidgetWalk(chosenAgentId);
    }
  }, [chosenAgentId]);

  const fresh = useCallback(() => {
    if (chosenAgentId !== null) {
      void freshWidgetWalk(chosenAgentId);
    }
  }, [chosenAgentId]);

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
