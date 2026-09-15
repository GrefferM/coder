import type { CommandParameter } from "../../../interfaces";

/** Preview content; `note` differs between the declaration and grant views. */
export interface ModelPreviewProps {
  name: string;
  description: string;
  parameters: CommandParameter[];
  note: string;
}
