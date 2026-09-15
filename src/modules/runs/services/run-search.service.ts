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
 * One word looked for through a project's whole record — every question, what every step said, and the calls.
 *
 * Every place the word stands in is a hit of its own: a word is looked for to reach the place it was said, and a
 * flow that said it eight times has eight such places. The price is real — a record where the same sentence
 * stands in every step answers a short word with a great many rows — so the answer is cut at `RUN_HITS_LIMIT`.
 *
 * The list is ordered by the hour of each message alone, newest first, and the run it stands in does not group it:
 * a run that ran for an hour would otherwise sink its freshest message under one that ended before it began. The
 * ceiling cuts off the same order, so what falls away is always the oldest.
 */
export class RunSearch {
  constructor(private readonly store: RunStore) {}

  /** Every run of this project the word stands in, each with the found words themselves. */
  async find(directory: string, query: string): Promise<RunHit[]> {
    const looked = query.trim().toLocaleLowerCase();

    // An empty field is not a search that found nothing: the list stands whole, and nobody is asking anything.
    if (looked === "") {
      return [];
    }

    const runs = await this.store.runsIn(directory);
    const runIds = runs.map((run) => run.id);
    const asked = await this.store.askedInRuns(runIds);
    const walked = await this.store.walksOf(runIds);
    const stepIds = walked.map((step) => step.id);
    // Each table is read once for the whole project: a query per run — or worse, per row — on every typed letter is
    // the one thing this search cannot afford.
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

    // The freshest message first, whichever flow it stands in. Two places of one message — a command and its output
    // — share an hour, and the sort holds their order, which is the order the walk ran.
    return hits.sort((one, other) => other.at.getTime() - one.at.getTime()).slice(0, RUN_HITS_LIMIT);
  }

  /**
   * Every place the word stands in one run, in the order the walk ran. One place is one hit: a step that says the
   * word twice is still the one message to walk to.
   */
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
      // A match in the question itself gets no row — the rule over the group is already the question, so
      // the rule becomes the place. It is still a place, and still counted.
      if (holds(question.asked, looked)) {
        hits.push({
          runId,
          questionId: question.id,
          stepId: null,
          agentId: null,
          agentName: null,
          // The person's own words stand on no step of the walk, but they were said at an hour like any.
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
        // The address of the message, read where its card reads it — the step of the walk it
        // stood on and the hour it began.
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

        // A call says itself with its command and its output, and both are searched the same way.
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
                // A call's output has no sentences, so the found thing starts at the start of its line.
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

/** The word is caught inside a word too («сесії» on «сесі»), and the case it was typed in says nothing. */
function holds(words: string, looked: string): boolean {
  return words.toLocaleLowerCase().includes(looked);
}

/**
 * Which step of the walk each turn stood on. The rule is `levelsOf`'s — the same one the stream and the
 * projection count by — and what belongs here is that a step is named by its own id and fed by the rows the
 * record keeps beside it, gathered across every run the search crossed.
 */
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
 * The found thing itself — from the start of the sentence it stands in, or of the line where there are no
 * sentences. Only the left edge is cut here; where the words end is the card's business.
 */
function foundIn(words: string, looked: string, hasSentences: boolean): string {
  const at = words.toLocaleLowerCase().indexOf(looked);
  const before = words.slice(0, at);
  const breaks = hasSentences ? [".", "!", "?", "\n"] : ["\n"];
  const from = Math.max(...breaks.map((mark) => before.lastIndexOf(mark)));

  return words.slice(from + 1, from + 1 + RUN_FOUND_LENGTH).trim();
}
