import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import { resolve } from "node:path";
import YAML from "yaml";

const root = fileURLToPath(new URL("..", import.meta.url));
const baseline = process.env.CONTRACT_BASELINE_COMMIT || resolveBaseline();

function sameType(before, after) {
  const normalize = (value) =>
    Array.isArray(value) ? [...value].sort() : value;
  return JSON.stringify(normalize(before)) === JSON.stringify(normalize(after));
}

export function compareSchema(before, after, path = "$", issues = []) {
  if (before?.type && after?.type && !sameType(before.type, after.type)) {
    issues.push({ kind: "breaking", code: "type-changed", path });
  }
  const beforeProperties = before?.properties || {};
  const afterProperties = after?.properties || {};
  for (const name of Object.keys(beforeProperties)) {
    if (!(name in afterProperties)) {
      issues.push({
        kind: "breaking",
        code: "removed-property",
        path: `${path}.${name}`,
      });
    } else {
      compareSchema(
        beforeProperties[name],
        afterProperties[name],
        `${path}.${name}`,
        issues,
      );
    }
  }
  const beforeRequired = new Set(before?.required || []);
  const afterRequired = new Set(after?.required || []);
  for (const name of afterRequired) {
    if (!beforeRequired.has(name)) {
      issues.push({
        kind: "breaking",
        code: "required-added",
        path: `${path}.${name}`,
      });
    }
  }
  if (Array.isArray(before?.enum) && Array.isArray(after?.enum)) {
    for (const value of before.enum) {
      if (!after.enum.includes(value)) {
        issues.push({ kind: "breaking", code: "enum-narrowed", path });
      }
    }
    for (const value of after.enum) {
      if (!before.enum.includes(value)) {
        issues.push({ kind: "review", code: "enum-expanded", path });
      }
    }
  }
  return issues;
}

export function compareSchemas(beforeFiles, afterFiles) {
  const issues = [];
  for (const name of Object.keys(beforeFiles)) {
    if (!(name in afterFiles)) {
      issues.push({ kind: "breaking", code: "schema-deleted", path: name });
    } else {
      compareSchema(beforeFiles[name], afterFiles[name], name, issues);
    }
  }
  return issues;
}

export function compareOpenApi(before, after) {
  const issues = [];
  const beforePaths = before.paths || {};
  const afterPaths = after.paths || {};
  for (const path of Object.keys(beforePaths)) {
    if (!(path in afterPaths)) {
      issues.push({ kind: "breaking", code: "endpoint-deleted", path });
      continue;
    }
    for (const method of Object.keys(beforePaths[path])) {
      if (method === "parameters") continue;
      if (!(method in afterPaths[path])) {
        issues.push({
          kind: "breaking",
          code: "method-deleted",
          path: `${method} ${path}`,
        });
        continue;
      }
      const beforeResponses = beforePaths[path][method].responses || {};
      const afterResponses = afterPaths[path][method].responses || {};
      for (const status of Object.keys(beforeResponses)) {
        if (!(status in afterResponses)) {
          issues.push({
            kind: "breaking",
            code: "response-deleted",
            path: `${method} ${path} ${status}`,
          });
        }
      }
    }
  }
  compareSchema(
    before.components?.schemas?.PlaceBidRequest,
    after.components?.schemas?.PlaceBidRequest,
    "components.schemas.PlaceBidRequest",
    issues,
  );
  return issues;
}

export function compareAsyncApi(before, after) {
  const issues = [];
  const beforeChannels = before.channels || {};
  const afterChannels = after.channels || {};
  for (const channel of Object.keys(beforeChannels)) {
    if (!(channel in afterChannels)) {
      issues.push({ kind: "breaking", code: "channel-deleted", path: channel });
    }
  }
  return issues;
}

async function loadJsonFiles(commit, directory) {
  const output = execFileSync("git", ["show", `${commit}:${directory}`], {
    cwd: root,
    encoding: "utf8",
  });
  return JSON.parse(output);
}

async function loadCurrentSchemas() {
  const names = [
    "event-envelope",
    "bid-accepted",
    "auction-purchased",
    "auction-closed",
    "winner-selected",
    "auction-cancelled",
    "tenant-status-changed",
  ];
  return Object.fromEntries(
    await Promise.all(
      names.map(async (name) => [
        name,
        JSON.parse(
          await readFile(
            new URL(
              `../schemas/events/v1/${name}.schema.json`,
              import.meta.url,
            ),
            "utf8",
          ),
        ),
      ]),
    ),
  );
}

function resolveBaseline() {
  const tags = execFileSync(
    "git",
    ["tag", "--list", "v*", "--sort=-version:refname"],
    { cwd: root, encoding: "utf8" },
  )
    .trim()
    .split(/\r?\n/)
    .filter(Boolean);
  return tags[0]
    ? execFileSync("git", ["rev-list", "-n", "1", tags[0]], {
        cwd: root,
        encoding: "utf8",
      }).trim()
    : "6c89fb85d96110b881ff789470e3d7acfd5331e1";
}

async function main() {
  const currentSchemas = await loadCurrentSchemas();
  const baselineSchemas = {};
  for (const name of Object.keys(currentSchemas)) {
    try {
      baselineSchemas[name] = await loadJsonFiles(
        baseline,
        `schemas/events/v1/${name}.schema.json`,
      );
    } catch {
      continue;
    }
  }
  const baselineOpenApi = YAML.parse(
    execFileSync("git", ["show", `${baseline}:openapi/bidding-api.v1.yaml`], {
      cwd: root,
      encoding: "utf8",
    }),
  );
  const baselineAsyncApi = YAML.parse(
    execFileSync(
      "git",
      ["show", `${baseline}:asyncapi/auction-events.v1.yaml`],
      { cwd: root, encoding: "utf8" },
    ),
  );
  const currentOpenApi = YAML.parse(
    await readFile(
      new URL("../openapi/bidding-api.v1.yaml", import.meta.url),
      "utf8",
    ),
  );
  const currentAsyncApi = YAML.parse(
    await readFile(
      new URL("../asyncapi/auction-events.v1.yaml", import.meta.url),
      "utf8",
    ),
  );
  const issues = [
    ...compareSchemas(baselineSchemas, currentSchemas),
    ...compareOpenApi(baselineOpenApi, currentOpenApi),
    ...compareAsyncApi(baselineAsyncApi, currentAsyncApi),
  ];
  const breaking = issues.filter((issue) => issue.kind === "breaking");
  for (const issue of issues)
    console.log(`${issue.kind}: ${issue.code} at ${issue.path}`);
  if (breaking.length) process.exitCode = 1;
  else console.log(`Compatibility check passed against ${baseline}.`);
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
)
  await main();
