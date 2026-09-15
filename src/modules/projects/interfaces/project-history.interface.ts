/** The slice of a project's deletion history that forgetting a project needs. */
export interface ProjectHistory {
  forgetProject: (directory: string) => Promise<void>;
}
