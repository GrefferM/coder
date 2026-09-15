import { describe, expect, it } from "vitest";
import { configDifference } from "./config-difference";
import type { Agent, Link, ProjectConfig } from "../../../interfaces";
import { aConfig, aLink } from "../../../testing";

const EDITOR = <Agent>{
  id: "agent-1",
  name: "EDITOR",
};

const REVIEWER = <Agent>{
  id: "agent-2",
  name: "REVIEWER",
};

const LINK = <Link>aLink();

const EMPTY: ProjectConfig = aConfig();

function withAgents(agents: Agent[], links: Link[] = []): ProjectConfig {
  return aConfig({
    agents,
    links,
  });
}

describe("configDifference", () => {
  it("names what came", () => {
    expect(configDifference(EMPTY, withAgents([EDITOR]))).toEqual(["+ агент EDITOR"]);
  });

  it("names what went", () => {
    expect(configDifference(withAgents([EDITOR]), EMPTY)).toEqual(["− агент EDITOR"]);
  });

  it("names what moved inside, matching by id, so a rename is one line and not two", () => {
    expect(
      configDifference(
        withAgents([EDITOR]),
        withAgents([
          <Agent>{
            ...EDITOR,
            name: "WRITER",
          },
        ]),
      ),
    ).toEqual(["~ агент WRITER"]);
  });

  it("names a link by the agents at its ends", () => {
    expect(configDifference(withAgents([EDITOR, REVIEWER]), withAgents([EDITOR, REVIEWER], [LINK]))).toEqual([
      "+ зв'язок EDITOR → REVIEWER",
    ]);
  });

  it("says nothing at all about two configs that stand the same", () => {
    expect(configDifference(withAgents([EDITOR]), withAgents([EDITOR]))).toEqual([]);
  });
});
