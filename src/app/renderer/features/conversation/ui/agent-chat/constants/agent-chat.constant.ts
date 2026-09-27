import type { IconTone } from "../../../../../components";
import {
  BORDER_AT_REST_COLOR,
  BROKEN_COLOR,
  FALLEN_COLOR,
  FIRST_LEVEL_TEXT_COLOR,
  HAIRLINE_COLOR,
  INTERACTION_ACCENT_COLOR,
  PANEL_GROUND_COLOR,
  QUIET_MARK_COLOR,
  SECOND_LEVEL_TEXT_COLOR,
  WORDS_COLOR,
} from "../../../../../constants";
import type { ChatStopReason } from "../../../../../interfaces";
import type { FieldStanding, NotStartedAct } from "../../../interfaces";
import type { ChatWayOut, FieldGround } from "../interfaces";

/**
 * Where a card's act leads — the place it names, and the hand of the stream that opens it. One row per place,
 * counted by the union: a place added without a hand does not compile, and the card is the only thing that chooses.
 */
export const CHAT_WAYS_OUT: Record<NotStartedAct, ChatWayOut> = {
  providers: "onOpenProviders",
  settings: "onOpenSettings",
  prompt: "onOpenPrompt",
  grants: "onOpenGrants",
  model: "onOpenModel",
};

/** Chat column — every reply a card under its own name, the day said once. */
export const AGENT_CHAT_LIST_PADDING = "16px";
export const AGENT_CHAT_LIST_GAP_PX = 14;
export const AGENT_CHAT_RULE_COLOR = HAIRLINE_COLOR;
export const AGENT_CHAT_QUIET_FONT_SIZE_PX = 9;
export const AGENT_CHAT_QUIET_LETTER_SPACING_PX = 1.5;

/** What is said, whoever said it. */
export const AGENT_CHAT_TEXT_FONT_SIZE_PX = 12.5;
export const AGENT_CHAT_TEXT_LINE_HEIGHT = 1.5;
export const AGENT_CHAT_TEXT_COLOR = FIRST_LEVEL_TEXT_COLOR;

/** One card recipe for the whole stream — the person's reply and the agents' alike. */
export const AGENT_CHAT_AGENT_GAP_PX = 6;
export const AGENT_CHAT_CARD_BACKGROUND_COLOR = "#171b26";
/** The border of a thing at rest, so the card takes no colour of its own. */
export const AGENT_CHAT_CARD_BORDER_COLOR = BORDER_AT_REST_COLOR;
export const AGENT_CHAT_CARD_BORDER_RADIUS_PX = 10;
export const AGENT_CHAT_CARD_PADDING = "10px";

/** Composer; the send keystroke is named under the field. */
export const AGENT_CHAT_COMPOSER_PADDING = "12px";
export const AGENT_CHAT_COMPOSER_GAP_PX = 8;
export const AGENT_CHAT_FIELD_BORDER_RADIUS_PX = 10;
export const AGENT_CHAT_FIELD_PADDING = "9px 10px";
/** The strip the field is pulled by: it stands over the field, and is the whole of what can be dragged. */
export const AGENT_CHAT_GRIP_HEIGHT_PX = 9;
export const AGENT_CHAT_GRIP_LINE_WIDTH_PX = 30;
export const AGENT_CHAT_GRIP_LINE_HEIGHT_PX = 2;
export const AGENT_CHAT_GRIP_LINE_RADIUS_PX = 2;
export const AGENT_CHAT_GRIP_COLOR = "#262b3a";
export const AGENT_CHAT_GRIP_LIT_COLOR = "#4a5164";
export const AGENT_CHAT_GRIP_LABEL = "Висота поля";
export const AGENT_CHAT_FIELD_PLACEHOLDER_PREFIX = "Завдання для ";
export const AGENT_CHAT_FIELD_PLACEHOLDER_SUFFIX = "…";
/** Nobody is aimed at yet — the stream stands, and a question has nowhere to go. */
export const AGENT_CHAT_NO_AIM_PLACEHOLDER = "Клікніть по сфері, щоб питати того агента";
export const AGENT_CHAT_NO_AIM_HINT = "НІКОГО НЕ ВИБРАНО";
export const AGENT_CHAT_SEND_LABEL = "Надіслати";
export const AGENT_CHAT_SEND_SIZE_PX = 28;
export const AGENT_CHAT_SEND_BORDER_RADIUS_PX = 8;
export const AGENT_CHAT_SEND_BACKGROUND_COLOR = "#1b1f2c";
export const AGENT_CHAT_SEND_ICON_SIZE_PX = 14;
export const AGENT_CHAT_SEND_ICON_COLOR = "#5c6478";

