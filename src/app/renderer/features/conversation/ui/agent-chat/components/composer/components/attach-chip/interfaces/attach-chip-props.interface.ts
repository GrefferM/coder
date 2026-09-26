import type { PickedAttachment } from "../../../../../../../../../interfaces";

export interface AttachChipProps {
  /** The one attachment this chip stands for; its own path is how the × takes it off. */
  attachment: PickedAttachment;
  onDetach: (path: string) => void;
}
