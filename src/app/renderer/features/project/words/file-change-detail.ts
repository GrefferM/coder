import {
  FILE_CHANGE_AGENT_FORMS,
  FILE_CHANGE_AGENT_GONE_FORMS,
  FILE_CHANGE_COMMAND_FORMS,
  FILE_CHANGE_COMMAND_GONE_FORMS,
  FILE_CHANGE_GROWTH_PREFIX,
  FILE_CHANGE_LINK_FORMS,
  FILE_CHANGE_LINK_GONE_FORMS,
  FILE_CHANGE_MODEL_FORMS,
  FILE_CHANGE_MODEL_GONE_FORMS,
  FILE_CHANGE_PROMPT_FORMS,
  FILE_CHANGE_PROMPT_GONE_FORMS,
  FILE_CHANGE_SEPARATOR,
} from "../constants";
import { ukrainianPlural } from "../../../utils/text";
import type { ProjectConfig } from "../../../interfaces";

/** Per-part counts of what changed — «+2 агенти · 1 зв'язок зник»; edits inside items are not counted. */
export function fileChangeDetail(before: ProjectConfig, after: ProjectConfig): string | null {
  const parts = [
    countedPart(after.agents.length - before.agents.length, FILE_CHANGE_AGENT_FORMS, FILE_CHANGE_AGENT_GONE_FORMS),
    countedPart(after.links.length - before.links.length, FILE_CHANGE_LINK_FORMS, FILE_CHANGE_LINK_GONE_FORMS),
    countedPart(after.models.length - before.models.length, FILE_CHANGE_MODEL_FORMS, FILE_CHANGE_MODEL_GONE_FORMS),
    countedPart(after.prompts.length - before.prompts.length, FILE_CHANGE_PROMPT_FORMS, FILE_CHANGE_PROMPT_GONE_FORMS),
    countedPart(
      after.commands.length - before.commands.length,
      FILE_CHANGE_COMMAND_FORMS,
      FILE_CHANGE_COMMAND_GONE_FORMS,
    ),
  ].filter((part): part is string => part !== null);

  return parts.length === 0 ? null : parts.join(FILE_CHANGE_SEPARATOR);
}

/** One part's gain or loss; `null` when unchanged. */
function countedPart(moved: number, forms: string[], goneForms: string[]): string | null {
  if (moved === 0) {
    return null;
  }

  const [one, few, many] = moved > 0 ? forms : goneForms;
  const count = Math.abs(moved);

  return `${moved > 0 ? FILE_CHANGE_GROWTH_PREFIX : ""}${count} ${ukrainianPlural(count, one, few, many)}`;
}
