import { useState } from "react";
import { agentsCountLabel } from "../../../../words";
import { modelsCountLabel, providerMissing } from "../../words";
import { PROJECT_FILE_NAME } from "../../../../../../contracts";
import { ProviderCard, ProviderRow } from "./components";
import {
  PROVIDERS_HINT_COLOR,
  PROVIDERS_LIST_GAP_PX,
  PROVIDERS_LIST_PADDING,
  PROVIDERS_NOTE_AFTER,
  PROVIDERS_NOTE_BACKGROUND_COLOR,
  PROVIDERS_NOTE_BEFORE,
  PROVIDERS_NOTE_BORDER_COLOR,
  PROVIDERS_NOTE_BORDER_RADIUS_PX,
  PROVIDERS_NOTE_CARD_PADDING,
  PROVIDERS_NOTE_COLOR,
  PROVIDERS_NOTE_FILE_COLOR,
  PROVIDERS_NOTE_FONT_SIZE_PX,
  PROVIDERS_NOTE_GAP_PX,
  PROVIDERS_NOTE_ICON_SIZE_PX,
  PROVIDERS_NOTE_LINE_HEIGHT,
  PROVIDERS_NOTE_PADDING,
  PROVIDERS_RULE_MARGIN,
  PROVIDERS_UNSET_LABEL,
  PROVIDER_ANSWERING_LABEL,
  PROVIDER_ASKING_LABEL,
  PROVIDER_FACTS_SEPARATOR,
  PROVIDER_SILENT_LABEL,
} from "./constants";
import { NOTHING_TYPED, PROVIDER_KEY_WRITTEN_LABEL, PROVIDER_REMOTE_LABEL } from "../../constants";
import { Hairline, Mark } from "../../../../components";
import type { ProviderState } from "../../../../interfaces";
import type { ProviderDraft } from "../../interfaces";
import type { ProvidersPanelProps } from "./interfaces";

