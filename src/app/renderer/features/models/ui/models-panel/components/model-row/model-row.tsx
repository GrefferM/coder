import { Dot, Mark, TextAction } from "../../../../../../components";
import { usePressable } from "../../../../../../hooks";
import {
  INTERACTION_HOVER_BACKGROUND_COLOR,
  INTERACTION_HOVER_BORDER_COLOR,
  INTERACTION_HOVER_TEXT_COLOR,
  INTERACTION_TRANSITION,
} from "../../../../../../constants";
import { modelNumbers } from "../../../../../../logic";
import { agentsCountLabel, notFilledLabel, priceLabel } from "../../../../../../words";
import {
  MODEL_ROW_ACTIONS_GAP_PX,
  MODEL_ROW_AGENTS_LABEL,
  MODEL_ROW_BACKGROUND_COLOR,
  MODEL_ROW_BORDER_COLOR,
  MODEL_ROW_BORDER_RADIUS_PX,
  MODEL_ROW_CHEVRON_COLOR,
  MODEL_ROW_CHEVRON_SIZE_PX,
  MODEL_ROW_CHIP_BACKGROUND_COLOR,
  MODEL_ROW_CHIP_BORDER_COLOR,
  MODEL_ROW_CHIP_BORDER_RADIUS_PX,
  MODEL_ROW_CHIP_COLOR,
  MODEL_ROW_CHIP_DOT_SIZE_PX,
  MODEL_ROW_CHIP_FONT_SIZE_PX,
  MODEL_ROW_CHIP_GAP_PX,
  MODEL_ROW_CHIP_PADDING,
  MODEL_ROW_DELETE_LABEL,
  MODEL_ROW_DOT_COLOR,
  MODEL_ROW_DOT_SIZE_PX,
  MODEL_ROW_EDIT_LABEL,
  MODEL_ROW_GAP_PX,
  MODEL_ROW_INPUT_PRICE_LABEL,
  MODEL_ROW_META_COLOR,
  MODEL_ROW_META_LETTER_SPACING_PX,
  MODEL_ROW_META_SEPARATOR,
  MODEL_ROW_OPEN_DOT_COLOR,
  MODEL_ROW_OPEN_GAP_PX,
  MODEL_ROW_OPEN_TEXT_COLOR,
  MODEL_ROW_OPEN_TEXT_FONT_SIZE_PX,
  MODEL_ROW_OPEN_TITLE_COLOR,
  MODEL_ROW_OUTPUT_PRICE_LABEL,
  MODEL_ROW_PADDING,
  MODEL_ROW_PRICE_UNIT,
  MODEL_ROW_PROVIDER_LABEL,
  MODEL_ROW_TEXT_GAP_PX,
  MODEL_ROW_TITLE_COLOR,
  MODEL_ROW_TITLE_FONT_SIZE_PX,
} from "./constants";
import { NOT_INSTALLED_SUFFIX } from "../../constants";
import { LOST_PROVIDER_COLOR, LOST_PROVIDER_SUFFIX } from "../../../../../../constants";
import type { ModelRowProps } from "./interfaces";
import { focusRing } from "../../../../../../utils/focus";

