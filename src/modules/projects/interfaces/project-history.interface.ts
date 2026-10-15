export interface ProjectHistory {
  forgetProject: (directory: string) => Promise<void>;
}
