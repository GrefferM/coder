import { useState } from "react";
import { CatalogueAction, Words } from "../../../../components";
import { useInteraction } from "../../../../hooks";
import { INTERACTION_HOVER_BORDER_COLOR, INTERACTION_TRANSITION } from "../../../../constants";
import { PromptCard } from "./components";
import {
  PROMPTS_PANEL_EMPTY_COLOR,
  PROMPTS_PANEL_EMPTY_GAP_PX,
  PROMPTS_PANEL_EMPTY_ICON_COLOR,
  PROMPTS_PANEL_EMPTY_ICON_SIZE_PX,
  PROMPTS_PANEL_EMPTY_LABEL,
  PROMPTS_PANEL_EMPTY_PADDING_PX,
  PROMPTS_PANEL_FOOTER_BORDER_COLOR,
  PROMPTS_PANEL_GAP_PX,
  PROMPTS_PANEL_NEW_LABEL,
  PROMPTS_PANEL_PADDING_PX,
  PROMPTS_PANEL_SEARCH_BACKGROUND_COLOR,
  PROMPTS_PANEL_SEARCH_BORDER_COLOR,
  PROMPTS_PANEL_SEARCH_BORDER_RADIUS_PX,
  PROMPTS_PANEL_SEARCH_COLOR,
  PROMPTS_PANEL_SEARCH_EMPTY_LABEL,
  PROMPTS_PANEL_SEARCH_FONT_SIZE_PX,
  PROMPTS_PANEL_SEARCH_GAP_PX,
  PROMPTS_PANEL_SEARCH_ICON_COLOR,
  PROMPTS_PANEL_SEARCH_ICON_SIZE_PX,
  PROMPTS_PANEL_SEARCH_PADDING,
  PROMPTS_PANEL_SEARCH_PLACEHOLDER,
} from "./constants";
import type { PromptsPanelProps } from "./interfaces";

/** Prompt library — search, cards, footer action; editing opens across the working area. */
export function PromptsPanel({
  prompts,
  agents,
  chosenPromptId,
  onChosenPromptIdChange,
  onEditPrompt,
  onDeletePrompt,
}: PromptsPanelProps) {
  const [search, setSearch] = useState("");
  const searchBox = useInteraction();
  const found = prompts.filter((prompt) => prompt.name.toLowerCase().includes(search.trim().toLowerCase()));

  if (prompts.length === 0) {
    return (
      <div
        className="d-flex flex-column flex-fill align-items-center justify-content-center text-center"
        style={{
          gap: PROMPTS_PANEL_EMPTY_GAP_PX,
          padding: PROMPTS_PANEL_EMPTY_PADDING_PX,
        }}
      >
        <svg
          width={PROMPTS_PANEL_EMPTY_ICON_SIZE_PX}
          height={PROMPTS_PANEL_EMPTY_ICON_SIZE_PX}
          viewBox="0 0 24 24"
          fill="none"
          stroke={PROMPTS_PANEL_EMPTY_ICON_COLOR}
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 3.5h8l4 4v13H6Z" />
          <path d="M14 3.5v4h4" />
          <path d="M9 12h6M9 16h4" />
        </svg>
        <Words isQuiet>{PROMPTS_PANEL_EMPTY_LABEL}</Words>
        <CatalogueAction label={PROMPTS_PANEL_NEW_LABEL} isFilled onClick={() => onEditPrompt(null)} />
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
          gap: PROMPTS_PANEL_GAP_PX,
          padding: PROMPTS_PANEL_PADDING_PX,
          overflowY: "auto",
        }}
      >
        <label
          className="d-flex align-items-center flex-shrink-0"
          onMouseEnter={searchBox.handlers.onMouseEnter}
          onMouseLeave={searchBox.handlers.onMouseLeave}
          style={{
            gap: PROMPTS_PANEL_SEARCH_GAP_PX,
            padding: PROMPTS_PANEL_SEARCH_PADDING,
            borderRadius: PROMPTS_PANEL_SEARCH_BORDER_RADIUS_PX,
            border: `1px solid ${searchBox.isPointedAt ? INTERACTION_HOVER_BORDER_COLOR : PROMPTS_PANEL_SEARCH_BORDER_COLOR}`,
            background: PROMPTS_PANEL_SEARCH_BACKGROUND_COLOR,
            transition: INTERACTION_TRANSITION,
          }}
        >
          <svg
            width={PROMPTS_PANEL_SEARCH_ICON_SIZE_PX}
            height={PROMPTS_PANEL_SEARCH_ICON_SIZE_PX}
            viewBox="0 0 24 24"
            fill="none"
            stroke={PROMPTS_PANEL_SEARCH_ICON_COLOR}
            strokeWidth="2"
            strokeLinecap="round"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m16.5 16.5 4 4" />
          </svg>
          <input
            spellCheck={false}
            value={search}
            placeholder={PROMPTS_PANEL_SEARCH_PLACEHOLDER}
            onChange={(event) => setSearch(event.target.value)}
            className="flex-fill font-monospace"
            style={{
              border: "none",
              background: "transparent",
              padding: 0,
              outline: "none",
              color: PROMPTS_PANEL_SEARCH_COLOR,
              fontSize: PROMPTS_PANEL_SEARCH_FONT_SIZE_PX,
            }}
          />
        </label>
        {found.length === 0 && (
          <span
            style={{
              color: PROMPTS_PANEL_EMPTY_COLOR,
              fontSize: PROMPTS_PANEL_SEARCH_FONT_SIZE_PX,
            }}
          >
            {PROMPTS_PANEL_SEARCH_EMPTY_LABEL}
          </span>
        )}
        {found.map((prompt) => (
          <PromptCard
            key={prompt.id}
            prompt={prompt}
            agentCount={agents.filter((agent) => agent.promptId === prompt.id).length}
            isChosen={prompt.id === chosenPromptId}
            onChoose={() => onChosenPromptIdChange(prompt.id)}
            onEdit={() => onEditPrompt(prompt.id)}
            onDelete={() => onDeletePrompt(prompt.id)}
          />
        ))}
      </div>
      <div
        className="d-flex flex-shrink-0"
        style={{
          padding: PROMPTS_PANEL_PADDING_PX,
          borderTop: `1px solid ${PROMPTS_PANEL_FOOTER_BORDER_COLOR}`,
        }}
      >
        <CatalogueAction label={PROMPTS_PANEL_NEW_LABEL} onClick={() => onEditPrompt(null)} />
      </div>
    </div>
  );
}
