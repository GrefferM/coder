import type { MacPermission } from "../../../../../contracts";

/** macOS's hearing as the section shows it: its permission, its languages, and the way to ask for the permission. */
export interface MacHearingState {
  /** `null` until macOS has said. */
  permission: MacPermission | null;
  /** macOS's own window is up and the person has not answered it. */
  isAsking: boolean;
  locales: string[];
  allow: () => Promise<void>;
  /** The system's page of who may recognise speech. */
  openSettings: () => void;
}
