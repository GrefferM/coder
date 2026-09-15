import { describe, expect, it } from "vitest";
import { fileChangeDetail } from "./file-change-detail";
import type { ProjectConfig } from "../../../interfaces";
import { aConfig } from "../../../testing";

const AGENT = <ProjectConfig["agents"][number]>{};
const LINK = <ProjectConfig["links"][number]>{};

const EMPTY: ProjectConfig = aConfig({});

function withParts(parts: Partial<Omit<ProjectConfig, "version" | "name">>): ProjectConfig {
  return {
    ...EMPTY,
    ...parts,
  };
}

describe("fileChangeDetail", () => {
  it("counts what the file gained", () => {
    expect(
      fileChangeDetail(
        EMPTY,
        withParts({
          agents: [AGENT, AGENT],
        }),
      ),
    ).toBe("+2 агенти");
  });

  it("counts what the file lost, in the words of losing it", () => {
    expect(
      fileChangeDetail(
        withParts({
          links: [LINK],
        }),
        EMPTY,
      ),
    ).toBe("1 зв'язок зник");
  });

  it("says both halves of a branch switch on one line", () => {
    expect(
      fileChangeDetail(
        withParts({
          links: [LINK],
        }),
        withParts({
          agents: [AGENT, AGENT],
        }),
      ),
    ).toBe("+2 агенти · 1 зв'язок зник");
  });

  it("says nothing at all when every count stands where it was", () => {
    expect(
      fileChangeDetail(
        withParts({
          agents: [AGENT],
        }),
        withParts({
          agents: [AGENT],
        }),
      ),
    ).toBeNull();
  });
});
