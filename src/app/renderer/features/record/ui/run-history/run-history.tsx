import { RuleWithWord } from "../../../../components";
import { dayLabel } from "../../../../utils/dates";
import {
  RUN_HISTORY_EMPTY_COLOR,
  RUN_HISTORY_EMPTY_FONT_SIZE_PX,
  RUN_HISTORY_EMPTY_NOTE,
  RUN_HISTORY_EMPTY_PADDING,
  RUN_HISTORY_FAILED_NOTE,
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
 * The history — one row is one run, newest first, under the day it began, and one search over them all.
 *
 * With a word typed the list becomes a flat one of places, ordered by the hour of each message alone and
 * grouped by nothing; a quiet rule names the run wherever the record jumps to another. The record itself is
 * untouched, so the field emptying brings the runs back.
 */
export function RunHistory({ runs, agents, isFailed, onOpen, onForget, query, hits, onQuery }: RunHistoryProps) {
  const now = new Date();
  const looked = query.trim();
  /**
   * Every place the word stands in is a card of its own, so a flow that said it eight times stands here
   * eight times. The order is the record's own — by the hour of each message, newest first — and the list keeps it
   * as given. A hit whose flow the list does not hold is dropped: it belongs to a record read a moment ago and
   * swept since.
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
          {isFailed ? RUN_HISTORY_FAILED_NOTE : RUN_HISTORY_EMPTY_NOTE}
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
      {/* Not «Історія порожня» (23h) — the record is right here, and it is this word that is in none. */}
      {looked !== "" && found.length === 0 && (
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
            {/* The address of the run, said only where the record jumped to another one. */}
            {(index === 0 || found[index - 1].run.id !== run.id) && <FoundRule run={run} now={now} />}
            <FoundRow agents={agents} found={hit} looked={looked} onOpen={() => onOpen(run, hit)} />
          </div>
        ))}
      {/* The ceiling stands on places, so the sentence says what to do about places — add a letter. */}
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
          // The list is grouped by the day a flow last spoke, which is the day it is sorted by.
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
      {/* The note is about the record itself, so it stands under the record and not under a search. */}
      {looked === "" && <HistoryFoot />}
    </div>
  );
}
