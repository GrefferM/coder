import {
  DIFFERENCE_ADDED_SIGN,
  DIFFERENCE_AGENT_WORD,
  DIFFERENCE_COMMAND_WORD,
  DIFFERENCE_GONE_AGENT_NAME,
  DIFFERENCE_GONE_SIGN,
  DIFFERENCE_LINK_ARROW,
  DIFFERENCE_LINK_WORD,
  DIFFERENCE_MODEL_WORD,
  DIFFERENCE_MOVED_SIGN,
  DIFFERENCE_PROMPT_WORD,
} from "../constants";
import type { Agent, Link, ProjectConfig } from "../../../interfaces";

/** The diff line by line: «+ агент FIXER», «− зв'язок PLANNER → TESTER», «~ модель GPT-4». */
export function configDifference(before: ProjectConfig, after: ProjectConfig): string[] {
  return [
    ...partDifference(before.agents, after.agents, DIFFERENCE_AGENT_WORD, (agent) => agent.name),
    ...partDifference(before.models, after.models, DIFFERENCE_MODEL_WORD, (model) => model.title),
    ...partDifference(before.prompts, after.prompts, DIFFERENCE_PROMPT_WORD, (prompt) => prompt.name),
    ...partDifference(before.commands, after.commands, DIFFERENCE_COMMAND_WORD, (command) => command.name),
    ...partDifference(before.links, after.links, DIFFERENCE_LINK_WORD, (link, isAfter) =>
      linkName(link, isAfter ? after : before),
    ),
  ];
}

/** Diffs one list against its earlier state; `nameOf` gets the item's side, which names a link's ends. */
function partDifference<TItem extends { id: string }>(
  was: TItem[],
  now: TItem[],
  word: string,
  nameOf: (item: TItem, isAfter: boolean) => string,
): string[] {
  const wasById = new Map(was.map((item) => [item.id, item]));
  const nowById = new Map(now.map((item) => [item.id, item]));
  const lines: string[] = [];

  for (const item of now) {
    const stood = wasById.get(item.id);

    if (stood === undefined) {
      lines.push(`${DIFFERENCE_ADDED_SIGN} ${word} ${nameOf(item, true)}`);

      continue;
    }

    if (JSON.stringify(stood) !== JSON.stringify(item)) {
      lines.push(`${DIFFERENCE_MOVED_SIGN} ${word} ${nameOf(item, true)}`);
    }
  }

  for (const item of was) {
    if (!nowById.has(item.id)) {
      lines.push(`${DIFFERENCE_GONE_SIGN} ${word} ${nameOf(item, false)}`);
    }
  }

  return lines;
}

/** A link is named by its ends: «EDITOR → REVIEWER». */
function linkName(link: Link, config: ProjectConfig): string {
  return `${agentName(config.agents, link.from)}${DIFFERENCE_LINK_ARROW}${agentName(config.agents, link.to)}`;
}

function agentName(agents: Agent[], agentId: string): string {
  return agents.find((agent) => agent.id === agentId)?.name ?? DIFFERENCE_GONE_AGENT_NAME;
}
