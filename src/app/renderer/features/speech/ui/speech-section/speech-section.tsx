import { ListenModelPicker, MacLocalePicker, SpeechCard, VoicePicker } from "./components";
import { useMacHearing } from "../../hooks";
import { FieldSlot, Stepper } from "../../../../components";
import { VOICE_RATE_LEAST, VOICE_RATE_MOST, VOICE_RATE_STEP } from "../../../../../../contracts";
import {
  HEARING_CARD_TITLE,
  VOICE_CARD_TITLE,
  VOICE_MACHINE_NOTE,
  VOICE_RATE_LABEL,
  VOICE_RATE_OWN,
  VOICE_RATE_PLACES,
} from "../../constants";
import { SPEECH_SECTION_GAP_PX, SPEECH_SECTION_PADDING } from "./constants";
import type { SpeechSectionProps } from "./interfaces";

/**
 * The speech section (38c): who hears — macOS on this machine in its language (38d), or the project's model from the
 * catalogue — and this machine's voice.
 */
export function SpeechSection({
  models,
  listenModelId,
  providers,
  speech,
  isMac,
  onChooseListenModel,
  onOpenModels,
  onListen,
}: SpeechSectionProps) {
  const { settings, voices, save } = speech;
  const mac = useMacHearing(settings.isMacHearing);

  return (
    <div
      className="d-flex flex-column flex-fill"
      style={{
        gap: SPEECH_SECTION_GAP_PX,
        padding: SPEECH_SECTION_PADDING,
        minHeight: 0,
        overflowY: "auto",
      }}
    >
      <SpeechCard title={HEARING_CARD_TITLE} note={settings.isMacHearing ? VOICE_MACHINE_NOTE : undefined}>
        <ListenModelPicker
          models={models.filter((model) => model.kind === "listen")}
          providers={providers}
          modelId={listenModelId}
          isMac={isMac}
          isMacChosen={settings.isMacHearing}
          mac={mac}
          onChange={(modelId) => {
            void save({
              isMacHearing: false,
            });
            onChooseListenModel(modelId);
          }}
          onChooseMac={() => {
            void save({
              isMacHearing: true,
            });
            void mac.allow();
          }}
          onOpenModels={onOpenModels}
        />
        {settings.isMacHearing && (
          <MacLocalePicker
            locales={mac.locales}
            locale={settings.macLocale}
            onChange={(macLocale) =>
              void save({
                macLocale,
              })
            }
          />
        )}
      </SpeechCard>
      <SpeechCard title={VOICE_CARD_TITLE} note={VOICE_MACHINE_NOTE}>
        <VoicePicker
          voices={voices}
          voiceName={settings.voiceName}
          onChange={(voiceName) =>
            void save({
              voiceName,
            })
          }
          onListen={onListen}
        />
        <FieldSlot label={VOICE_RATE_LABEL}>
          <Stepper
            label={VOICE_RATE_LABEL}
            value={settings.voiceRate ?? VOICE_RATE_OWN}
            step={VOICE_RATE_STEP}
            least={VOICE_RATE_LEAST}
            most={VOICE_RATE_MOST}
            places={VOICE_RATE_PLACES}
            onChange={(voiceRate) =>
              void save({
                voiceRate,
              })
            }
          />
        </FieldSlot>
      </SpeechCard>
    </div>
  );
}
