import { FieldSlot, Words } from "../../../../../../components";
import { SERVER_FORM_CHOICE_GAP_PX } from "../../constants";
import type { ChoiceRowProps } from "./interfaces";
import { One } from "./components";

/**
 * A choice made inside the form and not in a question standing before it: a question asked first cannot be
 * changed once answered. One slot, so the keyboard stops here once, on the choice already made.
 */
export function ChoiceRow({ label, choices, chosen, note, onChoose }: ChoiceRowProps) {
  return (
    <FieldSlot label={label}>
      {/* One value made of several presses — Tab stops here once, and the arrows walk it. */}
      <div
        data-choice
        className="d-flex"
        style={{
          gap: SERVER_FORM_CHOICE_GAP_PX,
        }}
      >
        {choices.map((choice) => (
          <One
            key={choice.value}
            isChosen={choice.value === chosen}
            label={choice.label}
            onChoose={() => onChoose(choice.value)}
          />
        ))}
      </div>
      {note !== undefined && <Words isQuiet>{note}</Words>}
    </FieldSlot>
  );
}
