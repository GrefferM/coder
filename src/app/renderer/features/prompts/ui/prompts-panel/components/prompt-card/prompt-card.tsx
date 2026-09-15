import { Mark, TextAction } from "../../../../../../components";
import { usePressable } from "../../../../../../hooks";
import {
  INTERACTION_HOVER_BACKGROUND_COLOR,
  INTERACTION_HOVER_BORDER_COLOR,
  INTERACTION_TRANSITION,
} from "../../../../../../constants";
import { ukrainianPlural, wordCount } from "../../../../../../utils/text";
import {
  PROMPT_CARD_AGENT_FORMS,
  PROMPT_CARD_BACKGROUND_COLOR,
  PROMPT_CARD_BORDER_COLOR,
  PROMPT_CARD_BORDER_RADIUS_PX,
  PROMPT_CARD_COUNT_COLOR,
  PROMPT_CARD_DELETE_LABEL,
  PROMPT_CARD_EDIT_LABEL,
  PROMPT_CARD_EMPTY_PREVIEW,
  PROMPT_CARD_GAP_PX,
  PROMPT_CARD_HEADER_GAP_PX,
  PROMPT_CARD_META_GAP_PX,
  PROMPT_CARD_MONO_LETTER_SPACING_PX,
  PROMPT_CARD_NAME_COLOR,
  PROMPT_CARD_NAME_FONT_SIZE_PX,
  PROMPT_CARD_NO_AGENTS_LABEL,
  PROMPT_CARD_PADDING_PX,
  PROMPT_CARD_PREVIEW_COLOR,
  PROMPT_CARD_PREVIEW_FONT_SIZE_PX,
  PROMPT_CARD_PREVIEW_LINES,
  PROMPT_CARD_PREVIEW_LINE_HEIGHT,
  PROMPT_CARD_WORD_FORMS,
} from "./constants";
import type { PromptCardProps } from "./interfaces";
import { focusRing } from "../../../../../../utils/focus";

/** Prompt card; the open card adds word count, «Редагувати» and «Видалити». */
export function PromptCard({ prompt, agentCount, isChosen, onChoose, onEdit, onDelete }: PromptCardProps) {
  const { isPointedAt, isFocused, handlers } = usePressable(onChoose);
  const isLit = isPointedAt || isFocused || isChosen;
  const [agentOne, agentFew, agentMany] = PROMPT_CARD_AGENT_FORMS;
  const [wordOne, wordFew, wordMany] = PROMPT_CARD_WORD_FORMS;
  const words = wordCount(prompt.text);

  return (
    <div
      className="d-flex flex-column"
      {...handlers}
      aria-expanded={isChosen}
      style={{
        gap: PROMPT_CARD_GAP_PX,
        padding: PROMPT_CARD_PADDING_PX,
        borderRadius: PROMPT_CARD_BORDER_RADIUS_PX,
        border: `1px solid ${isLit ? INTERACTION_HOVER_BORDER_COLOR : PROMPT_CARD_BORDER_COLOR}`,
        background: isLit ? INTERACTION_HOVER_BACKGROUND_COLOR : PROMPT_CARD_BACKGROUND_COLOR,
        outline: "none",
        boxShadow: focusRing(isFocused),
        transition: INTERACTION_TRANSITION,
        cursor: "pointer",
      }}
    >
      <div
        className="d-flex align-items-center"
        style={{
          gap: PROMPT_CARD_HEADER_GAP_PX,
        }}
      >
        <span
          className="flex-fill text-truncate"
          style={{
            color: PROMPT_CARD_NAME_COLOR,
            fontSize: PROMPT_CARD_NAME_FONT_SIZE_PX,
            fontWeight: 600,
          }}
        >
          {prompt.name}
        </span>
        <Mark color={PROMPT_CARD_COUNT_COLOR} spacing={PROMPT_CARD_MONO_LETTER_SPACING_PX} className="text-nowrap">
          {agentCount === 0
            ? PROMPT_CARD_NO_AGENTS_LABEL
            : `${agentCount} ${ukrainianPlural(agentCount, agentOne, agentFew, agentMany)}`}
        </Mark>
      </div>
      <span
        style={{
          display: "-webkit-box",
          WebkitLineClamp: PROMPT_CARD_PREVIEW_LINES,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          color: PROMPT_CARD_PREVIEW_COLOR,
          fontSize: PROMPT_CARD_PREVIEW_FONT_SIZE_PX,
          lineHeight: PROMPT_CARD_PREVIEW_LINE_HEIGHT,
          overflowWrap: "anywhere",
        }}
      >
        {prompt.text.trim() || PROMPT_CARD_EMPTY_PREVIEW}
      </span>
      {isChosen && (
        <div
          className="d-flex align-items-center"
          style={{
            gap: PROMPT_CARD_META_GAP_PX,
          }}
        >
          <Mark spacing={PROMPT_CARD_MONO_LETTER_SPACING_PX} className="text-nowrap">
            {`${words} ${ukrainianPlural(words, wordOne, wordFew, wordMany)}`}
          </Mark>
          <span className="flex-fill" />
          <TextAction label={PROMPT_CARD_DELETE_LABEL} isDanger onClick={onDelete} />
          <TextAction label={PROMPT_CARD_EDIT_LABEL} onClick={onEdit} />
        </div>
      )}
    </div>
  );
}
