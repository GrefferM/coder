import type { VoiceAsk } from "../../speech";
import type { RepeatProgress } from "../../conversation";
import type { PickedAttachment } from "../../../interfaces";

export interface WidgetFieldProps {
  /** The chosen sphere's name; `null` while none is chosen, and the field takes nothing. */
  agentName: string | null;
  /** A walk of the sphere is out: the field rests and «ЗУПИНИТИ» stands (4f). */
  isWalking: boolean;
  /** The question said rather than typed (52d). */
  voice: VoiceAsk;
  /** The files and folders picked for the next question, as chips under the field (4i). */
  attachments: PickedAttachment[];
  /** «x1»: how many times the next question goes in a row. */
  repeats: number;
  /** Repeats under way: the count reads «2/5». */
  repeating: RepeatProgress | null;
  /** The language macOS hears now, as its short code («EN»), where a second one can be switched to; `null` hides the switch. */
  language: string | null;
  /** Switches macOS to the other language set in «Мовлення». */
  onSwitchLanguage: () => void;
  onAttach: () => void;
  onDetach: (path: string) => void;
  onRepeats: (count: number) => void;
  onSend: (text: string) => Promise<boolean>;
  onStop: () => void;
}
