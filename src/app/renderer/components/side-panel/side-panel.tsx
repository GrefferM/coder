import { type ReactNode } from "react";
import {
  SIDE_PANEL_VERTICAL_MARGIN_PX,
  SIDE_PANEL_GAP_PX,
  RAIL_WIDTH_PX,
  RAIL_VERTICAL_PADDING_PX,
  RAIL_BUTTON_GAP_PX,
  RAIL_REALM_PADDING_PX,
  RAIL_REALM_RULE_COLOR,
  RAIL_REALM_RULE_WIDTH_PX,
} from "./constants";
import { RailButton, Template } from "./components";
import { type SidePanelProps } from "./interfaces";

/** Docked panel with an icon rail and one `Template` for the active item; the open item's button collapses it. */
export function SidePanel({
  items,
  side,
  activeId,
  onActiveIdChange,
  widthPx,
  isCollapsed,
  onCollapsedChange,
}: SidePanelProps) {
  const activeItem = items.find((item) => item.id === activeId) ?? items[0];

  /** The rule across the rail goes before the first machine-scope section. */
  const firstMachineId = items.find((item) => item.realm === "machine")?.id ?? null;

  const railButtons: ReactNode = items.map((item) => {
    const button = (
      <RailButton
        key={item.id}
        glyph={item.glyph}
        label={item.label}
        side={side}
        isActive={!isCollapsed && item.id === activeItem.id}
        onSelect={() => {
          if (!isCollapsed && item.id === activeItem.id) {
            onCollapsedChange(true);

            return;
          }

          onActiveIdChange(item.id);
          onCollapsedChange(false);
        }}
      />
    );

    if (item.id !== firstMachineId) {
      return button;
    }

    return (
      <div
        key={item.id}
        className="d-flex flex-column align-items-center"
        style={{
          gap: RAIL_BUTTON_GAP_PX,
        }}
      >
        <span
          role="separator"
          style={{
            width: RAIL_REALM_RULE_WIDTH_PX,
            height: 1,
            margin: `${RAIL_REALM_PADDING_PX}px 0`,
            background: RAIL_REALM_RULE_COLOR,
          }}
        />
        {button}
      </div>
    );
  });

  const rail = (
    <div
      className="d-flex flex-column align-items-center flex-shrink-0"
      style={{
        width: RAIL_WIDTH_PX,
        marginTop: SIDE_PANEL_VERTICAL_MARGIN_PX,
        marginBottom: SIDE_PANEL_VERTICAL_MARGIN_PX,
        padding: `${RAIL_VERTICAL_PADDING_PX}px 0`,
        gap: RAIL_BUTTON_GAP_PX,
      }}
    >
      {railButtons}
    </div>
  );

  const panel = (
    <div
      className="d-flex align-items-stretch flex-shrink-0"
      style={{
        width: isCollapsed ? 0 : widthPx,
        marginTop: SIDE_PANEL_VERTICAL_MARGIN_PX,
        marginBottom: SIDE_PANEL_VERTICAL_MARGIN_PX,
        overflow: "hidden",
        transition: "width 0.2s ease",
      }}
    >
      <div
        className="d-flex"
        style={{
          width: widthPx,
        }}
      >
        <Template
          label={activeItem.label}
          pill={activeItem.pill}
          count={activeItem.count}
          hasUnsaved={activeItem.hasUnsaved}
        >
          {activeItem.content}
        </Template>
      </div>
    </div>
  );

  const gap = (
    <div
      className="flex-shrink-0"
      style={{
        width: SIDE_PANEL_GAP_PX,
      }}
    />
  );

  return (
    <div className="d-flex align-items-stretch flex-shrink-0">
      {side === "right" ? (
        <>
          {gap}
          {panel}
          {gap}
          {rail}
        </>
      ) : (
        <>
          {rail}
          {gap}
          {panel}
          {gap}
        </>
      )}
    </div>
  );
}
