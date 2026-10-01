/** How the bridge and `Error` prefix a fault; neither is the one who failed talking. */
export const IPC_WRAPPER_PATTERN = /^Error invoking remote method '[^']*':\s*/;
export const THROWN_PREFIX = /^Error:\s*/;
