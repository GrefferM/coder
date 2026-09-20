import { useCallback, useEffect, useRef, useState } from "react";
import { PROVIDER_ASKED_EVERY_MS } from "../../constants";
import { askProvider, listProviders, saveProviderValue } from "../../api";
import type { ProviderAnswer, ProviderState } from "../../../../interfaces";
import type { ProviderDraft } from "../../interfaces";
import type { ProvidersState } from "./interfaces";

/** Providers this machine can call, re-read on mount and after every write; each local one asked at its address. */
export function useProviders(): ProvidersState {
  const [providers, setProviders] = useState<ProviderState[]>([]);
  const [answers, setAnswers] = useState<Record<string, ProviderAnswer>>({});
  const [askingIds, setAskingIds] = useState<string[]>([]);
  // Ref mirrors state: a turn's answer arrives outside the render that asked, so `heard` reads what is known at that
  // moment instead of closing over it — and stays the one callback, whoever holds it and however long.
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
   * Asks one local provider whether it is running; a silence keeps the list it last gave. Asked `quietly`, it is the
   * app's own beat rather than the person's press, so the card says nothing about waiting for it.
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

  const localProviders = providers.filter((provider) => provider.kind === "local");

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    localProviders.forEach((provider) => ask(provider.id));
  }, [providers, ask]);

  // A local provider is asked on a beat for as long as the project stands open, so a machine that died is
  // known before a turn tries it. Quietly: `askingIds` stays empty, and only the person's own press says «опитуємо».
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
   * What a turn heard at a local provider's address: a silence is written down, and one that answered after a silence
   * is asked again, since a turn learns that it answered but not what it holds.
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

  /** Writes every field the person typed into, and only those; the list is read again once, when all of them are in. */
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

  return {
    providers,
    answers,
    askingIds,
    ask,
    heard,
    save,
  };
}
