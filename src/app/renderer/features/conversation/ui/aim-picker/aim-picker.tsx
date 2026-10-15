import { useEffect, useRef, useState } from "react";
import { Hairline } from "../../../../components";
import type { KeyboardEvent } from "react";
import { useListWalk, useWindowDismiss } from "../../../../hooks";
import {
  AIM_PICKER_BORDER_COLOR,
  AIM_PICKER_BORDER_RADIUS_PX,
  AIM_PICKER_LIST_BACKGROUND_COLOR,
  AIM_PICKER_LIST_GAP_PX,
  AIM_PICKER_LIST_MAX_HEIGHT_PX,
  AIM_PICKER_LIST_OFFSET_PX,
  AIM_PICKER_LIST_PADDING_PX,
  AIM_PICKER_LIST_SHADOW,
  AIM_PICKER_LIST_WIDTH_PX,
  AIM_PICKER_OFF_FONT_SIZE_PX,
  AIM_PICKER_OFF_LABEL,
  AIM_PICKER_OFF_LABEL_COLOR,
  AIM_PICKER_OFF_LETTER_SPACING_PX,
  AIM_PICKER_OFF_PADDING,
  AIM_PICKER_RULE_MARGIN,
  AIM_PICKER_SEARCH_FROM,
} from "./constants";
import { AimButton, AimRow, AimSearch } from "./components";
import type { AimPickerProps } from "./interfaces";

/** Whom the chat is aimed at: shown in the header, chosen there. */
export function AimPicker({ agents, aimedAgentId, onAim }: AimPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [asked, setAsked] = useState("");
  const box = useRef<HTMLDivElement>(null);
  const aimed = agents.find((agent) => agent.id === aimedAgentId) ?? null;
  const hasSearch = agents.length >= AIM_PICKER_SEARCH_FROM;
  const found = agents.filter((agent) => agent.name.toLowerCase().includes(asked.trim().toLowerCase()));
  // The project's order, with switched-off agents together at the end.
  const walkable = [...found.filter((agent) => agent.isActive), ...found.filter((agent) => !agent.isActive)];
  const offAt = found.filter((agent) => agent.isActive).length;

  // Arrows walk the rows while typing stays in the field; opens on the aimed agent.
  const walk = useListWalk(
    walkable.length,
    isOpen,
    (index) => choose(walkable[index].id),
    Math.max(
      0,
      walkable.findIndex((agent) => agent.id === aimedAgentId),
    ),
  );

  useWindowDismiss(isOpen, () => setIsOpen(false));

  useEffect(() => {
    if (isOpen) {
      box.current?.focus();
    }
  }, [isOpen]);

  function open() {
    setAsked("");
    setIsOpen(true);
  }

  function choose(agentId: string) {
    setIsOpen(false);
    onAim(agentId);
  }

  /** An open list handles Escape itself; the walk and Enter are the list's own. */
  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      setIsOpen(false);

      return;
    }

    walk.onKeyDown(event);
  }

  return (
    <div className="position-relative">
      <AimButton aimed={aimed} isOpen={isOpen} onPress={() => (isOpen ? setIsOpen(false) : open())} />
      {isOpen && (
        <div
          ref={box}
          role="listbox"
          tabIndex={-1}
          onKeyDown={handleKeyDown}
          className="position-absolute end-0 d-flex flex-column"
          style={{
            top: `calc(100% + ${AIM_PICKER_LIST_OFFSET_PX}px)`,
            width: AIM_PICKER_LIST_WIDTH_PX,
            maxHeight: AIM_PICKER_LIST_MAX_HEIGHT_PX,
            overflowY: "auto",
            gap: AIM_PICKER_LIST_GAP_PX,
            padding: AIM_PICKER_LIST_PADDING_PX,
            borderRadius: AIM_PICKER_BORDER_RADIUS_PX,
            border: `1px solid ${AIM_PICKER_BORDER_COLOR}`,
            background: AIM_PICKER_LIST_BACKGROUND_COLOR,
            boxShadow: AIM_PICKER_LIST_SHADOW,
            outline: "none",
            zIndex: 1,
          }}
        >
          {hasSearch && (
            <AimSearch
              asked={asked}
              onAsk={(value) => {
                setAsked(value);
                walk.walkTo(0);
              }}
              onKeyDown={handleKeyDown}
            />
          )}
          {walkable.map((agent, index) => (
            <div key={agent.id} className="d-flex flex-column">
              {index === offAt && offAt > 0 && (
                <>
                  <Hairline margin={AIM_PICKER_RULE_MARGIN} />
                  <span
                    className="font-monospace"
                    style={{
                      padding: AIM_PICKER_OFF_PADDING,
                      color: AIM_PICKER_OFF_LABEL_COLOR,
                      fontSize: AIM_PICKER_OFF_FONT_SIZE_PX,
                      letterSpacing: AIM_PICKER_OFF_LETTER_SPACING_PX,
                    }}
                  >
                    {AIM_PICKER_OFF_LABEL}
                  </span>
                </>
              )}
              <AimRow
                agent={agent}
                isAimed={agent.id === aimedAgentId}
                isWalked={index === walk.walked}
                walkedRow={walk.walkedRow}
                onChoose={() => choose(agent.id)}
                onWalk={() => walk.walkTo(index)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
