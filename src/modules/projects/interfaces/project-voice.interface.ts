/** Where a project file's change is said. */
export interface ProjectVoice {
  changed(directory: string): void;
}
