import { ListenModelPicker, MacLocalePicker, SpeechCard, VoicePicker, VoiceRate } from "./components";
import { useMacHearing } from "../../hooks";
import { NOT_FILLED_LABEL } from "../../../../constants";
import {
  HEARING_CARD_TITLE,
  ENGLISH_VOICE_SAMPLE,
  MAC_LOCALE_LABEL,
  MAC_SECOND_LOCALE_LABEL,
  MAC_SECOND_LOCALE_NONE_WORDS,
  UKRAINIAN_VOICE_FIELD_LABEL,
  UKRAINIAN_VOICE_SAME_WORDS,
  VOICE_CARD_TITLE,
  VOICE_FIELD_LABEL,
  VOICE_MACHINE_NOTE,
  VOICE_SAMPLE,
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
          <>
            <MacLocalePicker
              label={MAC_LOCALE_LABEL}
              locales={mac.locales}
              locale={settings.macLocale}
              emptyWords={NOT_FILLED_LABEL}
              onChange={(macLocale) =>
                void save({
                  macLocale,
                })
              }
            />
            <MacLocalePicker
              label={MAC_SECOND_LOCALE_LABEL}
              locales={mac.locales}
              locale={settings.macSecondLocale}
              emptyWords={MAC_SECOND_LOCALE_NONE_WORDS}
              onChange={(macSecondLocale) =>
                void save({
                  macSecondLocale,
                })
              }
            />
          </>
        )}
      </SpeechCard>
      <SpeechCard title={VOICE_CARD_TITLE} note={VOICE_MACHINE_NOTE}>
        <VoicePicker
          label={VOICE_FIELD_LABEL}
          voices={voices}
          voiceName={settings.voiceName}
          emptyWords={NOT_FILLED_LABEL}
          onChange={(voiceName) =>
            void save({
              voiceName,
            })
          }
          onListen={() => onListen(ENGLISH_VOICE_SAMPLE)}
        />
        <VoiceRate
          rate={settings.voiceRate}
          onChange={(voiceRate) =>
            void save({
              voiceRate,
            })
          }
        />
        <VoicePicker
          label={UKRAINIAN_VOICE_FIELD_LABEL}
          voices={voices}
          voiceName={settings.ukrainianVoiceName}
          emptyWords={UKRAINIAN_VOICE_SAME_WORDS}
          onChange={(ukrainianVoiceName) =>
            void save({
              ukrainianVoiceName,
            })
          }
          onListen={() => onListen(VOICE_SAMPLE)}
        />
        <VoiceRate
          rate={settings.ukrainianVoiceRate}
          onChange={(ukrainianVoiceRate) =>
            void save({
              ukrainianVoiceRate,
            })
          }
        />
      </SpeechCard>
    </div>
  );
}