/** While a turn runs, the hint is replaced by the stop action (muted red). */
export const AGENT_CHAT_STOP_LABEL = "Зупинити";
/** The one button that ends the walk — its own tone, not the accent of an ordinary act. */
export const AGENT_CHAT_STOP_TONE: IconTone = {
  rest: BROKEN_COLOR,
  lit: "#c79aa4",
};
export const AGENT_CHAT_STOP_ICON_SIZE_PX = 11;
/**
 * The answer to a press that could not go through: the stop blinks once in its full colour and quiets itself.
 * Colours and timing belong to the class — 120ms up, 400ms down — and no press adds to another.
 */
export const AGENT_CHAT_STOP_BLINK_CLASS = "stop-blink";
export const AGENT_CHAT_STOP_GAP_PX = 7;

/**
 * While the walk goes, the field itself says it is not sending — a dimmer edge and a darker ground, with a
 * word in place of the name. It is not stitched and not put out: writing is allowed, and what is typed waits.
 */
export const AGENT_CHAT_WALKING_PLACEHOLDER = "Ходьба йде — зачекайте або зупиніть";

/**
 * The three grounds of the field, differing by ground and edge alone. The word takes one of two colours, set by
 * a class because no inline style reaches ::placeholder.
 */
export const AGENT_CHAT_FIELD_GROUNDS: Record<FieldStanding, FieldGround> = {
  open: {
    background: "#171b26",
    border: BORDER_AT_REST_COLOR,
    wordClass: null,
  },
  walking: {
    background: "#141824",
    border: HAIRLINE_COLOR,
    wordClass: null,
  },
  stitched: {
    background: PANEL_GROUND_COLOR,
    border: HAIRLINE_COLOR,
    wordClass: "field-stitched",
  },
};

/** Placeholder when the agent is switched off. */
export const AGENT_CHAT_OFF_PLACEHOLDER = "Агента вимкнено";
export const AGENT_CHAT_OFF_HINT = "Увімкніть агента в налаштуваннях";

/** An unread run is the only thing an empty stream says; the rest of it stands silent. */
export const AGENT_CHAT_EMPTY_PADDING = "22px 16px";
export const AGENT_CHAT_EMPTY_COLOR = QUIET_MARK_COLOR;
export const AGENT_CHAT_EMPTY_FONT_SIZE_PX = 12;
export const AGENT_CHAT_EMPTY_LINE_HEIGHT = 1.6;

/** Labels for why a run stopped at a link; «зайнятий» is read off old rows and written by nobody. */
export const AGENT_CHAT_STOP_REASON_LABELS: Record<ChatStopReason, string> = {
  off: "вимкнений",
  busy: "зайнятий",
};

/** A run of the history opened in the stream; it is over, so the composer steps aside. */
export const AGENT_CHAT_OPENED_FAILED_NOTE = "Не вдалося прочитати цей запуск.";
export const AGENT_CHAT_OPENED_BACKGROUND_COLOR = "#171b26";
export const AGENT_CHAT_OPENED_PADDING = "9px 12px";
export const AGENT_CHAT_OPENED_GAP_PX = 8;
export const AGENT_CHAT_OPENED_DOT_SIZE_PX = 6;
export const AGENT_CHAT_OPENED_DOT_GLOW_PX = 6;
export const AGENT_CHAT_OPENED_WHEN_COLOR = "#5c6478";
export const AGENT_CHAT_OPENED_LABEL_COLOR = "#dde1ee";

