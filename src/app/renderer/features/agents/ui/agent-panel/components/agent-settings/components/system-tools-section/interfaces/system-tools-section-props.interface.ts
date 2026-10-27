import type { ToolGrant } from "../../../../../../../../../interfaces";

/** The system commands field: the app's own commands, the same for every agent, and this one's grants of them. */
export interface SystemToolsSectionProps {
  grants: ToolGrant[];
  /** How many lines go out of this agent; with none a granted command has nobody to pass to. */
  followerCount: number;
  /** The saved system-commands line; null when unchanged. */
  wasValue: string | null;
  /** The provider has no function calls: the picker is shut, earlier grants stay listed. */
  isLocked: boolean;
  onGrantsChange: (grants: ToolGrant[]) => void;
}
