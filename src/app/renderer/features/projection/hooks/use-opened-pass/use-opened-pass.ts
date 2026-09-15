import { useState } from "react";
import { runChanges, runPasses } from "../../logic";
import { oneWalk, runNamedToday, runStandings, useOpenedRun } from "../../../record";
import type { Agent, ProjectModel } from "../../../../interfaces";
import type { OpenedPassState } from "../../interfaces";

/**
 * The pass whose projection stands over the canvas — the run it is in and the question it is,
 * by that question's own id. A question picked up by a repeat has its steps in a later walk than the one it began,
 * so the walk is no way to find it. The record is read again on every write, as the run itself is.
 */
export function useOpenedPass(agents: Agent[], models: ProjectModel[], written: number): OpenedPassState {
  const [pass, setPass] = useState<{ runId: string; questionId: string } | null>(null);
  const opened = useOpenedRun(pass?.runId ?? null, written);
  // The projection names its agents as the stream does, so one run does not read two ways.
  const run = opened.run === null ? null : runNamedToday(opened.run, agents);
  const passes = run === null ? [] : runPasses(run);
  /**
   * A projection is one pass and nothing else, so it is read off the pass as the record kept it — the flow's
   * other questions have their own passes and their own
   * spheres, and an agent that walked in one of them has nothing to say over this one. The record's own names are
   * still on this copy, which is what the standings hold today's against.
   */
  const walked = opened.run === null || pass === null ? null : oneWalk(opened.run, pass.questionId);
  const standings = runStandings(walked, agents).filter((standing) =>
    (walked?.walk ?? []).some((step) => step.agentId === standing.id),
  );

  return {
    isOpen: pass !== null,
    // Who these agents are today, so the graph can say where the record and the project part.
    standings,
    // And what has moved since — the card holds the record's circumstances against the project's.
    changes: runChanges(walked, standings, agents, models),
    run: run === null || pass === null ? null : oneWalk(run, pass.questionId),
    isFailed: opened.isFailed,
    place: passes.indexOf(pass?.questionId ?? "") + 1,
    passes: passes.length,
    open: (runId: string, questionId: string) =>
      setPass({
        runId,
        questionId,
      }),
    go: (place: number) => {
      const questionId = passes[place - 1];

      if (questionId === undefined || pass === null) {
        return;
      }

      setPass({
        runId: pass.runId,
        questionId,
      });
    },
    close: () => setPass(null),
  };
}
