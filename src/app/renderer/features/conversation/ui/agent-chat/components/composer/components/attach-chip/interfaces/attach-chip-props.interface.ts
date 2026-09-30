import type { PickedAttachment } from "../../../../../../../../../interfaces";

export interface AttachChipProps {
  /** The attachment this chip stands for; its path identifies it for detaching. */
  attachment: PickedAttachment;
  onDetach: (path: string) => void;
}
