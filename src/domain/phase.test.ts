import { describe, expect, it } from "vitest";
import { phaseAt } from "./phase.ts";
import { chrono, countdown } from "./routine.ts";

describe("phaseAt", () => {
  const durationMs = 5 * 60_000;

  it("counts down until exact zero, then reports done", () => {
    const routine = countdown(durationMs);

    expect(phaseAt(durationMs - 1, routine)).toMatchObject({
      status: "running",
      displayMs: 1,
      elapsedMs: durationMs - 1,
    });
    expect(phaseAt(durationMs, routine)).toMatchObject({
      status: "done",
      displayMs: 0,
      elapsedMs: durationMs,
    });
    expect(phaseAt(durationMs + 1, routine)).toMatchObject({
      status: "done",
      displayMs: 0,
      elapsedMs: durationMs + 1,
    });
  });

  it("counts up from zero", () => {
    expect(phaseAt(0, chrono())).toMatchObject({ status: "running", displayMs: 0, elapsedMs: 0 });
    expect(phaseAt(65_000, chrono())).toMatchObject({
      status: "running",
      displayMs: 65_000,
      elapsedMs: 65_000,
    });
  });

  it("finishes count up at its display ceiling", () => {
    expect(phaseAt(99 * 60_000 + 59_000, chrono())).toMatchObject({
      status: "done",
      displayMs: 99 * 60_000 + 59_000,
    });
  });

  it("does not use negative elapsed time", () => {
    expect(phaseAt(-1, countdown(durationMs))).toMatchObject({
      status: "running",
      displayMs: durationMs,
      elapsedMs: 0,
    });
  });
});
