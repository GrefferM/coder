import type { VoiceStanding } from "../../../../../../../../speech";

export interface MicButtonProps {
  standing: VoiceStanding;
  onPress: () => void;
}
