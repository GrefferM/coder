import { Dot, Field, Mark, NestedActions } from "../../../../../../components";
import { ProviderModels } from "./components";
import { timeLabel } from "../../../../../../utils/dates";
import { ukrainianPlural } from "../../../../../../utils/text";
import { PROVIDER_LOCAL_LABEL, PROVIDER_REMOTE_LABEL } from "../../../../constants";
import {
  PROVIDER_CARD_ADDRESS_LABEL,
  PROVIDER_CARD_ANSWERED_COLOR,
  PROVIDER_CARD_ANSWERED_LABEL,
  PROVIDER_CARD_ASKING_LABEL,
  PROVIDER_CARD_CHECKED_PREFIX,
  PROVIDER_CARD_INSTALLED_SUFFIX,
  PROVIDER_CARD_MODEL_FORMS,
  PROVIDER_CARD_REPLY_FONT_SIZE_PX,
  PROVIDER_CARD_REPLY_LETTER_SPACING_PX,
  PROVIDER_CARD_REPLY_SEPARATOR,
  PROVIDER_CARD_SILENT_COLOR,
  PROVIDER_CARD_SILENT_LABEL,
  PROVIDER_CARD_ADDRESS_NOTE,
  PROVIDER_CARD_ADDRESS_PLACEHOLDER,
  PROVIDER_CARD_OWN_ADDRESS_NOTE,
  PROVIDER_CARD_BACKGROUND_COLOR,
  PROVIDER_CARD_BADGE_BACKGROUND_COLOR,
  PROVIDER_CARD_BADGE_BORDER_COLOR,
  PROVIDER_CARD_BADGE_BORDER_RADIUS_PX,
  PROVIDER_CARD_BADGE_COLOR,
  PROVIDER_CARD_BADGE_FONT_SIZE_PX,
  PROVIDER_CARD_BADGE_LETTER_SPACING_PX,
  PROVIDER_CARD_BADGE_PADDING,
  PROVIDER_CARD_BORDER_COLOR,
  PROVIDER_CARD_BORDER_RADIUS_PX,
  PROVIDER_CARD_CANCEL_LABEL,
  PROVIDER_CARD_DOT_COLOR,
  PROVIDER_CARD_DOT_GLOW_PX,
  PROVIDER_CARD_DOT_SIZE_PX,
  PROVIDER_CARD_EMPTY_DOT_BORDER,
  PROVIDER_CARD_GAP_PX,
  PROVIDER_CARD_HEAD_GAP_PX,
  PROVIDER_CARD_KEY_LABEL,
  PROVIDER_CARD_KEY_NOTE,
  PROVIDER_CARD_KEY_PLACEHOLDER,
  PROVIDER_CARD_NAME_COLOR,
  PROVIDER_CARD_NAME_FONT_SIZE_PX,
  PROVIDER_CARD_NAME_FONT_WEIGHT,
  PROVIDER_CARD_PADDING,
  PROVIDER_CARD_SAVE_LABEL,
} from "./constants";
import type { ProviderCardProps } from "./interfaces";

