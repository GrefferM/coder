/**
 * The shades that repeat across the app; other colour constants alias them. `app.scss` repeats a few by hand, as Sass
 * cannot read them.
 */

/** The second ground: under every panel, card and step head, on top of the content's own ground. */
export const PANEL_GROUND_COLOR = "#12151f";

/** The label of what is touched: a step head, a tab, a control at rest. */
export const CONTROL_AT_REST_COLOR = "#838ba6";

/** Every edge that is neither hovered nor focused. */
export const BORDER_AT_REST_COLOR = "#262b3a";

/** What is read. */
export const FIRST_LEVEL_TEXT_COLOR = "#dde1ee";

/** What qualifies what is read. */
export const SECOND_LEVEL_TEXT_COLOR = "#6b7490";

/** Captions, chevrons, and the drift paint of a link. */
export const QUIET_MARK_COLOR = "#4a5164";

/** A line between two things at rest: canvas links and run graph steps. */
export const LINE_AT_REST_COLOR = "#2b3145";

/** The rule between blocks, and the edge of a head or a foot. */
export const HAIRLINE_COLOR = "#1c202c";

/** What the app says in a sentence rather than in a mark. */
export const WORDS_COLOR = "#aab3cc";

/** Two shades of trouble: fallen (loud, something stopped) and broken but standing (quieter, the person is told). */
export const FALLEN_COLOR = "#f0a5ac";
export const BROKEN_COLOR = "#a9808a";
