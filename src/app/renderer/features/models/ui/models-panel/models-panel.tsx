import { useState } from "react";
import { CatalogueAction, Words } from "../../../../components";
import { useInteraction } from "../../../../hooks";
import { INTERACTION_HOVER_BORDER_COLOR, INTERACTION_TRANSITION } from "../../../../constants";
import { ModelForm, ModelRow } from "./components";
import {
  MODELS_PANEL_EMPTY_COLOR,
  MODELS_PANEL_EMPTY_FONT_SIZE_PX,
  MODELS_PANEL_EMPTY_GAP_PX,
  MODELS_PANEL_EMPTY_ICON_COLOR,
  MODELS_PANEL_EMPTY_ICON_SIZE_PX,
  MODELS_PANEL_EMPTY_LABEL,
  MODELS_PANEL_EMPTY_PADDING_PX,
  MODELS_PANEL_FOOTER_BORDER_COLOR,
  MODELS_PANEL_GAP_PX,
  MODELS_PANEL_NEW_LABEL,
  MODELS_PANEL_PADDING_PX,
  MODELS_PANEL_SEARCH_BACKGROUND_COLOR,
  MODELS_PANEL_SEARCH_BORDER_COLOR,
  MODELS_PANEL_SEARCH_BORDER_RADIUS_PX,
  MODELS_PANEL_SEARCH_COLOR,
  MODELS_PANEL_SEARCH_EMPTY_LABEL,
  MODELS_PANEL_SEARCH_FONT_SIZE_PX,
  MODELS_PANEL_SEARCH_GAP_PX,
  MODELS_PANEL_SEARCH_ICON_COLOR,
  MODELS_PANEL_SEARCH_ICON_SIZE_PX,
  MODELS_PANEL_SEARCH_PADDING,
  MODELS_PANEL_SEARCH_PLACEHOLDER,
} from "./constants";
import { modelInstalled } from "../../logic";
import type { ModelsPanelProps } from "./interfaces";
import { focusRing } from "../../../../utils/focus";

/** Model catalogue; the open row carries «Редагувати» and «Видалити», confirmed over the canvas. */
export function ModelsPanel({
  providers,
  providerAnswers,
  saved,
  models,
  agents,
  openModelId,
  isMending,
  form,
  onOpenForm,
  onFormChange,
  onSaveForm,
  onCancelForm,
  onArmedModelIdChange,
}: ModelsPanelProps) {
  const [search, setSearch] = useState("");
  const [chosenModelId, setChosenModelId] = useState<string | null>(null);
  const searchBox = useInteraction();
  const found = models.filter((model) => model.title.toLowerCase().includes(search.trim().toLowerCase()));

  if (form !== null) {
    return (
      <ModelForm
        providers={providers}
        values={form}
        saved={saved}
        isNew={openModelId === "new"}
        isMending={isMending}
        onChange={onFormChange}
        onSave={onSaveForm}
        onCancel={onCancelForm}
      />
    );
  }

  if (models.length === 0) {
    return (
      <div
        className="d-flex flex-column flex-fill align-items-center justify-content-center text-center"
        style={{
          gap: MODELS_PANEL_EMPTY_GAP_PX,
          padding: MODELS_PANEL_EMPTY_PADDING_PX,
        }}
      >
        <svg
          width={MODELS_PANEL_EMPTY_ICON_SIZE_PX}
          height={MODELS_PANEL_EMPTY_ICON_SIZE_PX}
          viewBox="0 0 24 24"
          fill="none"
          stroke={MODELS_PANEL_EMPTY_ICON_COLOR}
          strokeWidth="1.3"
          strokeLinejoin="round"
        >
          <path d="M4 8.5 12 4.5l8 4-8 4-8-4Z" />
          <path d="M4 12.5 12 16.5l8-4" />
        </svg>
        <Words isQuiet>{MODELS_PANEL_EMPTY_LABEL}</Words>
        <CatalogueAction label={MODELS_PANEL_NEW_LABEL} isFilled onClick={() => onOpenForm("new")} />
      </div>
    );
  }

  return (
    <div
      className="d-flex flex-column flex-fill"
      style={{
        minHeight: 0,
      }}
    >
      <div
        className="d-flex flex-column flex-fill"
        style={{
          gap: MODELS_PANEL_GAP_PX,
          padding: MODELS_PANEL_PADDING_PX,
          overflowY: "auto",
        }}
      >
        <label
          className="d-flex align-items-center flex-shrink-0"
          onMouseEnter={searchBox.handlers.onMouseEnter}
          onMouseLeave={searchBox.handlers.onMouseLeave}
          style={{
            gap: MODELS_PANEL_SEARCH_GAP_PX,
            padding: MODELS_PANEL_SEARCH_PADDING,
            borderRadius: MODELS_PANEL_SEARCH_BORDER_RADIUS_PX,
            border: `1px solid ${searchBox.isLit ? INTERACTION_HOVER_BORDER_COLOR : MODELS_PANEL_SEARCH_BORDER_COLOR}`,
            background: MODELS_PANEL_SEARCH_BACKGROUND_COLOR,
            boxShadow: focusRing(searchBox.isFocused),
            transition: INTERACTION_TRANSITION,
          }}
        >
          <svg
            width={MODELS_PANEL_SEARCH_ICON_SIZE_PX}
            height={MODELS_PANEL_SEARCH_ICON_SIZE_PX}
            viewBox="0 0 24 24"
            fill="none"
            stroke={MODELS_PANEL_SEARCH_ICON_COLOR}
            strokeWidth="2"
            strokeLinecap="round"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m16.5 16.5 4 4" />
          </svg>
          <input
            spellCheck={false}
            value={search}
            placeholder={MODELS_PANEL_SEARCH_PLACEHOLDER}
            onChange={(event) => setSearch(event.target.value)}
            onFocus={searchBox.handlers.onFocus}
            onBlur={searchBox.handlers.onBlur}
            className="flex-fill font-monospace"
            style={{
              border: "none",
              background: "transparent",
              padding: 0,
              outline: "none",
              color: MODELS_PANEL_SEARCH_COLOR,
              fontSize: MODELS_PANEL_SEARCH_FONT_SIZE_PX,
            }}
          />
        </label>
        {found.length === 0 && (
          <span
            style={{
              color: MODELS_PANEL_EMPTY_COLOR,
              fontSize: MODELS_PANEL_EMPTY_FONT_SIZE_PX,
            }}
          >
            {MODELS_PANEL_SEARCH_EMPTY_LABEL}
          </span>
        )}
        {found.map((model) => (
          <ModelRow
            key={model.id}
            model={model}
            agents={agents.filter((agent) => agent.modelId === model.id)}
            isProviderKnown={providers.some((provider) => provider.id === model.provider)}
            isInstalled={modelInstalled(model, providers, providerAnswers)}
            isOpen={model.id === chosenModelId}
            onOpen={() => setChosenModelId(model.id === chosenModelId ? null : model.id)}
            onEdit={() => onOpenForm(model.id)}
            onDelete={() => onArmedModelIdChange(model.id)}
          />
        ))}
      </div>
      <div
        className="d-flex flex-shrink-0"
        style={{
          padding: MODELS_PANEL_PADDING_PX,
          borderTop: `1px solid ${MODELS_PANEL_FOOTER_BORDER_COLOR}`,
        }}
      >
        <CatalogueAction label={MODELS_PANEL_NEW_LABEL} onClick={() => onOpenForm("new")} />
      </div>
    </div>
  );
}
