/** The system's own page of who may use the microphone, by platform; a platform without one is not here. */
export const MICROPHONE_SETTINGS_PAGES: Partial<Record<NodeJS.Platform, string>> = {
  darwin: "x-apple.systempreferences:com.apple.preference.security?Privacy_Microphone",
  win32: "ms-settings:privacy-microphone",
};
