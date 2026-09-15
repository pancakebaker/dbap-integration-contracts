import fs from "node:fs/promises";
import path from "node:path";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import SwaggerParser from "@apidevtools/swagger-parser";
import { Parser } from "@asyncapi/parser";

const root = process.cwd();
const schemaDir = path.join(root, "schemas", "events", "v1");
const fixtureDir = path.join(root, "contracts", "fixtures", "v1");
const schemasOnly = process.argv.includes("--schemas-only");

const ajv = new Ajv2020({ allErrors: true, strict: true });
addFormats(ajv);

const schemaFiles = (await fs.readdir(schemaDir)).filter((file) =>
  file.endsWith(".json"),
);
for (const file of schemaFiles) {
  const schema = JSON.parse(
    await fs.readFile(path.join(schemaDir, file), "utf8"),
  );
  ajv.addSchema(schema);
}

if (!schemasOnly) {
  const fixtureFiles = (await fs.readdir(fixtureDir)).filter((file) =>
    file.endsWith(".json"),
  );
  for (const file of fixtureFiles) {
    const fixture = JSON.parse(
      await fs.readFile(path.join(fixtureDir, file), "utf8"),
    );
    const schemaName = file
      .replace("auction-bid-accepted", "bid-accepted")
      .replace(".json", "");
    const validate = ajv.getSchema(`urn:dbap:event:${schemaName}:v1`);
    if (!validate || !validate(fixture)) {
      throw new Error(
        `${file} does not validate: ${ajv.errorsText(validate?.errors)}`,
      );
    }
  }
}

await SwaggerParser.validate(path.join(root, "openapi", "bidding-api.v1.yaml"));
const asyncApiText = await fs.readFile(
  path.join(root, "asyncapi", "auction-events.v1.yaml"),
  "utf8",
);
const asyncApi = new Parser();
await asyncApi.parse(asyncApiText);

console.log("Contract schemas, fixtures, OpenAPI, and AsyncAPI validated.");
