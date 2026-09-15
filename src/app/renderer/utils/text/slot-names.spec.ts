import { describe, expect, it } from "vitest";
import { slotNames } from "./slot-names";

describe("slotNames", () => {
  it("reads every name the braces stand for, in the order they appear", () => {
    expect(slotNames("npm test -- {pattern} --reporter={format}")).toEqual(["pattern", "format"]);
  });

  it("names a repeated slot once: the line mentions it, and mentioning it twice says no more", () => {
    expect(slotNames("cp {file} {file}.bak")).toEqual(["file"]);
  });

  it("leaves out empty braces, which stand for nothing at all", () => {
    expect(slotNames("echo {} {  } {name}")).toEqual(["name"]);
  });

  it("reads a name out of every brace: whether it is a slot is decided against the declared list", () => {
    expect(slotNames("echo 'a b c d e' | awk '{print $5}'")).toEqual(["print $5"]);
    expect(slotNames("for i in {1..5}; do echo $i; done")).toEqual(["1..5"]);
  });

  it("reads a name in either alphabet, and one with digits and «_» in it", () => {
    expect(slotNames("cat {шлях} {file_2}")).toEqual(["шлях", "file_2"]);
  });
});
