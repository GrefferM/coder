/** The conversation of the open project: the walks it holds, begun and ended from the screen, said back by push. */
export const OPEN_WALKS_CHANNEL = "walks:open";
/** The project's config as the screen holds it now; a walk reads the config live. */
export const CONFIGURE_WALKS_CHANNEL = "walks:configure";
export const WALKS_STATE_CHANNEL = "walks:state";
/** The person's question, put to an agent. */
export const PUT_WALK_CHANNEL = "walks:put";
/** «ЗУПИНИТИ»: every walk on screen ends. */
export const STOP_WALKS_CHANNEL = "walks:stop";
/** «СПИТАТИ ЩЕ РАЗ» under one card. */
export const SAY_WALK_AGAIN_CHANNEL = "walks:say-again";
/** «+ НОВИЙ ЧАТ». */
export const FRESH_WALKS_CHANNEL = "walks:fresh";
/** A run opened from the history takes the conversation over. */
export const GO_ON_IN_WALKS_CHANNEL = "walks:go-on-in";
/** A run deleted by hand: the conversation lets go of it. */
export const LET_GO_WALKS_CHANNEL = "walks:let-go";

/** Pushed from main: the walks as they stand now. */
export const WALKS_CHANGED_CHANNEL = "walks:changed";
/** Pushed from main: the record was written to. */
export const WALKS_WRITTEN_CHANNEL = "walks:written";
/** Pushed from main: a provider answered, or did not, to a turn that reached its address. */
export const WALKS_HEARD_CHANNEL = "walks:heard";
