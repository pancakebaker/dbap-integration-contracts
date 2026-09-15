import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const manifest = JSON.parse(
  await readFile(new URL("../contracts-release.json", import.meta.url), "utf8"),
);
const tag =
  process.env.GITHUB_REF_TYPE === "tag" ? process.env.GITHUB_REF_NAME : null;

if (manifest.version !== "1.0.0")
  throw new Error("The initial release manifest must declare version 1.0.0.");
if (!/^[0-9a-f]{40}$/.test(manifest.commit))
  throw new Error("Release manifest commit must be a full SHA.");
execFileSync("git", ["cat-file", "-e", `${manifest.commit}^{commit}`], {
  cwd: root,
  stdio: "inherit",
});
if (tag && tag !== `v${manifest.version}`)
  throw new Error(`Tag ${tag} does not match v${manifest.version}.`);
const releaseNotes = await readFile(
  new URL("../docs/releases/v1.0.0.md", import.meta.url),
  "utf8",
);
const changelog = await readFile(
  new URL("../CHANGELOG.md", import.meta.url),
  "utf8",
);
if (!releaseNotes.includes("v1.0.0") || !changelog.includes("## [1.0.0]")) {
  throw new Error("v1.0.0 release notes or changelog entry is missing.");
}
console.log(`Release metadata validated for v${manifest.version}.`);
