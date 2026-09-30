import { PROJECT_VIEW_CHANNEL, REMEMBER_PROJECT_VIEW_CHANNEL } from "../../../../../contracts";
import type { ProjectView } from "../../../interfaces";

/** Whether the note this machine kept is still a view. */
function isView(held: unknown): held is ProjectView {
  const view = <Partial<ProjectView>>held;

  return (
    typeof held === "object" &&
    held !== null &&
    typeof view.scale === "number" &&
    typeof view.sectionId === "string" &&
    typeof view.isCollapsed === "boolean" &&
    typeof view.pan?.x === "number" &&
    typeof view.pan.y === "number"
  );
}

/** Where this machine was looking in that folder; `null` if none or unreadable. */
export async function projectView(directory: string): Promise<ProjectView | null> {
  const held = await window.electronApi.invoke(PROJECT_VIEW_CHANNEL, {
    directory,
  });

  if (held === null) {
    return null;
  }

  try {
    const read: unknown = JSON.parse(held);

    if (!isView(read)) {
      return null;
    }

    // A note written before the field could be pulled has no height.
    return {
      ...read,
      fieldHeight: typeof read.fieldHeight === "number" ? read.fieldHeight : null,
    };
  } catch {
    return null;
  }
}

/** Notes where this machine is looking now. */
export async function rememberProjectView(directory: string, view: ProjectView): Promise<void> {
  await window.electronApi.invoke(REMEMBER_PROJECT_VIEW_CHANNEL, {
    directory,
    view: JSON.stringify(view),
  });
}
