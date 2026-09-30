import { RUN_FOUND_LENGTH } from "../constants";
import { levelsOf, RUN_HITS_LIMIT } from "../../../contracts";
import type {
  RunCallEntity,
  RunQuestionEntity,
  RunStepAgentEntity,
  RunStepEntity,
  RunStepFeedEntity,
} from "../entities";
import type { RunHit, RunStore } from "../interfaces";

/**
 * One word searched through a project's whole record: every question, what every step said, and the calls. Each
 * occurrence place is its own hit, cut at `RUN_HITS_LIMIT`; ordered by message hour alone, newest first.
 */
export class RunSearch {
  constructor(private readonly store: RunStore) {}

  /** Every run of this project containing the word, with the found words. */
  async find(directory: string, query: string): Promise<RunHit[]> {
    const looked = query.trim().toLocaleLowerCase();

    // An empty query is no search: the list is returned whole.
    if (looked === "") {
      return [];
    }

    const runs = await this.store.runsIn(directory);
    const runIds = runs.map((run) => run.id);
    const asked = await this.store.askedInRuns(runIds);
    const walked = await this.store.walksOf(runIds);
    const stepIds = walked.map((step) => step.id);
    // Each table is read once for the whole project, not per run or row.
    const made = await this.store.callsIn(stepIds);
    const who = await this.store.whoIn(stepIds);
    const feeds = await this.store.feedsIn(stepIds);
    const named = new Map(who.map((one) => [one.step.id, one]));
    const levels = levelsIn(walked, feeds);
    const hits: RunHit[] = [];

    for (const runId of runIds) {
      hits.push(
        ...this.hitsIn(
          looked,
          runId,
          asked.filter((question) => question.run.id === runId),
          walked.filter((step) => step.run.id === runId),
          made,
          named,
          levels,
        ),
      );
    }

    // Newest message first across flows; the stable sort keeps the walk's order for places of one message.
    return hits.sort((one, other) => other.at.getTime() - one.at.getTime()).slice(0, RUN_HITS_LIMIT);
  }

  /** Every place of the word in one run, in walk order; a step saying it twice is one hit. */
  private hitsIn(
    looked: string,
    runId: string,
    asked: RunQuestionEntity[],
    walked: RunStepEntity[],
    made: RunCallEntity[],
    named: Map<string, RunStepAgentEntity>,
    levels: Record<string, number>,
  ): RunHit[] {
    const hits: RunHit[] = [];

    for (const question of [...asked].sort((one, other) => one.place - other.place)) {
      // A match in the question gets a hit without a step, since the group rule is already the question.
      if (holds(question.asked, looked)) {
        hits.push({
          runId,
          questionId: question.id,
          stepId: null,
          agentId: null,
          agentName: null,
          // The question stands on no step but has an hour.
          step: null,
          at: question.askedAt,
          found: foundIn(question.asked, looked, true),
          isCall: false,
        });
      }

      const steps = walked
        .filter((step) => step.question.id === question.id)
        .sort((one, other) => one.place - other.place);

      for (const step of steps) {
        const stood = named.get(step.id) ?? null;
        // The message's address as its card reads it: the step it stood on and its start hour.
        const address = {
          agentId: stood?.agentId ?? null,
          agentName: stood?.name ?? null,
          step: levels[step.id] ?? null,
          at: step.startedAt,
        };

        if (holds(step.said, looked)) {
          hits.push({
            runId,
            questionId: question.id,
            stepId: step.id,
            ...address,
            found: foundIn(step.said, looked, true),
            isCall: false,
          });
        }

        // A call's command and output are searched alike.
        for (const call of made
          .filter((one) => one.step.id === step.id)
          .sort((one, other) => one.place - other.place)) {
          for (const words of [call.line, call.output]) {
            if (holds(words, looked)) {
              hits.push({
                runId,
                questionId: question.id,
                stepId: step.id,
                ...address,
                // A call's output has no sentences, so the found thing starts at the line start.
                found: foundIn(words, looked, false),
                isCall: true,
              });
            }
          }
        }
      }
    }

    return hits;
  }
}

/** Matches inside words too («сесії» on «сесі»), case-insensitively. */
function holds(words: string, looked: string): boolean {
  return words.toLocaleLowerCase().includes(looked);
}

/** The step level of each turn, by `levelsOf`'s rule (as in the stream and projection), across every run searched. */
function levelsIn(walked: RunStepEntity[], feeds: RunStepFeedEntity[]): Record<string, number> {
  const fedBy = new Map<string, string[]>();

  for (const feed of feeds) {
    fedBy.set(feed.step.id, [...(fedBy.get(feed.step.id) ?? []), feed.from.id]);
  }

  return levelsOf(
    walked.map((step) => ({
      id: step.id,
      at: step.id,
      fedBy: fedBy.get(step.id) ?? [],
    })),
  );
}

/**
 * The found thing from the start of its sentence (or line, without sentences); only the left edge is cut, the right is
 * the card's.
 */
function foundIn(words: string, looked: string, hasSentences: boolean): string {
  const at = words.toLocaleLowerCase().indexOf(looked);
  const before = words.slice(0, at);
  const breaks = hasSentences ? [".", "!", "?", "\n"] : ["\n"];
  const from = Math.max(...breaks.map((mark) => before.lastIndexOf(mark)));

  return words.slice(from + 1, from + 1 + RUN_FOUND_LENGTH).trim();
}
