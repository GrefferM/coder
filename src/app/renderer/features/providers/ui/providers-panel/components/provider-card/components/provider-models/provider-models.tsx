import { useState } from "react";
import { Chip, Mark, TextAction } from "../../../../../../../../components";
import { modelSizeLabel } from "../../../../../../logic";
import { priceLabel } from "../../../../../../../../words";
import {
  PROVIDER_MODELS_EMPTY_NOTE,
  PROVIDER_MODELS_GAP_PX,
  PROVIDER_MODELS_HEAD_GAP_PX,
  PROVIDER_MODELS_LABEL,
  PROVIDER_MODELS_LABEL_COLOR,
  PROVIDER_MODELS_LABEL_FONT_SIZE_PX,
  PROVIDER_MODELS_LABEL_LETTER_SPACING_PX,
  PROVIDER_MODELS_LAST_KNOWN_COLOR,
  PROVIDER_MODELS_LAST_KNOWN_FONT_SIZE_PX,
  PROVIDER_MODELS_LAST_KNOWN_GAP_PX,
  PROVIDER_MODELS_LAST_KNOWN_LINE_HEIGHT,
  PROVIDER_MODELS_LAST_KNOWN_NOTE,
  PROVIDER_MODELS_LAST_KNOWN_PADDING,
  PROVIDER_MODELS_CATALOGUE_NOTE,
  PROVIDER_MODELS_LIST_GAP_PX,
  PROVIDER_MODELS_MORE_PREFIX,
  PROVIDER_MODELS_NAME_SEPARATOR,
  PROVIDER_MODELS_NOTE_COLOR,
  PROVIDER_MODELS_NOTE_LINE_HEIGHT,
  PROVIDER_MODELS_REFRESH_LABEL,
  PROVIDER_MODELS_RETRY_LABEL,
  PROVIDER_MODELS_ROW_BACKGROUND_COLOR,
  PROVIDER_MODELS_ROW_BORDER_COLOR,
  PROVIDER_MODELS_ROW_BORDER_RADIUS_PX,
  PROVIDER_MODELS_ROW_GAP_PX,
  PROVIDER_MODELS_ROW_NAME_COLOR,
  PROVIDER_MODELS_ROW_NAME_FONT_SIZE_PX,
  PROVIDER_MODELS_ROW_PADDING,
  PROVIDER_MODELS_ROW_PRICE_COLOR,
  PROVIDER_MODELS_ROW_PRICE_FONT_SIZE_PX,
  PROVIDER_MODELS_ROW_SIZE_BACKGROUND_COLOR,
  PROVIDER_MODELS_ROW_SIZE_COLOR,
  PROVIDER_MODELS_SHOWN_LIMIT,
  PROVIDER_MODELS_SHOW_ALL_LABEL,
  PROVIDER_MODELS_TAKE_UP_LABEL,
} from "./constants";
import type { ProviderModelsProps } from "./interfaces";

