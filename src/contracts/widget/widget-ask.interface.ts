import type { PackedAttachment } from "../attachments";
import type { ProjectConfig } from "../project";

/** A question from the widget: the project as the widget read it, the sphere it begins at, its words and files. */
export interface WidgetAsk {
  directory: string;
  config: ProjectConfig;
  agentId: string;
  text: string;
  attached: PackedAttachment[];
}
