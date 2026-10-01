import { RuleWithWord } from "../../../../components";
import { dayLabel } from "../../../../utils/dates";
import {
  RUN_HISTORY_EMPTY_COLOR,
  RUN_HISTORY_EMPTY_FONT_SIZE_PX,
  RUN_HISTORY_EMPTY_NOTE,
  RUN_HISTORY_EMPTY_PADDING,
  RUN_HISTORY_GAP_PX,
  RUN_HISTORY_PADDING,
  RUN_HISTORY_QUIET_COLOR,
  RUN_SEARCH_NOTHING_LINE_HEIGHT,
  RUN_SEARCH_NOTHING_PADDING,
} from "./constants";
import { FoundRow, FoundRule, HistoryFoot, RunRowLine, RunSearch } from "./components";
import { nothingFoundNote } from "../../words";
import { lastWord } from "../../logic";
import { FOUND_CEILING_NOTE } from "../../constants";
import { RUN_HITS_LIMIT } from "../../../../../../contracts";
import type { RunHistoryProps } from "./interfaces";

/**
 * One row per run, newest first, grouped by start day, with one search over all. With a word typed the list is flat:
 * places ordered by message hour, with a rule naming the run wherever the record changes runs.
 */
export function RunHistory({ runs, agents, refusal, onOpen, onForget, query, hits, onQuery }: RunHistoryProps) {
  const now = new Date();
  const looked = query.trim();
  /**
   * One card per place the word stands in, in the given order (message hour, newest first); a hit whose flow the list no
   * longer holds is dropped.
   */
  const found =
    looked === ""
      ? []
      : hits.flatMap((hit) => {
          const run = runs.find((standing) => standing.id === hit.runId) ?? null;

          return run === null
            ? []
            : [
                {
                  run,
                  hit,
                },
              ];
        });

  if (runs.length === 0) {
    return (
      <div
        className="d-flex flex-column flex-fill align-items-center"
        style={{
          padding: RUN_HISTORY_EMPTY_PADDING,
        }}
      >
        <span
          className="text-center"
          style={{
            color: RUN_HISTORY_EMPTY_COLOR,
            fontSize: RUN_HISTORY_EMPTY_FONT_SIZE_PX,
          }}
        >
          {refusal ?? RUN_HISTORY_EMPTY_NOTE}
        </span>
      </div>
    );
  }

  return (
    <div
      className="d-flex flex-column flex-fill"
      style={{
        padding: RUN_HISTORY_PADDING,
        gap: RUN_HISTORY_GAP_PX,
        minHeight: 0,
        overflowY: "auto",
        userSelect: "text",
      }}
    >
      <RunSearch
        query={query}
        record={runs.length}
        places={found.length}
        runs={new Set(found.map(({ run }) => run.id)).size}
        onQuery={onQuery}
      />
      {refusal !== null && (
        <div
          style={{
            padding: RUN_SEARCH_NOTHING_PADDING,
          }}
        >
          <span
            style={{
              color: RUN_HISTORY_EMPTY_COLOR,
              fontSize: RUN_HISTORY_EMPTY_FONT_SIZE_PX,
              lineHeight: RUN_SEARCH_NOTHING_LINE_HEIGHT,
            }}
          >
            {refusal}
          </span>
        </div>
      )}
      {/* No «Історія порожня» here: the record exists, only the word is in none of it. */}
      {refusal === null && looked !== "" && found.length === 0 && (
        <div
          style={{
            padding: RUN_SEARCH_NOTHING_PADDING,
          }}
        >
          <span
            style={{
              color: RUN_HISTORY_EMPTY_COLOR,
              fontSize: RUN_HISTORY_EMPTY_FONT_SIZE_PX,
              lineHeight: RUN_SEARCH_NOTHING_LINE_HEIGHT,
            }}
          >
            {nothingFoundNote(looked)}
          </span>
        </div>
      )}
      {looked !== "" &&
        found.map(({ run, hit }, index) => (
          <div
            key={`${hit.runId}-${hit.questionId}-${hit.stepId ?? ""}-${index}`}
            className="d-flex flex-column"
            style={{
              gap: RUN_HISTORY_GAP_PX,
            }}
          >
            {/* The run's address, shown only where the record changes runs. */}
            {(index === 0 || found[index - 1].run.id !== run.id) && <FoundRule run={run} now={now} />}
            <FoundRow agents={agents} found={hit} looked={looked} onOpen={() => onOpen(run, hit)} />
          </div>
        ))}
      {/* The limit counts places, so the sentence says to add a letter. */}
      {looked !== "" && found.length >= RUN_HITS_LIMIT && (
        <div
          style={{
            padding: RUN_SEARCH_NOTHING_PADDING,
          }}
        >
          <span
            style={{
              color: RUN_HISTORY_EMPTY_COLOR,
              fontSize: RUN_HISTORY_EMPTY_FONT_SIZE_PX,
              lineHeight: RUN_SEARCH_NOTHING_LINE_HEIGHT,
            }}
          >
            {FOUND_CEILING_NOTE}
          </span>
        </div>
      )}
      {looked === "" &&
        runs.map((run, index) => {
          // Groups are by the day a flow last spoke, the same day the list is sorted by.
          const previous = index === 0 ? null : lastWord(runs[index - 1]);
          const isNewDay = previous === null || previous.toDateString() !== lastWord(run).toDateString();

          return (
            <div
              key={run.id}
              className="d-flex flex-column"
              style={{
                gap: RUN_HISTORY_GAP_PX,
              }}
            >
              {isNewDay && <RuleWithWord color={RUN_HISTORY_QUIET_COLOR}>{dayLabel(lastWord(run), now)}</RuleWithWord>}
              <RunRowLine
                run={run}
                agents={agents}
                now={now}
                onOpen={() => onOpen(run, null)}
                onForget={() => onForget(run)}
              />
            </div>
          );
        })}
      {/* The note concerns the record, so it shows under the record and not under a search. */}
      {looked === "" && <HistoryFoot />}
    </div>
  );
}
