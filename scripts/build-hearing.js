// Builds Coder Hearing, macOS's speech recognition for the app, into build/CoderHearing.app and signs it with this
// machine's own identity where it holds one, ad hoc otherwise.
// `dev:app` and `build:mac` call it; off macOS it does nothing.
const path = require("node:path");
const fs = require("node:fs");
const { execFileSync } = require("node:child_process");
const { signingIdentity } = require("./signing-identity");

const ROOT = path.join(__dirname, "..");
const SOURCE = path.join(ROOT, "src", "app", "mac-hearing");
const BUNDLE = path.join(ROOT, "build", "CoderHearing.app");
const CONTENTS = path.join(BUNDLE, "Contents");
const EXECUTABLE = path.join(CONTENTS, "MacOS", "CoderHearing");

function buildHearing() {
  if (process.platform !== "darwin") {
    return;
  }

  fs.rmSync(BUNDLE, {
    recursive: true,
    force: true,
  });
  fs.mkdirSync(path.dirname(EXECUTABLE), {
    recursive: true,
  });
  fs.copyFileSync(path.join(SOURCE, "Info.plist"), path.join(CONTENTS, "Info.plist"));

  execFileSync("swiftc", ["-O", path.join(SOURCE, "main.swift"), "-o", EXECUTABLE], {
    stdio: "inherit",
  });
  execFileSync("codesign", ["--sign", signingIdentity(), "--force", BUNDLE], {
    stdio: "inherit",
  });
}

module.exports = {
  buildHearing,
};

if (require.main === module) {
  buildHearing();
}
