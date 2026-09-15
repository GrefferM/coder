import type { ProjectConfig } from "../../../interfaces";

/**
 * Whether work handed down this line would come back where it came from — a line into itself, or a ring further
 * along. The last of three walls against a ring, behind drawing and behind the file. Nothing stops a turn, so
 * work that walks a ring walks it for ever.
 */
export function leadsBack(config: ProjectConfig, fromAgentId: string, toAgentId: string): boolean {
  const ahead = [toAgentId];
  const walked = new Set<string>();

  while (ahead.length > 0) {
    const at = <string>ahead.pop();

    if (at === fromAgentId) {
      return true;
    }

    if (walked.has(at)) {
      continue;
    }

    walked.add(at);
    ahead.push(...config.links.filter((link) => link.from === at).map((link) => link.to));
  }

  return false;
}
