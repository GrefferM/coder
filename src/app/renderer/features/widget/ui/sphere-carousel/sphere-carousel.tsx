import { WidgetSphere } from "../widget-sphere";
import {
  WIDGET_CAROUSEL_CELL_PX,
  WIDGET_CAROUSEL_GAP_PX,
  WIDGET_CAROUSEL_NAME_FONT_SIZE_PX,
  WIDGET_CAROUSEL_NAME_LETTER_SPACING_PX,
  WIDGET_CAROUSEL_PADDING,
  WIDGET_CAROUSEL_SPHERE_PX,
  WIDGET_CELL_DIM_OPACITY,
  WIDGET_RULE_COLOR,
} from "../../constants";
import type { SphereCarouselProps } from "../../interfaces";

/**
 * Every agent of the widget's project as a small sphere, scrolling sideways (52a). A press makes it the big one, where
 * the walk begins; a switched-off agent stands grey and cannot be chosen.
 */
export function SphereCarousel({ agents, chosenAgentId, onChoose }: SphereCarouselProps) {
  return (
    <div
      role="listbox"
      className="d-flex flex-shrink-0"
      style={{
        padding: WIDGET_CAROUSEL_PADDING,
        overflowX: "auto",
        borderBottom: `1px solid ${WIDGET_RULE_COLOR}`,
      }}
    >
      {agents.map((agent) => {
        const isChosen = agent.id === chosenAgentId;

        return (
          <button
            key={agent.id}
            type="button"
            role="option"
            aria-selected={isChosen}
            aria-label={agent.name}
            disabled={!agent.isActive}
            onClick={() => onChoose(agent.id)}
            className="d-flex flex-column align-items-center flex-shrink-0"
            style={{
              width: WIDGET_CAROUSEL_CELL_PX,
              gap: WIDGET_CAROUSEL_GAP_PX,
              padding: 0,
              border: "none",
              background: "transparent",
              opacity: isChosen ? 1 : WIDGET_CELL_DIM_OPACITY,
              cursor: agent.isActive ? "pointer" : "default",
            }}
          >
            <WidgetSphere
              color={agent.color}
              isActive={agent.isActive}
              isChosen={isChosen}
              sizePx={WIDGET_CAROUSEL_SPHERE_PX}
            />
            <span
              className="font-monospace text-uppercase text-truncate mw-100"
              style={{
                color: agent.color,
                fontSize: WIDGET_CAROUSEL_NAME_FONT_SIZE_PX,
                letterSpacing: WIDGET_CAROUSEL_NAME_LETTER_SPACING_PX,
              }}
            >
              {agent.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
