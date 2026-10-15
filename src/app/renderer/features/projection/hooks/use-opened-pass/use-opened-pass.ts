import { useState } from "react";
import { runChanges, runPasses } from "../../logic";
import { oneWalk, runNamedToday, runStandings, useOpenedRun } from "../../../record";
import type { Agent, ProjectModel } from "../../../../interfaces";
import type { OpenedPassState } from "../../interfaces";

/** The pass whose projection stands over the canvas, found by its question's id; re-read on every write. */
export function useOpenedPass(agents: Agent[], models: ProjectModel[], written: number): OpenedPassState {
  const [pass, setPass] = useState<{ runId: string; questionId: string } | null>(null);
  const opened = useOpenedRun(pass?.runId ?? null, written);
  // Agents are named as in the stream.
  const run = opened.run === null ? null : runNamedToday(opened.run, agents);
  const passes = run === null ? [] : runPasses(run);
  /** One pass as the record kept it, with the record's own names, which the standings compare against today's. */
  const walked = opened.run === null || pass === null ? null : oneWalk(opened.run, pass.questionId);
  const standings = runStandings(walked, agents).filter((standing) =>
    (walked?.walk ?? []).some((step) => step.agentId === standing.id),
  );

  return {
    isOpen: pass !== null,
    standings,
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
