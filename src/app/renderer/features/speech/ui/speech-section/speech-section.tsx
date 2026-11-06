import { ListenModelPicker, SpeechCard, VoicePicker } from "./components";
import { HEARING_CARD_TITLE, VOICE_CARD_TITLE, VOICE_MACHINE_NOTE } from "../../constants";
import { SPEECH_SECTION_GAP_PX, SPEECH_SECTION_PADDING } from "./constants";
import type { SpeechSectionProps } from "./interfaces";

/** The speech section (38c): the project's hearing model, chosen from the catalogue, and this machine's voice. */
export function SpeechSection({
  models,
  listenModelId,
  providers,
  speech,
  onChooseListenModel,
  onOpenModels,
  onListen,
}: SpeechSectionProps) {
  const { settings, voices, save } = speech;

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
      <SpeechCard title={HEARING_CARD_TITLE}>
        <ListenModelPicker
          models={models.filter((model) => model.kind === "listen")}
          providers={providers}
          modelId={listenModelId}
          onChange={onChooseListenModel}
          onOpenModels={onOpenModels}
        />
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
      </SpeechCard>
    </div>
  );
}
