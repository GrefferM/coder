import { useCallback, useEffect, useState } from "react";
import { Mark } from "../mark";
import { useListWalk, useWindowDismiss, useWindowKeydown } from "../../hooks";
import { WalkedRow } from "../walked-row";
import { FIELD_INVALID_TRANSITION } from "../field/constants";
import { fieldBorderColor } from "./field-border-color";
import {
  PICKER_BACKGROUND_COLOR,
  PICKER_BORDER_COLOR,
  PICKER_BORDER_RADIUS_PX,
  PICKER_COUNT_COLOR,
  PICKER_FIELD_FONT_SIZE_PX,
  PICKER_FIELD_GAP_PX,
  PICKER_FIELD_PADDING,
  PICKER_LIST_MAX_HEIGHT_PX,
  PICKER_LIST_PADDING_PX,
  PICKER_MATCH_SEPARATOR,
  PICKER_NAME_FONT_SIZE_PX,
  PICKER_OPEN_BORDER_COLOR,
  PICKER_ROW_BORDER_RADIUS_PX,
  PICKER_ROW_COUNT_COLOR,
  PICKER_SEARCH_GAP_PX,
  PICKER_SEARCH_PADDING,
  PICKER_SEARCH_PLACEHOLDER,
  PICKER_VALUE_COLOR,
} from "./constants";
import type { PickerShellProps } from "./interfaces";

/** Shared picker shell: a field with a chevron, and a list over it whose search row counts matches as `4/7`. */
export function PickerShell<Item>({
  field,
  fieldColor,
  fieldRef,
  isInvalid = false,
  isChanged = false,
  items,
  matches,
  row,
  choose,
  lead,
  headRow,
  groupOf,
  head,
  openedBy = null,
  listMaxHeightPx = PICKER_LIST_MAX_HEIGHT_PX,
}: PickerShellProps<Item>) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const close = useCallback(() => {
    setIsOpen(false);
    setQuery("");
  }, []);

  // A press elsewhere opens the list from the top, with nothing typed — the search is the person's own.
  useEffect(() => {
    if (openedBy !== null) {
      setIsOpen(true);
      setQuery("");
    }
  }, [openedBy]);

  useWindowDismiss(isOpen, close);
  // An open list answers Escape itself; the panel underneath must not react.
  useWindowKeydown(isOpen, (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
    }
  });

  const matched = items.filter((item) => matches(item, query.trim().toLowerCase()));
  // The lead is a row like any other to the walk, and it stands before them all.
  const leadRows = lead === undefined ? 0 : 1;
  // The arrows walk the rows while the typing stays in the search, and Enter takes the row they stand on.
  const walk = useListWalk(leadRows + matched.length, isOpen, (index) => {
    if (lead !== undefined && index === 0) {
      lead.choose(close);

      return;
    }

    choose?.(matched[index - leadRows], close);
  });

  return (
    <div
      className="d-flex flex-column"
      style={{
        position: "relative",
      }}
    >
      <button
        ref={fieldRef}
        type="button"
        aria-expanded={isOpen}
        onClick={() => (isOpen ? close() : setIsOpen(true))}
        className="d-flex align-items-center text-start"
        style={{
          padding: PICKER_FIELD_PADDING,
          gap: PICKER_FIELD_GAP_PX,
          borderRadius: PICKER_BORDER_RADIUS_PX,
          border: `1px solid ${fieldBorderColor(isOpen, isInvalid, isChanged)}`,
          background: PICKER_BACKGROUND_COLOR,
          color: fieldColor,
          fontSize: PICKER_FIELD_FONT_SIZE_PX,
          cursor: "pointer",
          transition: FIELD_INVALID_TRANSITION,
        }}
      >
        {field}
        <span
          className="flex-shrink-0"
          style={{
            color: PICKER_ROW_COUNT_COLOR,
          }}
        >
          {isOpen ? "⌃" : "⌄"}
        </span>
      </button>

      {isOpen && (
        <div
          role="listbox"
          className="d-flex flex-column"
          onClick={(event) => event.stopPropagation()}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1,
            borderRadius: PICKER_BORDER_RADIUS_PX,
            border: `1px solid ${PICKER_OPEN_BORDER_COLOR}`,
            background: PICKER_BACKGROUND_COLOR,
            overflow: "hidden",
          }}
        >
          <div
            className="d-flex align-items-center"
            style={{
              padding: PICKER_SEARCH_PADDING,
              gap: PICKER_SEARCH_GAP_PX,
              borderBottom: `1px solid ${PICKER_BORDER_COLOR}`,
            }}
          >
            <input
              spellCheck={false}
              autoFocus
              value={query}
              placeholder={PICKER_SEARCH_PLACEHOLDER}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={walk.onKeyDown}
              className="flex-fill"
              style={{
                border: "none",
                background: "transparent",
                color: PICKER_VALUE_COLOR,
                fontSize: PICKER_NAME_FONT_SIZE_PX,
                outline: "none",
              }}
            />
            <Mark
              color={PICKER_COUNT_COLOR}
              isUpperCase={false}
              className="flex-shrink-0"
            >{`${matched.length}${PICKER_MATCH_SEPARATOR}${items.length}`}</Mark>
          </div>

          <div
            className="d-flex flex-column"
            style={{
              padding: PICKER_LIST_PADDING_PX,
              maxHeight: listMaxHeightPx,
              overflowY: "auto",
            }}
          >
            {lead !== undefined && (
              <WalkedRow walk={walk} index={0} borderRadius={PICKER_ROW_BORDER_RADIUS_PX}>
                {lead.row(close)}
              </WalkedRow>
            )}
            {headRow?.(close, matched.length)}
            {matched.map((item, index) => (
              <div key={index}>
                {groupOf !== undefined &&
                  (index === 0 || groupOf(matched[index - 1]) !== groupOf(item)) &&
                  head?.(groupOf(item))}
                <WalkedRow walk={walk} index={index + leadRows} borderRadius={PICKER_ROW_BORDER_RADIUS_PX}>
                  {row(item, close)}
                </WalkedRow>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