/**
 * The card the search drove to, lit for a moment and then let go. Coming here from a pressed row there is no next
 * match and nothing to move a mark to, so an edge that stayed would read as part of the card; the ride already
 * said where, and the light only has to be seen.
 *
 * An inset shadow and not a border: a border would move the card's own by a pixel, and every card that was never
 * found would pay for it. Transparent at rest, so it fades out rather than snapping off.
 */
export const AGENT_CHAT_FOUND_EDGE = "inset 2px 0 0 #38a3ff";
export const AGENT_CHAT_FOUND_EDGE_GONE = "inset 2px 0 0 transparent";
export const AGENT_CHAT_FOUND_FADE = "box-shadow 600ms ease";
/** How long the light stands before it goes: long enough to be found by the eye, short enough not to be furniture. */
export const AGENT_CHAT_FOUND_MS = 2_400;

/** A rule over every question but the first: one conversation, and this is where the person asked again. */
export const AGENT_CHAT_ASKED_AGAIN_LABEL = "НОВИЙ ЗАПИТ";
/** One dot for how the run stands — an ordinary end, a fall, a hand, or still going. */
export const AGENT_CHAT_OPENED_DOT_COLORS: Record<string, string> = {
  done: "#4ade80",
  failed: FALLEN_COLOR,
  stopped: "#5c6478",
  // Nothing was sent, so there is no colour to give it — an outline around an empty place, as in the row.
  notSent: "transparent",
};
export const AGENT_CHAT_OPENED_RUNNING_DOT_COLOR = "#4ade80";
export const AGENT_CHAT_OPENED_EMPTY_DOT_BORDER = "1px solid #5c6478";

/** The band's own act, on its right — writing the stream out as a transcript. */
export const AGENT_CHAT_OPENED_EXPORT_LABEL = "ЕКСПОРТУВАТИ";
export const AGENT_CHAT_OPENED_EXPORT_TONE: IconTone = {
  rest: AGENT_CHAT_OPENED_WHEN_COLOR,
  lit: AGENT_CHAT_OPENED_LABEL_COLOR,
};

/**
 * The button down: one button, there exactly while the end of the stream is out of view. News labels it rather
 * than raising a second — coming back down and looking at what came is a single act.
 *
 * Pressed to the right edge and above the field: the centre is the eye's path down the text, and a button there
 * would cover the last reply.
 */
export const AGENT_CHAT_TO_BOTTOM_LABEL = "Вниз потоку";
export const AGENT_CHAT_TO_BOTTOM_SIZE_PX = 32;
export const AGENT_CHAT_TO_BOTTOM_RIGHT_PX = 14;
export const AGENT_CHAT_TO_BOTTOM_BOTTOM_PX = 16;
export const AGENT_CHAT_TO_BOTTOM_SHADOW = "0 6px 18px rgba(0,0,0,0.45)";
export const AGENT_CHAT_TO_BOTTOM_ICON_SIZE_PX = 13;
export const AGENT_CHAT_TO_BOTTOM_ICON_STROKE = "2.2";
export const AGENT_CHAT_TO_BOTTOM_ICON_PATH = "M12 5v14M5 12l7 7 7-7";
export const AGENT_CHAT_TO_BOTTOM_ICON_COLOR = WORDS_COLOR;
export const AGENT_CHAT_TO_BOTTOM_NEWS_PADDING = "0 12px 0 10px";
export const AGENT_CHAT_TO_BOTTOM_NEWS_GAP_PX = 7;
/** With a number the arrow and the edge take the green of «іде»: what came, came in a stream that is alive. */
export const AGENT_CHAT_TO_BOTTOM_NEWS_COLOR = "#4ade80";
export const AGENT_CHAT_TO_BOTTOM_NEWS_BORDER_COLOR = "#2c4a3a";
export const AGENT_CHAT_TO_BOTTOM_NEWS_FONT_SIZE_PX = 9;
export const AGENT_CHAT_TO_BOTTOM_NEWS_LETTER_SPACING_PX = 1;

