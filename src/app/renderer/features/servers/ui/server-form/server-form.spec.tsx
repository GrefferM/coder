import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ServerForm } from "./server-form";
import { EMPTY_SERVER_FORM_VALUES, NOTHING_HELD } from "../../constants";
import type { McpSecretsHeld } from "../../../../interfaces";
import type { ServerFormValues } from "../../interfaces";

function form(patch: Partial<ServerFormValues> = {}, takenNames: string[] = [], held: McpSecretsHeld = NOTHING_HELD) {
  const onChange = vi.fn();
  const onSecretChange = vi.fn();
  const onSave = vi.fn(() => Promise.resolve());

  render(
    <ServerForm
      values={{
        ...EMPTY_SERVER_FORM_VALUES,
        ...patch,
      }}
      isNew
      takenNames={takenNames}
      held={held}
      secrets={{}}
      onChange={onChange}
      onSecretChange={onSecretChange}
      onSave={onSave}
      onCancel={() => {}}
    />,
  );

  return {
    onChange,
    onSecretChange,
    onSave,
  };
}

describe("ServerForm", () => {
  it("asks a local server for its line and a remote one for its address, and never for both", () => {
    // The switch in the head says which kind this is; the form asks only that kind's questions.
    form();

    expect(screen.getByLabelText("РЯДОК ЗАПУСКУ")).toBeInTheDocument();
    expect(screen.queryByLabelText("АДРЕСА")).not.toBeInTheDocument();
  });

  it("hands the switch back as the kind it stands for", async () => {
    const { onChange } = form();

    await userEvent.click(
      screen.getByRole("button", {
        name: "ВІДДАЛЕНИЙ",
      }),
    );

    expect(onChange).toHaveBeenCalledWith({
      isLocal: false,
    });
  });

  it("shows a remote server its address and the ways in that are built, which the browser is not", () => {
    form({
      isLocal: false,
      signIn: "token",
    });

    expect(screen.getByLabelText("АДРЕСА")).toBeInTheDocument();
    // A row of choices is one field, and the one already chosen says so.
    expect(
      screen.getByRole("button", {
        name: "ТОКЕН",
      }),
    ).toHaveAttribute("aria-pressed", "true");
    // A choice that refuses at the first press is worse than no choice; the file still names it, the form does not.
    expect(
      screen.queryByRole("button", {
        name: "ЧЕРЕЗ БРАУЗЕР",
      }),
    ).not.toBeInTheDocument();
  });

  it("marks what is missing rather than writing it", async () => {
    // Pressing with something empty marks the field; nothing is refused in words nobody asked for.
    const { onSave } = form();

    await userEvent.click(
      screen.getByRole("button", {
        name: "Підключити",
      }),
    );

    expect(onSave).not.toHaveBeenCalled();
  });

  it("writes once the name and the half in hand are both there", async () => {
    const { onSave } = form({
      name: "brave",
      run: "npx -y @modelcontextprotocol/server-brave-search",
    });

    await userEvent.click(
      screen.getByRole("button", {
        name: "Підключити",
      }),
    );

    expect(onSave).toHaveBeenCalled();
  });

  it("keeps a name it cannot take, rather than eating the character behind the person", async () => {
    // «набране лишається набраним» — nothing is taken out of the name behind the person.
    const { onChange } = form({
      name: "brave",
      run: "npx server",
    });

    await userEvent.type(screen.getByLabelText("ІМ'Я"), ".");

    expect(onChange).toHaveBeenCalledWith({
      name: "brave.",
    });
  });

  it("takes a dash in a server's name, because that name never reaches a model", async () => {
    // The rule on a server's name is ours, not a provider's, and `playwright-mcp` is a name.
    const { onSave } = form({
      name: "playwright-mcp",
      run: "npx -y @playwright/mcp@latest",
    });

    await userEvent.click(
      screen.getByRole("button", {
        name: "Підключити",
      }),
    );

    expect(onSave).toHaveBeenCalled();
  });

  it("leaves a name it once wrote into the file alone, and does not hold the run line hostage to it", async () => {
    // A name this app accepted is the file's truth: a form that opens shouting at it, and then refuses to mend
    // the run line until the server is renamed, is the app arguing with itself.
    const { onSave } = form({
      name: "pulls.create",
      run: "npx -y @playwright/mcp@latest",
    });

    expect(
      screen.queryByText("Латиниця, цифри, «_» і «-». Цим іменем сервер стоїть у файлі проєкту й у переліку функцій."),
    ).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", {
        name: "Підключити",
      }),
    );

    expect(onSave).toHaveBeenCalled();
  });

  it("asks a remote server that wants no way in for no token at all", () => {
    // A public server is the plain case: an address and nothing else, so the token field has no business showing.
    form({
      isLocal: false,
    });

    expect(screen.getByLabelText("АДРЕСА")).toBeInTheDocument();
    expect(screen.queryByLabelText("ТОКЕН")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: "БЕЗ ВХОДУ",
      }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("takes a token for a remote server, handing it back under the empty name", async () => {
    // The field is the form's, not its own: what is typed comes straight back out, a keystroke at a time.
    const { onSecretChange } = form({
      isLocal: false,
      signIn: "token",
    });

    await userEvent.type(screen.getByLabelText("ТОКЕН"), "s");

    expect(onSecretChange).toHaveBeenCalledWith("", "s");
  });

  it("shows a token already on this machine by its hint, and says what takes it off", () => {
    // Exactly as a provider's key shows itself — the same head, bullets and tail, the same sentence.
    form(
      {
        isLocal: false,
        signIn: "token",
      },
      [],
      {
        token: "sk-or-v…c0d",
        env: {},
      },
    );

    expect(screen.getByPlaceholderText("sk-or-v…c0d")).toBeInTheDocument();
    expect(screen.getByText("Ключ лежить у сховищі цієї машини. Хрестик прибирає його звідси.")).toBeInTheDocument();
  });

  it("takes the key off only when the cross is pressed, and says so by going plainly empty", async () => {
    // Leaving a field alone must not cost a key: nothing on the screen says it would, and nobody guesses it.
    const { onSecretChange } = form(
      {
        isLocal: false,
        signIn: "token",
      },
      [],
      {
        token: "sk-or-v…c0d",
        env: {},
      },
    );

    await userEvent.click(
      screen.getByRole("button", {
        name: "Очистити",
      }),
    );

    expect(onSecretChange).toHaveBeenCalledWith("", "");
  });

  it("keeps a local server's variables as names here and values on this machine", async () => {
    // The name rides in the file and the value never does, so the two fields go to two different places.
    const { onChange, onSecretChange } = form({
      env: ["BRAVE_API_KEY"],
    });

    await userEvent.type(screen.getByLabelText("значення"), "x");

    expect(onSecretChange).toHaveBeenLastCalledWith("BRAVE_API_KEY", "x");

    await userEvent.click(
      screen.getByRole("button", {
        name: "ЗМІННА",
      }),
    );

    expect(onChange).toHaveBeenCalledWith({
      env: ["BRAVE_API_KEY", ""],
    });
  });

  it("counts the variables in the slot's own head, as every list's head does", () => {
    form({
      env: ["BRAVE_API_KEY", "BRAVE_LOCALE"],
    });

    expect(screen.getByText("ЗМІННІ СЕРЕДОВИЩА · 2")).toBeInTheDocument();
  });

  it("marks a named variable with nothing behind it, without repeating what the catalogue will say", () => {
    // Not a refusal by the form — «Підключити» is still given. The warned edge says the trouble, and
    // the catalogue's row says «НЕ ЗАПУСТИТЬСЯ · НЕМА ЗНАЧЕННЯ: …» where the server actually fails to start.
    form({
      env: ["BRAVE_API_KEY"],
    });

    expect(screen.getByPlaceholderText("нема значення")).toBeInTheDocument();
  });

  it("takes a variable back off the list", async () => {
    // A variable added by mistake has to be removable, and «ПРИБРАТИ» stands inside the narrow tab's own width:
    // a way out that has to be scrolled sideways to is a way out nobody finds.
    const { onChange } = form({
      env: ["BRAVE_API_KEY", "SECOND_KEY"],
    });

    await userEvent.click(
      screen.getAllByRole("button", {
        name: "ПРИБРАТИ",
      })[0]!,
    );

    expect(onChange).toHaveBeenCalledWith({
      env: ["SECOND_KEY"],
    });
  });

  it("offers variables to a local server and a token to a remote one, and never both", () => {
    form({
      env: ["BRAVE_API_KEY"],
    });

    // Each half of a variable wears its own name: the example belongs in the empty field, not over it.
    expect(screen.getByLabelText("назва")).toHaveValue("BRAVE_API_KEY");
    expect(screen.getByLabelText("значення")).toBeInTheDocument();
    expect(screen.queryByLabelText("ТОКЕН")).not.toBeInTheDocument();

    // The whole of what a variable is — a pair that travels to two different places, said on the spot.
    expect(screen.getByText("у файл проєкту")).toBeInTheDocument();
    expect(screen.getByText("лишається тут")).toBeInTheDocument();
  });

  it("refuses a name another server already wears", async () => {
    const { onSave } = form(
      {
        name: "brave",
        run: "npx -y @modelcontextprotocol/server-brave-search",
      },
      ["brave"],
    );

    await userEvent.click(
      screen.getByRole("button", {
        name: "Підключити",
      }),
    );

    expect(onSave).not.toHaveBeenCalled();
  });
});
