const { test } = require("node:test");
const assert = require("node:assert/strict");
const { retryAfterMilliseconds, retryAfterRemaining, readLeadData, retryLeadRead } = require("./leadReadRetry.ts");
const { effectiveLeadLimit, nextLeadPage } = require("./leadPagination.ts");

test("Retry-After supports seconds, HTTP dates and invalid/missing headers", () => {
  const now = Date.UTC(2026, 10, 19, 10);
  assert.equal(retryAfterMilliseconds("12", now), 12000);
  assert.equal(retryAfterMilliseconds(new Date(now + 60000).toUTCString(), now), 60000);
  assert.equal(retryAfterMilliseconds(new Date(now - 60000).toUTCString(), now), 0);
  assert.equal(retryAfterMilliseconds(undefined, now), 5000);
  assert.equal(retryAfterMilliseconds("invalid", now), 5000);
  assert.equal(retryAfterMilliseconds("0", now), 0);
});

test("503 blocks early reads, preserves the response, and supports cancellation", async () => {
  const error = { response: { status: 503, headers: { "retry-after": "0.08" } } };
  await assert.rejects(readLeadData("leads", async () => { throw error; }), e => e === error);
  assert.ok(retryAfterRemaining(error) > 0);
  let reads = 0;
  const controller = new AbortController();
  const canceled = readLeadData("leads", async () => { reads++; }, controller.signal);
  controller.abort();
  await assert.rejects(canceled, { name: "AbortError" });
  assert.equal(reads, 0);
  const pending = readLeadData("leads", async () => { reads++; return "ok"; });
  assert.equal(reads, 0);
  assert.equal(await pending, "ok");
  assert.equal(reads, 1);
  assert.equal(retryAfterRemaining(error), 0);
});

test("an aborted read does not call the API even without a cooldown", async () => {
  const controller = new AbortController(); controller.abort();
  let called = false;
  await assert.rejects(readLeadData("folders", async () => { called = true; }, controller.signal), { name: "AbortError" });
  assert.equal(called, false);
});

test("query retries do not hammer 503 or authorization failures", () => {
  for (const status of [401, 403, 404, 503]) assert.equal(retryLeadRead(0, { response: { status } }), false);
  assert.equal(retryLeadRead(0, { response: { status: 500 } }), true);
  assert.equal(retryLeadRead(2, { response: { status: 500 } }), false);
  assert.equal(retryLeadRead(0, { name: "CanceledError", code: "ERR_CANCELED" }), false);
  assert.equal(retryLeadRead(0, { name: "AbortError" }), false);
});

test("pagination uses server metadata including capped effective limits", () => {
  assert.equal(effectiveLeadLimit({ pagination: { limit: 100 } }), 100);
  assert.equal(effectiveLeadLimit({ pagination: { pageSize: 20 } }), 20);
  assert.equal(nextLeadPage({ pagination: { currentPage: "1", hasNext: true } }), 2);
  assert.equal(nextLeadPage({ pagination: { page: 2, hasNextPage: false } }), undefined);
  assert.equal(nextLeadPage({ pagination: { currentPage: 1, limit: 100, totalItem: 101 } }), 2);
  assert.equal(nextLeadPage({ pagination: { currentPage: 2, limit: 100, totalItem: 101 } }), undefined);
  assert.equal(nextLeadPage({ pagination: { currentPage: "bad", hasNext: true } }), undefined);
  assert.equal(nextLeadPage({}), undefined);
});
