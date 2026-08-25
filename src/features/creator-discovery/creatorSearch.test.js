import assert from "node:assert/strict";
import test from "node:test";
import {
  fallbackSearchCreators,
  parseCampaignQuery,
  toSearchPayload,
  validateSearchFilters,
} from "./creatorSearch.js";

test("quick search produces the documented slug-based contract", () => {
  const parsed = parseCampaignQuery("Punjabi beauty creators with 50K-100K audience under ₹40K");
  assert.deepEqual(parsed, {
    state: "punjab",
    languages: ["punjabi"],
    niche: "beauty",
    budget_per_deliverable: 40000,
    audience_min: 50000,
    audience_max: 100000,
  });
  assert.equal(validateSearchFilters(parsed), "");
});

test("required and follower-range validation fails before the RPC", () => {
  assert.match(validateSearchFilters({}), /state, niche, and maximum rate/i);
  assert.match(validateSearchFilters({
    state: "bihar",
    niche: "food-culture",
    budget_per_deliverable: 30000,
    audience_min: 100000,
    audience_max: 50000,
  }), /cannot exceed/i);
});

test("fallback results retain descending backend-style fit order and full factors", () => {
  const payload = toSearchPayload({
    state: "punjab",
    niche: "beauty",
    budget_per_deliverable: 40000,
    languages: ["punjabi"],
    platforms: [],
    availability: [],
    audience_min: "",
    audience_max: "",
    limit: 20,
    relax: true,
  });
  const results = fallbackSearchCreators(payload);
  assert.ok(results.length > 0);
  assert.deepEqual([...results].map(({ fit_score }) => fit_score), [...results].map(({ fit_score }) => fit_score).sort((a, b) => b - a));
  assert.deepEqual(Object.keys(results[0].fit_factors).sort(), ["availability", "budget", "location", "quality", "relevance"]);
});

test("optional-filter misses relax to state-level matches", () => {
  const results = fallbackSearchCreators({
    state: "bihar",
    niche: "food-culture",
    budget_per_deliverable: 30000,
    availability: ["limited"],
    limit: 20,
    relax: true,
  });
  assert.ok(results.length > 0);
  assert.ok(results.every(({ relaxed }) => relaxed));
  assert.ok(results.every(({ state }) => state === "Bihar"));
});

test("an impossible state-and-budget combination remains genuinely empty", () => {
  const results = fallbackSearchCreators({
    state: "bihar",
    niche: "food-culture",
    budget_per_deliverable: 1000,
    limit: 20,
    relax: true,
  });
  assert.deepEqual(results, []);
});