/** Installed models as the provider named them; a quiet provider's last list stays, dimmed. */
export function ProviderModels({ models, catalogue, isAnswering, onAsk, onTakeUp }: ProviderModelsProps) {
  const [isShowingAll, setIsShowingAll] = useState(false);
  const hasList = models.length > 0;
  const shown = isShowingAll ? models : models.slice(0, PROVIDER_MODELS_SHOWN_LIMIT);
  const hidden = models.length - shown.length;

  return (
    <div
      className="d-flex flex-column"
      style={{
        gap: PROVIDER_MODELS_GAP_PX,
      }}
    >
      <div
        className="d-flex align-items-center"
        style={{
          gap: PROVIDER_MODELS_HEAD_GAP_PX,
        }}
      >
        {hasList && (
          <Mark
            color={PROVIDER_MODELS_LABEL_COLOR}
            size={PROVIDER_MODELS_LABEL_FONT_SIZE_PX}
            spacing={PROVIDER_MODELS_LABEL_LETTER_SPACING_PX}
            isUpperCase={false}
          >
            {PROVIDER_MODELS_LABEL}
          </Mark>
        )}
        <span className="flex-fill" />
        <TextAction label={isAnswering ? PROVIDER_MODELS_REFRESH_LABEL : PROVIDER_MODELS_RETRY_LABEL} onClick={onAsk} />
      </div>

      {isAnswering && hasList && (
        <div
          className="d-flex flex-column"
          style={{
            gap: PROVIDER_MODELS_LIST_GAP_PX,
          }}
        >
          {shown.map((model) => {
            const declared = catalogue.find((standing) => standing.title === model.name) ?? null;
            const size = modelSizeLabel(model.sizeBytes);

            return (
              <div
                key={model.name}
                className="d-flex align-items-center"
                style={{
                  gap: PROVIDER_MODELS_ROW_GAP_PX,
                  padding: PROVIDER_MODELS_ROW_PADDING,
                  borderRadius: PROVIDER_MODELS_ROW_BORDER_RADIUS_PX,
                  border: `1px solid ${PROVIDER_MODELS_ROW_BORDER_COLOR}`,
                  background: PROVIDER_MODELS_ROW_BACKGROUND_COLOR,
                }}
              >
                <span
                  className="font-monospace flex-fill head-truncate"
                  title={model.name}
                  style={{
                    color: PROVIDER_MODELS_ROW_NAME_COLOR,
                    fontSize: PROVIDER_MODELS_ROW_NAME_FONT_SIZE_PX,
                  }}
                >
                  {model.name}
                </span>
                {size !== null && (
                  <Chip color={PROVIDER_MODELS_ROW_SIZE_COLOR} background={PROVIDER_MODELS_ROW_SIZE_BACKGROUND_COLOR}>
                    {size}
                  </Chip>
                )}
                {declared === null ? (
                  <TextAction label={PROVIDER_MODELS_TAKE_UP_LABEL} onClick={() => onTakeUp(model.name)} />
                ) : (
                  <span
                    className="font-monospace flex-shrink-0"
                    style={{
                      color: PROVIDER_MODELS_ROW_PRICE_COLOR,
                      fontSize: PROVIDER_MODELS_ROW_PRICE_FONT_SIZE_PX,
                    }}
                  >
                    {priceLabel(declared)}
                  </span>
                )}
              </div>
            );
          })}
          {hidden > 0 && (
            <TextAction
              isQuiet
              label={`${PROVIDER_MODELS_SHOW_ALL_LABEL}${PROVIDER_MODELS_MORE_PREFIX}${hidden}`}
              onClick={() => setIsShowingAll(true)}
            />
          )}
        </div>
      )}

      {isAnswering && hasList && (
        <Mark color={PROVIDER_MODELS_NOTE_COLOR} lineHeight={PROVIDER_MODELS_NOTE_LINE_HEIGHT} isUpperCase={false}>
          {PROVIDER_MODELS_CATALOGUE_NOTE}
        </Mark>
      )}

      {isAnswering && !hasList && (
        <Mark color={PROVIDER_MODELS_NOTE_COLOR} lineHeight={PROVIDER_MODELS_NOTE_LINE_HEIGHT} isUpperCase={false}>
          {PROVIDER_MODELS_EMPTY_NOTE}
        </Mark>
      )}

      {!isAnswering && hasList && (
        <div
          className="d-flex flex-column"
          style={{
            gap: PROVIDER_MODELS_LAST_KNOWN_GAP_PX,
            padding: PROVIDER_MODELS_LAST_KNOWN_PADDING,
            borderRadius: PROVIDER_MODELS_ROW_BORDER_RADIUS_PX,
            border: `1px solid ${PROVIDER_MODELS_ROW_BORDER_COLOR}`,
            background: PROVIDER_MODELS_ROW_BACKGROUND_COLOR,
          }}
        >
          <span
            className="font-monospace"
            style={{
              color: PROVIDER_MODELS_LAST_KNOWN_COLOR,
              fontSize: PROVIDER_MODELS_LAST_KNOWN_FONT_SIZE_PX,
              lineHeight: PROVIDER_MODELS_LAST_KNOWN_LINE_HEIGHT,
            }}
          >
            {models.map((model) => model.name).join(PROVIDER_MODELS_NAME_SEPARATOR)}
          </span>
          <Mark color={PROVIDER_MODELS_NOTE_COLOR} lineHeight={PROVIDER_MODELS_NOTE_LINE_HEIGHT} isUpperCase={false}>
            {PROVIDER_MODELS_LAST_KNOWN_NOTE}
          </Mark>
        </div>
      )}
    </div>
  );
}