/** Opened provider; it draws a field for each thing it asks for — a key, an address, or both. */
export function ProviderCard({
  provider,
  value,
  models,
  answer,
  isAsking,
  onAsk,
  onChange,
  onCancel,
  onSave,
  onTakeUpModel,
}: ProviderCardProps) {
  const [one, few, many] = PROVIDER_CARD_MODEL_FORMS;
  const countOfModels = (count: number) => `${count} ${ukrainianPlural(count, one, few, many)}`;
  const isLocal = provider.kind === "local";
  const isAnswering = answer === null ? null : answer.isAnswering;
  const wantsKey = provider.needs.includes("key");
  const wantsAddress = provider.needs.includes("address");
  // A local provider is lit by answering; every other one by holding everything it asked for.
  const isFilled = isLocal
    ? isAnswering === true
    : (!wantsKey || provider.keyHint !== null) &&
      (!wantsAddress || provider.address !== null || provider.customaryAddress !== null);
  const isSilent = isLocal && isAnswering === false;
  // The hint stands until somebody types or presses the cross; after that the field is plainly empty.
  const isKeyHeld = value.key === null && provider.keyHint !== null;
  const keyPlaceholder = isKeyHeld ? (provider.keyHint ?? "") : PROVIDER_CARD_KEY_PLACEHOLDER;
  const addressPlaceholder = provider.address ?? provider.customaryAddress ?? PROVIDER_CARD_ADDRESS_PLACEHOLDER;

  return (
    <div
      className="d-flex flex-column flex-shrink-0"
      style={{
        padding: PROVIDER_CARD_PADDING,
        gap: PROVIDER_CARD_GAP_PX,
        borderRadius: PROVIDER_CARD_BORDER_RADIUS_PX,
        border: `1px solid ${PROVIDER_CARD_BORDER_COLOR}`,
        background: PROVIDER_CARD_BACKGROUND_COLOR,
      }}
    >
      <div
        className="d-flex align-items-center"
        style={{
          gap: PROVIDER_CARD_HEAD_GAP_PX,
        }}
      >
        <Dot
          color={isSilent ? PROVIDER_CARD_SILENT_COLOR : isFilled ? PROVIDER_CARD_DOT_COLOR : "transparent"}
          size={PROVIDER_CARD_DOT_SIZE_PX}
          glow={isFilled ? PROVIDER_CARD_DOT_GLOW_PX : undefined}
          border={isFilled || isSilent ? undefined : PROVIDER_CARD_EMPTY_DOT_BORDER}
          className="flex-shrink-0"
        />
        <span
          className="flex-fill text-truncate"
          style={{
            color: PROVIDER_CARD_NAME_COLOR,
            fontSize: PROVIDER_CARD_NAME_FONT_SIZE_PX,
            fontWeight: PROVIDER_CARD_NAME_FONT_WEIGHT,
          }}
        >
          {provider.name}
        </span>
        <span
          className="font-monospace flex-shrink-0"
          style={{
            padding: PROVIDER_CARD_BADGE_PADDING,
            borderRadius: PROVIDER_CARD_BADGE_BORDER_RADIUS_PX,
            border: `1px solid ${PROVIDER_CARD_BADGE_BORDER_COLOR}`,
            background: PROVIDER_CARD_BADGE_BACKGROUND_COLOR,
            color: PROVIDER_CARD_BADGE_COLOR,
            fontSize: PROVIDER_CARD_BADGE_FONT_SIZE_PX,
            letterSpacing: PROVIDER_CARD_BADGE_LETTER_SPACING_PX,
          }}
        >
          {isLocal ? PROVIDER_LOCAL_LABEL : PROVIDER_REMOTE_LABEL}
        </span>
      </div>

      {wantsKey && (
        <Field
          isMono
          label={PROVIDER_CARD_KEY_LABEL}
          value={value.key ?? ""}
          placeholder={keyPlaceholder}
          note={provider.keyHint === null ? undefined : PROVIDER_CARD_KEY_NOTE}
          // A key stands behind its hint, so emptying it is a press somebody makes and not a field left alone.
          onClear={isKeyHeld ? () => onChange("key", "") : undefined}
          onChange={(typed) => onChange("key", typed)}
        />
      )}

      {wantsAddress && (
        <Field
          isMono
          label={PROVIDER_CARD_ADDRESS_LABEL}
          value={value.address ?? ""}
          placeholder={addressPlaceholder}
          // An address with nothing customary behind it is the person's own, and an empty field leaves them nowhere.
          note={provider.customaryAddress === null ? PROVIDER_CARD_OWN_ADDRESS_NOTE : PROVIDER_CARD_ADDRESS_NOTE}
          onChange={(typed) => onChange("address", typed)}
        />
      )}

      {isLocal && (isAsking || isAnswering !== null) && (
        <Mark
          color={isAnswering === true ? PROVIDER_CARD_ANSWERED_COLOR : PROVIDER_CARD_SILENT_COLOR}
          size={PROVIDER_CARD_REPLY_FONT_SIZE_PX}
          spacing={PROVIDER_CARD_REPLY_LETTER_SPACING_PX}
          isUpperCase={false}
        >
          {isAsking
            ? PROVIDER_CARD_ASKING_LABEL
            : isAnswering === true
              ? `${PROVIDER_CARD_ANSWERED_LABEL}${PROVIDER_CARD_REPLY_SEPARATOR}${countOfModels(answer?.models.length ?? 0)}${PROVIDER_CARD_INSTALLED_SUFFIX}`
              : `${PROVIDER_CARD_SILENT_LABEL}${answer === null ? "" : `${PROVIDER_CARD_REPLY_SEPARATOR}${PROVIDER_CARD_CHECKED_PREFIX}${timeLabel(answer.askedAt)}`}`}
        </Mark>
      )}

      {isLocal && isAnswering !== null && (
        <ProviderModels
          models={answer?.models ?? []}
          catalogue={models}
          isAnswering={isAnswering}
          onAsk={onAsk}
          onTakeUp={onTakeUpModel}
        />
      )}

      <NestedActions
        cancelLabel={PROVIDER_CARD_CANCEL_LABEL}
        confirmLabel={PROVIDER_CARD_SAVE_LABEL}
        onCancel={onCancel}
        onConfirm={onSave}
      />
    </div>
  );
}
