import type { VoiceStanding } from "../../../interfaces";

export interface MicButtonProps {
  standing: VoiceStanding;
  onPress: () => void;
}
