// The code-signing identity a machine of its own may hold in its keychain, named «Coder Local Signing». Signed by it,
// Coder and Coder Hearing stay the same app to macOS from one build to the next, so the keychain and the speech
// permission are not asked again; a machine without it signs ad hoc, as `-`.
const { execFileSync } = require("node:child_process");

const LOCAL_IDENTITY = "Coder Local Signing";
const AD_HOC_IDENTITY = "-";

function signingIdentity() {
  if (process.platform !== "darwin") {
    return AD_HOC_IDENTITY;
  }

  const found = execFileSync("security", ["find-identity", "-v", "-p", "codesigning"], {
    encoding: "utf8",
  });

  return found.includes(`"${LOCAL_IDENTITY}"`) ? LOCAL_IDENTITY : AD_HOC_IDENTITY;
}

module.exports = {
  signingIdentity,
};
