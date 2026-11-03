import { useCallback, useEffect, useRef, useState } from "react";
import { PROVIDER_ASKED_EVERY_MS } from "../../constants";
import { askProvider, listProviders, saveProviderValue, switchProvider } from "../../api";
import type { ProviderAnswer, ProviderState } from "../../../../interfaces";
import type { ProviderDraft } from "../../interfaces";
import type { ProvidersState } from "./interfaces";

/**
 * Providers this machine can call, re-read on mount and after every write; each local one that is not off asked at its
 * address.
 */
export function useProviders(): ProvidersState {
  const [providers, setProviders] = useState<ProviderState[]>([]);
  const [answers, setAnswers] = useState<Record<string, ProviderAnswer>>({});
  const [askingIds, setAskingIds] = useState<string[]>([]);
  // Ref mirrors state so `heard`, called outside the asking render, reads current values and stays one stable callback.
  const known = useRef({
    providers,
    answers,
  });

  known.current = {
    providers,
    answers,
  };

  const load = useCallback(async () => {
    setProviders(await listProviders());
  }, []);

  /**
   * Asks one local provider whether it is running; a silence keeps the last list. `quietly` marks the app's own beat, so
   * the card shows no waiting.
   */
  const ask = useCallback((providerId: string, quietly = false) => {
    if (!quietly) {
      setAskingIds((asking) => [...asking, providerId]);
    }
    void askProvider(providerId)
      .then((reply) =>
        setAnswers((held) => ({
          ...held,
          [providerId]: {
            isAnswering: reply.isAnswering,
            models: reply.isAnswering ? reply.models : (held[providerId]?.models ?? []),
            askedAt: new Date(),
          },
        })),
      )
      .finally(() => setAskingIds((asking) => asking.filter((held) => held !== providerId)));
  }, []);

  // One turned off is not asked at all, neither on the beat nor on a write.
  const localProviders = providers.filter((provider) => provider.kind === "local" && !provider.isOff);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    localProviders.forEach((provider) => ask(provider.id));
  }, [providers, ask]);

  // Asks each local provider on a beat while the project is open; quietly, so `askingIds` stays empty and only a press
  // says «опитуємо».
  useEffect(() => {
    if (localProviders.length === 0) {
      return;
    }

    const beat = window.setInterval(
      () => localProviders.forEach((provider) => ask(provider.id, true)),
      PROVIDER_ASKED_EVERY_MS,
    );

    return () => window.clearInterval(beat);
  }, [providers, ask]);

  /**
   * Records what a turn heard at a local provider's address: a silence is noted, and an answer after a silence triggers a
   * fresh ask, since a turn says that it answered but not what it holds.
   */
  const heard = useCallback(
    (providerId: string, isAnswering: boolean) => {
      if (known.current.providers.find((standing) => standing.id === providerId)?.kind !== "local") {
        return;
      }

      if (isAnswering) {
        if (known.current.answers[providerId]?.isAnswering !== true) {
          ask(providerId);
        }

        return;
      }

      setAnswers((standing) => ({
        ...standing,
        [providerId]: {
          isAnswering: false,
          models: standing[providerId]?.models ?? [],
          askedAt: new Date(),
        },
      }));
    },
    [ask],
  );

  /** Writes only the fields the person typed into; the list is re-read once after all are in. */
  const save = useCallback(
    async (provider: ProviderState, draft: ProviderDraft) => {
      for (const need of provider.needs) {
        const value = need === "key" ? draft.key : draft.address;

        if (value !== null) {
          await saveProviderValue({
            provider,
            need,
            value,
          });
        }
      }

      await load();
    },
    [load],
  );

  /** Turns a provider off or back on at once; an off one's last answer goes, since nobody asks it any more. */
  const switchOff = useCallback(
    async (provider: ProviderState, isOff: boolean) => {
      await switchProvider(provider.id, isOff);

      if (isOff) {
        setAnswers((standing) =>
          Object.fromEntries(Object.entries(standing).filter(([providerId]) => providerId !== provider.id)),
        );
      }

      await load();
    },
    [load],
  );

  return {
    providers,
    answers,
    askingIds,
    ask,
    heard,
    save,
    switchOff,
  };
}
