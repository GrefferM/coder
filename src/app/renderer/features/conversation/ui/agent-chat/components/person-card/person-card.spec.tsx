import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PersonCard } from "./person-card";
import { PERSON_COLOR, PERSON_NAME } from "../../../../../../constants";
import { AGENT_CHAT_ATTACHED_LABEL, AGENT_CHAT_CARD_BORDER_COLOR } from "../../constants";
import { DEBUG_BAND_LABEL } from "../../../../../projection/ui/debug-band/constants";

const at = new Date("2026-08-30T10:21:00");

describe("PersonCard", () => {
  it("signs the person the way an agent is signed, in the colour of the text itself", () => {
    render(<PersonCard text="Полагодь тест, який упав" at={at} attached={[]} onDebug={null} />);

    // The person is no sphere in the graph and takes no colour from the palette.
    expect(screen.getByText(PERSON_NAME)).toHaveStyle({
      color: PERSON_COLOR,
    });
    expect(screen.getByText("Полагодь тест, який упав")).toBeInTheDocument();
  });

  it("stands the sign over the card, the way an answer's sign stands over its own", () => {
    render(<PersonCard text="Полагодь тест" at={at} attached={[]} onDebug={null} />);

    // The card is the words alone; whose they are and when is said above it, outside the border.
    expect(screen.getByText(PERSON_NAME).parentElement).not.toHaveStyle({
      border: `1px solid ${AGENT_CHAT_CARD_BORDER_COLOR}`,
    });
    expect(screen.getByText("Полагодь тест").parentElement).toHaveStyle({
      border: `1px solid ${AGENT_CHAT_CARD_BORDER_COLOR}`,
    });
  });

  it("says the hour and no step, since a person's reply is not a step of the walk", () => {
    render(<PersonCard text="Полагодь тест" at={at} attached={[]} onDebug={null} />);

    expect(screen.getByText("10:21")).toBeInTheDocument();
    expect(screen.queryByText(/КРОК/)).not.toBeInTheDocument();
  });

  it("carries the way into the projection of the pass this question started", () => {
    const onDebug = vi.fn();

    render(<PersonCard text="Полагодь тест" at={at} attached={[]} onDebug={onDebug} />);
    screen.getByText(DEBUG_BAND_LABEL).click();

    expect(onDebug).toHaveBeenCalled();
  });

  it("stands that way in under the text of the question, inside the card", () => {
    // The band belongs to the question, so it stands with its words and not with the sign.
    render(<PersonCard text="Полагодь тест" at={at} attached={[]} onDebug={vi.fn()} />);

    const card = screen.getByText("Полагодь тест").parentElement;

    expect(card).toContainElement(screen.getByText(DEBUG_BAND_LABEL));
    expect(screen.getByText(PERSON_NAME).parentElement).not.toContainElement(screen.getByText(DEBUG_BAND_LABEL));
  });

  it("carries no way in where the question started no walk", () => {
    // The question stands, but nothing went out of it, so there is no pass to look into.
    render(<PersonCard text="Полагодь тест" at={at} attached={[]} onDebug={null} />);

    expect(screen.queryByText(DEBUG_BAND_LABEL)).not.toBeInTheDocument();
  });

  it("keeps the lines of a question as they were typed", () => {
    render(<PersonCard text={"Перший рядок\nДругий рядок"} at={at} attached={[]} onDebug={null} />);

    expect(screen.getByText(/Перший рядок/)).toHaveStyle({
      whiteSpace: "pre-wrap",
    });
  });

  it("keeps a «ПРИКРІПЛЕНО:» record under the question, naming each file and folder without a ×", () => {
    render(
      <PersonCard
        text="Полагодь тест"
        at={at}
        attached={[
          {
            name: "auth",
            kind: "folder",
          },
          {
            name: "logout.log",
            kind: "file",
          },
        ]}
        onDebug={null}
      />,
    );

    expect(screen.getByText(AGENT_CHAT_ATTACHED_LABEL)).toBeInTheDocument();
    // A folder wears a trailing slash so the eye sees at once where a tree rode in.
    expect(screen.getByText("auth/")).toBeInTheDocument();
    expect(screen.getByText("logout.log")).toBeInTheDocument();
  });

  it("says nothing of attachments where a question had none", () => {
    render(<PersonCard text="Полагодь тест" at={at} attached={[]} onDebug={null} />);

    expect(screen.queryByText(AGENT_CHAT_ATTACHED_LABEL)).not.toBeInTheDocument();
  });
});
