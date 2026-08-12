import { describe, expect, it } from "vitest";
import {
  countdown,
  DEFAULT_DURATION_MS,
  durationFromParts,
  MAX_DURATION_MS,
  MIN_DURATION_MS,
  stepDuration,
} from "./routine.ts";

describe("countdown duration", () => {
  it("defaults to five minutes", () => {
    expect(countdown()).toEqual({ direction: "down", durationMs: DEFAULT_DURATION_MS });
  });

  it("carries seconds into minutes", () => {
    expect(stepDuration(3 * 60_000 + 59_000, "seconds", 1)).toBe(4 * 60_000);
    expect(stepDuration(4 * 60_000, "minutes", -1)).toBe(3 * 60_000);
  });

  it("clamps silently at the smallest and largest display values", () => {
    expect(countdown(0).durationMs).toBe(MIN_DURATION_MS);
    expect(countdown(Number.NaN).durationMs).toBe(MIN_DURATION_MS);
    expect(countdown(MAX_DURATION_MS + 1).durationMs).toBe(MAX_DURATION_MS);
    expect(stepDuration(MIN_DURATION_MS, "seconds", -1)).toBe(MIN_DURATION_MS);
    expect(stepDuration(MAX_DURATION_MS, "seconds", 1)).toBe(MAX_DURATION_MS);
  });

  it("keeps each step at its labelled unit", () => {
    expect(stepDuration(5 * 60_000, "minutes", 1)).toBe(6 * 60_000);
    expect(stepDuration(5 * 60_000, "seconds", -1)).toBe(4 * 60_000 + 59_000);
  });

  it("carries query parts and clamps the result", () => {
    expect(durationFromParts(1, 10)).toBe(70_000);
    expect(durationFromParts(0, 75)).toBe(75_000);
    expect(durationFromParts(-1, 0)).toBe(MIN_DURATION_MS);
    expect(durationFromParts(99, 60)).toBe(MAX_DURATION_MS);
    expect(durationFromParts(Number.NaN, Number.POSITIVE_INFINITY)).toBe(MIN_DURATION_MS);
  });
});