/** «+ ПРИКРІПИТИ» — the second act under the field, beside the send hand: second-level at rest, accent under the pointer. */
export const AGENT_CHAT_ATTACH_LABEL = "+ ПРИКРІПИТИ";
export const AGENT_CHAT_ATTACH_TONE: IconTone = {
  rest: SECOND_LEVEL_TEXT_COLOR,
  lit: INTERACTION_ACCENT_COLOR,
};

/** The row of chips between the field and the hand — it stands only while something is attached, and wraps into rows. */
export const AGENT_CHAT_ATTACH_CHIPS_GAP_PX = 6;
/** One chip: its icon, name, weight and ×. A folder and a file are told apart by the icon alone. */
export const AGENT_CHAT_ATTACH_CHIP_GAP_PX = 6;
export const AGENT_CHAT_ATTACH_CHIP_PADDING = "3px 3px 3px 8px";
export const AGENT_CHAT_ATTACH_CHIP_BORDER_RADIUS_PX = 7;
export const AGENT_CHAT_ATTACH_CHIP_BACKGROUND_COLOR = "#171b26";
export const AGENT_CHAT_ATTACH_CHIP_BORDER_COLOR = BORDER_AT_REST_COLOR;
export const AGENT_CHAT_ATTACH_GLYPH_SIZE_PX = 11;
export const AGENT_CHAT_ATTACH_GLYPH_COLOR = "#838ba6";
export const AGENT_CHAT_ATTACH_NAME_FONT_SIZE_PX = 10.5;
export const AGENT_CHAT_ATTACH_NAME_COLOR = FIRST_LEVEL_TEXT_COLOR;
export const AGENT_CHAT_ATTACH_WEIGHT_FONT_SIZE_PX = 9;
export const AGENT_CHAT_ATTACH_WEIGHT_LETTER_SPACING_PX = 1;
export const AGENT_CHAT_ATTACH_WEIGHT_COLOR = "#5c6478";
/** The × on a chip — a step closer under the pointer, the way a scale step is (42a); its box lights, its glyph brightens. */
export const AGENT_CHAT_ATTACH_CLOSE_SIZE_PX = 18;
export const AGENT_CHAT_ATTACH_CLOSE_BORDER_RADIUS_PX = 5;
export const AGENT_CHAT_ATTACH_CLOSE_GLYPH_SIZE_PX = 9;
export const AGENT_CHAT_ATTACH_CLOSE_REST_COLOR = "#5c6478";
export const AGENT_CHAT_ATTACH_CLOSE_LIT_COLOR = FIRST_LEVEL_TEXT_COLOR;
export const AGENT_CHAT_ATTACH_CLOSE_LIT_BACKGROUND_COLOR = "#1b1f2c";
export const AGENT_CHAT_ATTACH_CLOSE_LABEL = "Відкріпити";

/** The «ПРИКРІПЛЕНО:» record under a sent question — an app row, not a card: the same icons, quiet, and no ×. */
export const AGENT_CHAT_ATTACHED_LABEL = "ПРИКРІПЛЕНО:";
export const AGENT_CHAT_ATTACHED_ROW_GAP_PX = 10;
export const AGENT_CHAT_ATTACHED_ITEM_GAP_PX = 4;
export const AGENT_CHAT_ATTACHED_GLYPH_SIZE_PX = 11;
export const AGENT_CHAT_ATTACHED_GLYPH_COLOR = "#5c6478";
export const AGENT_CHAT_ATTACHED_LABEL_COLOR = QUIET_MARK_COLOR;
export const AGENT_CHAT_ATTACHED_NAME_COLOR = SECOND_LEVEL_TEXT_COLOR;
export const AGENT_CHAT_ATTACHED_NAME_LETTER_SPACING_PX = 0.5;
