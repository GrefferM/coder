import { ContextMenu } from "../../../../../components";
import { AddAgentIcon, AddLinkIcon, CopyAgentIcon, DeleteAgentIcon, PasteAgentIcon } from "../menu-icons";
import {
  CANVAS_ADD_AGENT_LABEL,
  CANVAS_ADD_LINK_LABEL,
  CANVAS_COPY_AGENT_LABEL,
  CANVAS_COPY_AGENT_SHORTCUT,
  CANVAS_DELETE_AGENT_LABEL,
  CANVAS_DELETE_AGENT_SHORTCUT,
  CANVAS_PASTE_AGENT_LABEL,
  CANVAS_PASTE_AGENT_SHORTCUT,
} from "../../../constants";
import type { CanvasMenuProps } from "./interfaces";

/** The right-click menu: the canvas's where it fell on nothing, the sphere's where it fell on one. */
export function CanvasMenu({
  at,
  contentAt,
  agentId,
  isPasteOffered,
  onAddAgent,
  onPasteAgent,
  onDrawLink,
  onCopyAgent,
  onDeleteAgent,
  onDismiss,
}: CanvasMenuProps) {
  /** Canvas context-menu items at the opened point. */
  function canvasItems() {
    return [
      {
        label: CANVAS_ADD_AGENT_LABEL,
        icon: <AddAgentIcon />,
        onSelect: () => {
          onAddAgent(contentAt);
          onDismiss();
        },
      },
      {
        label: CANVAS_PASTE_AGENT_LABEL,
        icon: <PasteAgentIcon isDisabled={!isPasteOffered} />,
        shortcut: CANVAS_PASTE_AGENT_SHORTCUT,
        isDisabled: !isPasteOffered,
        hasSeparatorAbove: true,
        onSelect: () => {
          onPasteAgent(contentAt);
          onDismiss();
        },
      },
    ];
  }

  /** Sphere context-menu items. */
  function sphereItems(held: string) {
    return [
      {
        label: CANVAS_ADD_LINK_LABEL,
        icon: <AddLinkIcon />,
        onSelect: () => {
          onDrawLink(held, contentAt);
          onDismiss();
        },
      },
      {
        label: CANVAS_COPY_AGENT_LABEL,
        icon: <CopyAgentIcon />,
        shortcut: CANVAS_COPY_AGENT_SHORTCUT,
        onSelect: () => {
          onCopyAgent(held);
          onDismiss();
        },
      },
      {
        label: CANVAS_DELETE_AGENT_LABEL,
        icon: <DeleteAgentIcon />,
        shortcut: CANVAS_DELETE_AGENT_SHORTCUT,
        isDanger: true,
        hasSeparatorAbove: true,
        onSelect: () => {
          onDeleteAgent(held);
          onDismiss();
        },
      },
    ];
  }

  return <ContextMenu at={at} onDismiss={onDismiss} items={agentId === null ? canvasItems() : sphereItems(agentId)} />;
}
