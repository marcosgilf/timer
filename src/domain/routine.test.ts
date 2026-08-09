import { describe, expect, it } from "vitest";
import {
  clampDuration,
  countdown,
  durationFromParts,
  MAX_DURATION_MS,
  MIN_DURATION_MS,
  totalDurationMs,
} from "./routine.ts";

describe("clampDuration", () => {
  it("keeps a legal duration untouched", () => {
    expect(clampDuration(300_000)).toBe(300_000);
  });

  it("clamps silently instead of rejecting", () => {
    expect(clampDuration(0)).toBe(MIN_DURATION_MS);
    expect(clampDuration(-5000)).toBe(MIN_DURATION_MS);
    expect(clampDuration(MAX_DURATION_MS + 1000)).toBe(MAX_DURATION_MS);
  });
});

describe("durationFromParts", () => {
  it("combines minutes and seconds", () => {
    expect(durationFromParts(5, 30)).toBe(330_000);
  });

  it("rolls overflowing seconds into minutes: 0:75 becomes 1:15", () => {
    expect(durationFromParts(0, 75)).toBe(durationFromParts(1, 15));
  });

  it("treats missing parts as zero and still clamps", () => {
    expect(durationFromParts(Number.NaN, Number.NaN)).toBe(MIN_DURATION_MS);
  });
});

describe("countdown", () => {
  it("defaults to five minutes", () => {
    expect(countdown().workMs).toBe(300_000);
  });

  it("clamps whatever it is given", () => {
    expect(countdown(0).workMs).toBe(MIN_DURATION_MS);
  });
});

describe("totalDurationMs", () => {
  it("is what the user configured, not what the clock measured", () => {
    expect(totalDurationMs(countdown(600_000))).toBe(600_000);
  });
});
