import assert from "node:assert/strict";
import test from "node:test";
import {
  compareAsyncApi,
  compareOpenApi,
  compareSchema,
} from "../scripts/compatibility.mjs";

void test("detects a removed schema property", () => {
  const issues = compareSchema(
    { properties: { id: { type: "string" } } },
    { properties: {} },
  );
  assert.ok(issues.some((issue) => issue.code === "removed-property"));
});

void test("detects a newly required schema property", () => {
  const issues = compareSchema(
    {
      properties: { id: { type: "string" }, label: { type: "string" } },
      required: ["id"],
    },
    {
      properties: { id: { type: "string" }, label: { type: "string" } },
      required: ["id", "label"],
    },
  );
  assert.ok(issues.some((issue) => issue.code === "required-added"));
});

void test("detects an endpoint deletion", () => {
  const issues = compareOpenApi(
    { paths: { "/auctions": { get: { responses: { 200: {} } } } } },
    { paths: {} },
  );
  assert.ok(issues.some((issue) => issue.code === "endpoint-deleted"));
});

void test("detects a routing channel deletion", () => {
  const issues = compareAsyncApi(
    { channels: { "auction.bid.accepted": {} } },
    { channels: {} },
  );
  assert.ok(issues.some((issue) => issue.code === "channel-deleted"));
});

void test("permits an additive optional property", () => {
  const issues = compareSchema(
    { properties: { id: { type: "string" } }, required: ["id"] },
    {
      properties: { id: { type: "string" }, label: { type: "string" } },
      required: ["id"],
    },
  );
  assert.equal(issues.filter((issue) => issue.kind === "breaking").length, 0);
});
