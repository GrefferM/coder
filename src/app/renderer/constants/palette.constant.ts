/**
 * The shades that repeat across the app; every other colour constant of one is an alias. Sass cannot read them,
 * so `app.scss` writes out by hand the few it needs — a placeholder's colour, the window's own frame — and that
 * stylesheet is the one place in the app where a shade of this file stands written twice.
 */

/**
 * The second ground: what lies **on** the content. The app has two — the content's own behind everything, and
 * this one under every panel, card and head of a step. Two grounds is not an oversight; it is what makes a panel
 * read as standing on the canvas rather than cut out of it.
 */
export const PANEL_GROUND_COLOR = "#12151f";

/** The label of what is touched — the head of a step, a tab, a control at rest. */
export const CONTROL_AT_REST_COLOR = "#838ba6";

/** Every edge that is neither hovered nor focused. */
export const BORDER_AT_REST_COLOR = "#262b3a";

/** What is read. */
export const FIRST_LEVEL_TEXT_COLOR = "#dde1ee";

/** What qualifies what is read. */
export const SECOND_LEVEL_TEXT_COLOR = "#6b7490";

/** Captions, chevrons, and the drift paint of a link. */
export const QUIET_MARK_COLOR = "#4a5164";

/** A line between two things at rest — the canvas's links, and the run graph's steps. */
export const LINE_AT_REST_COLOR = "#2b3145";

/** The rule between blocks, and the edge of a head or a foot. */
export const HAIRLINE_COLOR = "#1c202c";

/** What the app says in a sentence rather than in a mark. */
export const WORDS_COLOR = "#aab3cc";

/**
 * The two shades of trouble, and they are not one: a thing that **fell** is loud, because something was being
 * done and stopped; a thing that is **broken but still standing** is quieter, because nothing is happening and
 * the person is being told, not interrupted. Everything that says either — a fallen turn, a server that will
 * not answer, a tie whose file is gone, the word on a deleting act — takes its colour from here.
 */
export const FALLEN_COLOR = "#f0a5ac";
export const BROKEN_COLOR = "#a9808a";
