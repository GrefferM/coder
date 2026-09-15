import { Fragment } from "react";
import { Hairline } from "../hairline";
import { useListWalk, useWindowDismiss, useWindowKeydown } from "../../hooks";
import { MenuLine } from "./components";
import { CANVAS_LAYER } from "../../constants";
import {
  CONTEXT_MENU_BACKGROUND_COLOR,
  CONTEXT_MENU_BORDER_COLOR,
  CONTEXT_MENU_BORDER_RADIUS_PX,
  CONTEXT_MENU_PADDING_PX,
  CONTEXT_MENU_SEPARATOR_MARGIN,
  CONTEXT_MENU_SHADOW,
  CONTEXT_MENU_WIDTH_PX,
} from "./constants";
import type { ContextMenuProps } from "./interfaces";

/** The menu right-clicking opens, at the point it was opened on. A click anywhere else, or Escape, dismisses it. */
export function ContextMenu({ at, items, onDismiss }: ContextMenuProps) {
  // On `click`: a right-click fires none, so it moves an open menu without closing it.
  useWindowDismiss(true, onDismiss);
  // The menu is a list too — the arrows walk it and Enter takes the line, a dead one taking nothing.
  const walk = useListWalk(items.length, true, (index) => {
    const item = items[index];

    if (item.isDisabled !== true) {
      item.onSelect();
    }
  });

  useWindowKeydown(true, (event) => {
    if (event.key === "Escape") {
      onDismiss();

      return;
    }

    walk.onKeyDown(event);
  });

  return (
    <div
      role="menu"
      className="d-flex flex-column"
      onClick={(event) => event.stopPropagation()}
      onMouseDown={(event) => event.stopPropagation()}
      onContextMenu={(event) => event.preventDefault()}
      style={{
        position: "absolute",
        left: at.x,
        top: at.y,
        zIndex: CANVAS_LAYER,
        width: CONTEXT_MENU_WIDTH_PX,
        padding: CONTEXT_MENU_PADDING_PX,
        borderRadius: CONTEXT_MENU_BORDER_RADIUS_PX,
        border: `1px solid ${CONTEXT_MENU_BORDER_COLOR}`,
        backgroundColor: CONTEXT_MENU_BACKGROUND_COLOR,
        boxShadow: CONTEXT_MENU_SHADOW,
      }}
    >
      {items.map((item, index) => (
        <Fragment key={item.label}>
          {item.hasSeparatorAbove && <Hairline margin={CONTEXT_MENU_SEPARATOR_MARGIN} />}
          <MenuLine item={item} isWalked={index === walk.walked} onWalk={() => walk.walkTo(index)} />
        </Fragment>
      ))}
    </div>
  );
}
