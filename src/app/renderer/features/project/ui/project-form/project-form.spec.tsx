import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProjectForm } from "./project-form";
import { PROJECT_FORM_APPEARING, PROJECT_FORM_CREATE_LABEL, PROJECT_FORM_WILL_APPEAR_LABEL } from "./constants";

function renderForm(overrides: Partial<Parameters<typeof ProjectForm>[0]> = {}) {
  return render(
    <ProjectForm
      directory="~/work/nightly-checks"
      name="nightly-checks"
      onNameChange={() => {}}
      onChooseDirectory={() => {}}
      onSubmit={() => {}}
      onCancel={() => {}}
      {...overrides}
    />,
  );
}

describe("ProjectForm", () => {
  it("says what will appear in the folder, and offers to create it", () => {
    // The form opens only on a folder with no project; the other case opens without asking.
    renderForm();

    expect(screen.getByText(PROJECT_FORM_WILL_APPEAR_LABEL)).toBeInTheDocument();
    expect(screen.getByText(PROJECT_FORM_CREATE_LABEL)).toBeInTheDocument();
  });

  it("names everything a project is on the disk, not two of them", () => {
    renderForm();

    for (const { name } of PROJECT_FORM_APPEARING) {
      expect(screen.getByText(name)).toBeInTheDocument();
    }
  });

  it("does not create a project with an empty name", () => {
    // The dimmed act keeps focus and ignores presses instead of hiding from the keyboard.
    renderForm({
      name: "   ",
    });

    expect(screen.getByText(PROJECT_FORM_CREATE_LABEL).closest("button")).toHaveAttribute("aria-disabled", "true");
  });
});
