import { useState } from "react";
import { CONFIRM_LAYER } from "../../../../../../constants";
import { ProjectForm } from "../../../project-form";
import { SWITCHER_SCRIM_COLOR } from "../../constants";
import { useWindowKeydown } from "../../../../../../hooks";
import type { NamingOverlayProps } from "./interfaces";

/**
 * The naming form, over the project that is open. A form that first closed it would make «Скасувати» a way out of
 * somewhere nobody asked to leave, so the project underneath changes only once there is a new one to change to.
 */
export function NamingOverlay({ directory, suggested, onCreate, onChooseDirectory, onCancel }: NamingOverlayProps) {
  const [name, setName] = useState(suggested);

  // Escape leaves what is over the page, exactly as it leaves a side tab.
  useWindowKeydown(true, (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      onCancel();
    }
  });

  return (
    <div
      className="d-flex align-items-center justify-content-center"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: CONFIRM_LAYER,
        background: SWITCHER_SCRIM_COLOR,
      }}
    >
      <ProjectForm
        directory={directory}
        name={name}
        onNameChange={setName}
        onChooseDirectory={onChooseDirectory}
        onSubmit={() => onCreate(name)}
        onCancel={onCancel}
      />
    </div>
  );
}