/** Fixed provider rows — filled first, untouched below; one open at a time. */
export function ProvidersPanel({
  providers,
  answers,
  askingIds,
  models,
  agents,
  onAsk,
  onSave,
  onTakeUpModel,
}: ProvidersPanelProps) {
  const [openProviderId, setOpenProviderId] = useState<string | null>(null);
  // Empty until a field is typed into or cleared; an untouched key is kept.
  const [draft, setDraft] = useState<ProviderDraft>(NOTHING_TYPED);

  /** Set up when everything it asks for is present; a local provider always is, having a customary address. */
  const isFilled = (provider: ProviderState) => providerMissing(provider).length === 0;
  const isSilent = (provider: ProviderState) =>
    provider.kind === "local" && answers[provider.id]?.isAnswering === false;

  /** Project counts on a provider, read off the project itself. */
  function counts(provider: ProviderState): string[] {
    const own = models.filter((model) => model.provider === provider.id);

    if (own.length === 0) {
      return [];
    }

    const ownIds = new Set(own.map((model) => model.id));
    const standing = agents.filter((agent) => ownIds.has(agent.modelId));

    return [modelsCountLabel(own.length), agentsCountLabel(standing.length)];
  }

  /**
   * Local: whether it answers. Remote: key written, or its kind and what is missing. Counts follow where models stand
   * on it.
   */
  function facts(provider: ProviderState): string {
    const answer = answers[provider.id];
    const local =
      answer === undefined
        ? PROVIDER_ASKING_LABEL
        : answer.isAnswering
          ? PROVIDER_ANSWERING_LABEL
          : PROVIDER_SILENT_LABEL;
    const missing = providerMissing(provider);
    const remote = missing.length === 0 ? [PROVIDER_KEY_WRITTEN_LABEL] : [PROVIDER_REMOTE_LABEL, ...missing];
    const head = provider.kind === "local" ? [local] : remote;

    return [...head, ...counts(provider)].join(PROVIDER_FACTS_SEPARATOR);
  }

  function open(provider: ProviderState) {
    setOpenProviderId(provider.id);
    setDraft(NOTHING_TYPED);
  }

  function close() {
    setOpenProviderId(null);
    setDraft(NOTHING_TYPED);
  }

  /**
   * Untouched (`null`) fields are not written: the key field shows only a hint, so a field left alone means
   * «unchanged»; taking a key off is the cross, then save writes the empty value.
   */
  async function save(provider: ProviderState) {
    if (draft.key !== null || draft.address !== null) {
      await onSave(provider, draft);
    }

    close();
  }

  function rowFor(provider: ProviderState) {
    if (provider.id === openProviderId) {
      return (
        <ProviderCard
          key={provider.id}
          provider={provider}
          value={draft}
          models={models.filter((model) => model.provider === provider.id)}
          answer={answers[provider.id] ?? null}
          isAsking={askingIds.includes(provider.id)}
          onAsk={() => onAsk(provider.id)}
          onChange={(need, typed) =>
            setDraft((standing) => ({
              ...standing,
              [need]: typed,
            }))
          }
          onCancel={close}
          onSave={() => void save(provider)}
          onTakeUpModel={(title) => onTakeUpModel(provider.id, title)}
        />
      );
    }

    return (
      <ProviderRow
        key={provider.id}
        name={provider.name}
        facts={facts(provider)}
        isFilled={isFilled(provider)}
        isSilent={isSilent(provider)}
        onOpen={() => open(provider)}
      />
    );
  }

  const filled = providers.filter(isFilled);
  const unset = providers.filter((provider) => !isFilled(provider));

  return (
    <div
      className="d-flex flex-column flex-fill"
      style={{
        minHeight: 0,
      }}
    >
      <div
        className="flex-shrink-0"
        style={{
          padding: PROVIDERS_NOTE_PADDING,
        }}
      >
        <div
          className="d-flex align-items-start"
          style={{
            gap: PROVIDERS_NOTE_GAP_PX,
            padding: PROVIDERS_NOTE_CARD_PADDING,
            borderRadius: PROVIDERS_NOTE_BORDER_RADIUS_PX,
            border: `1px solid ${PROVIDERS_NOTE_BORDER_COLOR}`,
            background: PROVIDERS_NOTE_BACKGROUND_COLOR,
          }}
        >
          <svg
            width={PROVIDERS_NOTE_ICON_SIZE_PX}
            height={PROVIDERS_NOTE_ICON_SIZE_PX}
            viewBox="0 0 24 24"
            fill="none"
            stroke={PROVIDERS_NOTE_COLOR}
            strokeWidth="2"
            strokeLinecap="round"
            className="flex-shrink-0"
          >
            <rect x="5" y="11" width="14" height="9" rx="2" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" />
          </svg>
          <span
            style={{
              color: PROVIDERS_NOTE_COLOR,
              fontSize: PROVIDERS_NOTE_FONT_SIZE_PX,
              lineHeight: PROVIDERS_NOTE_LINE_HEIGHT,
            }}
          >
            {PROVIDERS_NOTE_BEFORE}
            <code
              className="font-monospace"
              style={{
                color: PROVIDERS_NOTE_FILE_COLOR,
              }}
            >
              {PROJECT_FILE_NAME}
            </code>
            {PROVIDERS_NOTE_AFTER}
          </span>
        </div>
      </div>

      <div
        className="d-flex flex-column flex-fill"
        style={{
          gap: PROVIDERS_LIST_GAP_PX,
          padding: PROVIDERS_LIST_PADDING,
          minHeight: 0,
          overflowY: "auto",
        }}
      >
        {filled.map(rowFor)}

        {filled.length > 0 && unset.length > 0 && (
          <>
            <Hairline margin={PROVIDERS_RULE_MARGIN} className="flex-shrink-0" />
            <Mark color={PROVIDERS_HINT_COLOR} isUpperCase={false} className="flex-shrink-0">
              {PROVIDERS_UNSET_LABEL}
            </Mark>
          </>
        )}

        {unset.map(rowFor)}
      </div>
    </div>
  );
}