/** One model row; the open row shows full detail and the actions. */
export function ModelRow({
  model,
  agents,
  isProviderKnown,
  isInstalled,
  isOpen,
  onOpen,
  onEdit,
  onDelete,
}: ModelRowProps) {
  const { isPointedAt, isFocused, handlers } = usePressable(onOpen);
  // Both wrongs read the same: unknown provider, or known one no longer holding the model.
  const isWrong = !isProviderKnown || isInstalled === false;
  const providerSuffix = isProviderKnown ? (isInstalled === false ? NOT_INSTALLED_SUFFIX : "") : LOST_PROVIDER_SUFFIX;
  const isLit = isPointedAt || isFocused || isOpen;
  // An unfinished model says so in the place its prices would stand, and names the field that is empty.
  const notFilled = notFilledLabel(modelNumbers(model));
  /** Open, the row has room to name which price is which; closed, it says what every other row says. */
  const openPrices =
    notFilled !== null
      ? [notFilled]
      : [
          `$${model.inputPrice?.toFixed(2)} ${MODEL_ROW_INPUT_PRICE_LABEL}`,
          `$${model.outputPrice?.toFixed(2)} ${MODEL_ROW_OUTPUT_PRICE_LABEL} ${MODEL_ROW_PRICE_UNIT}`,
        ];

  return (
    <div
      {...handlers}
      aria-expanded={isOpen}
      className="d-flex flex-column"
      style={{
        padding: MODEL_ROW_PADDING,
        borderRadius: MODEL_ROW_BORDER_RADIUS_PX,
        border: `1px solid ${isLit ? INTERACTION_HOVER_BORDER_COLOR : MODEL_ROW_BORDER_COLOR}`,
        background: isLit ? INTERACTION_HOVER_BACKGROUND_COLOR : MODEL_ROW_BACKGROUND_COLOR,
        outline: "none",
        boxShadow: focusRing(isFocused),
        transition: INTERACTION_TRANSITION,
        cursor: "pointer",
      }}
    >
      <div
        className="d-flex align-items-center"
        style={{
          gap: MODEL_ROW_GAP_PX,
        }}
      >
        <Dot
          color={isOpen ? MODEL_ROW_OPEN_DOT_COLOR : MODEL_ROW_DOT_COLOR}
          size={MODEL_ROW_DOT_SIZE_PX}
          className="flex-shrink-0"
        />
        <span
          className="d-flex flex-column flex-fill"
          style={{
            gap: MODEL_ROW_TEXT_GAP_PX,
            minWidth: 0,
          }}
        >
          <span
            className="font-monospace head-truncate"
            style={{
              color: isLit ? MODEL_ROW_OPEN_TITLE_COLOR : MODEL_ROW_TITLE_COLOR,
              fontSize: MODEL_ROW_TITLE_FONT_SIZE_PX,
            }}
          >
            {model.title}
          </span>
          {!isOpen && (
            <Mark
              color={isInstalled === false ? LOST_PROVIDER_COLOR : MODEL_ROW_META_COLOR}
              spacing={MODEL_ROW_META_LETTER_SPACING_PX}
              className="text-truncate"
            >
              {`${[priceLabel(model), agentsCountLabel(agents.length)].join(MODEL_ROW_META_SEPARATOR)}${isInstalled === false ? NOT_INSTALLED_SUFFIX : ""}`}
            </Mark>
          )}
        </span>
        <svg
          width={MODEL_ROW_CHEVRON_SIZE_PX}
          height={MODEL_ROW_CHEVRON_SIZE_PX}
          viewBox="0 0 24 24"
          fill="none"
          stroke={isLit ? INTERACTION_HOVER_TEXT_COLOR : MODEL_ROW_CHEVRON_COLOR}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            flexShrink: 0,
            transform: isOpen ? "rotate(180deg)" : "none",
            transition: INTERACTION_TRANSITION,
          }}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
      {isOpen && (
        <div
          className="d-flex flex-column"
          style={{
            gap: MODEL_ROW_OPEN_GAP_PX,
            paddingTop: MODEL_ROW_OPEN_GAP_PX,
          }}
        >
          <span
            className="font-monospace"
            style={{
              color: isWrong ? LOST_PROVIDER_COLOR : MODEL_ROW_OPEN_TEXT_COLOR,
              fontSize: MODEL_ROW_OPEN_TEXT_FONT_SIZE_PX,
            }}
          >
            {`${[MODEL_ROW_PROVIDER_LABEL, model.provider].join(MODEL_ROW_META_SEPARATOR)}${providerSuffix}`}
          </span>
          <span
            className="font-monospace"
            style={{
              color: MODEL_ROW_OPEN_TEXT_COLOR,
              fontSize: MODEL_ROW_OPEN_TEXT_FONT_SIZE_PX,
            }}
          >
            {openPrices.join(MODEL_ROW_META_SEPARATOR)}
          </span>
          <div
            className="d-flex flex-wrap align-items-center"
            style={{
              gap: MODEL_ROW_CHIP_GAP_PX,
            }}
          >
            <Mark color={MODEL_ROW_OPEN_TEXT_COLOR} spacing={MODEL_ROW_META_LETTER_SPACING_PX}>
              {agents.length === 0 ? agentsCountLabel(0) : `${MODEL_ROW_AGENTS_LABEL}:`}
            </Mark>
            {agents.map((agent) => (
              <span
                key={agent.id}
                className="d-flex align-items-center font-monospace"
                style={{
                  maxWidth: "100%",
                  minWidth: 0,
                  gap: MODEL_ROW_CHIP_GAP_PX,
                  padding: MODEL_ROW_CHIP_PADDING,
                  borderRadius: MODEL_ROW_CHIP_BORDER_RADIUS_PX,
                  background: MODEL_ROW_CHIP_BACKGROUND_COLOR,
                  border: `1px solid ${MODEL_ROW_CHIP_BORDER_COLOR}`,
                  color: MODEL_ROW_CHIP_COLOR,
                  fontSize: MODEL_ROW_CHIP_FONT_SIZE_PX,
                }}
              >
                <Dot color={agent.color} size={MODEL_ROW_CHIP_DOT_SIZE_PX} />
                <span className="text-truncate">{agent.name}</span>
              </span>
            ))}
          </div>
          <div
            className="d-flex align-items-center justify-content-end"
            style={{
              gap: MODEL_ROW_ACTIONS_GAP_PX,
            }}
          >
            <TextAction label={MODEL_ROW_DELETE_LABEL} isDanger onClick={onDelete} />
            <TextAction label={MODEL_ROW_EDIT_LABEL} onClick={onEdit} />
          </div>
        </div>
      )}
    </div>
  );
}
