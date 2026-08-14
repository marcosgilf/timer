import { describe, expect, it } from "vitest";
import { phaseAt } from "./phase.ts";
import { chrono, countdown } from "./routine.ts";

describe("phaseAt", () => {
  const durationMs = 5 * 60_000;

  it("counts down until exact zero, then reports done", () => {
    const routine = countdown(durationMs);

    expect(phaseAt(durationMs - 1, routine)).toMatchObject({
      status: "running",
      phaseKind: "work",
      displayMs: 1,
      remainingInPhaseMs: 1,
      elapsedMs: durationMs - 1,
      round: 1,
      totalRounds: 1,
      nextPhaseKind: "done",
    });
    expect(phaseAt(durationMs, routine)).toMatchObject({
      status: "done",
      phaseKind: "done",
      displayMs: 0,
      elapsedMs: durationMs,
      round: 1,
    });
    expect(phaseAt(durationMs + 1, routine)).toMatchObject({
      status: "done",
      phaseKind: "done",
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

  it.each([
    {
      name: "Tabata",
      routine: countdown(20_000, 10_000, 8),
      phases: [
        "work",
        "rest",
        "work",
        "rest",
        "work",
        "rest",
        "work",
        "rest",
        "work",
        "rest",
        "work",
        "rest",
        "work",
        "rest",
        "work",
        "rest",
      ],
    },
    {
      name: "EMOM",
      routine: countdown(60_000, 0, 10),
      phases: ["work", "work", "work", "work", "work", "work", "work", "work", "work", "work"],
    },
    {
      name: "Pomodoro",
      routine: countdown(25 * 60_000, 5 * 60_000, 4),
      phases: ["work", "rest", "work", "rest", "work", "rest", "work", "rest"],
    },
  ])("derives the $name phase sequence from elapsed time", ({ routine, phases }) => {
    let elapsed = 0;
    const actual: string[] = [];

    for (let round = 1; round <= routine.rounds; round += 1) {
      actual.push(phaseAt(elapsed, routine).phaseKind);
      elapsed += routine.durationMs;
      if (routine.restMs > 0) {
        actual.push(phaseAt(elapsed, routine).phaseKind);
        elapsed += routine.restMs;
      }
    }

    expect(actual).toEqual(phases);
    expect(phaseAt(elapsed, routine)).toMatchObject({ status: "done", phaseKind: "done" });
  });

  it("changes phase only at exact boundaries", () => {
    const routine = countdown(20_000, 10_000, 2);

    expect(phaseAt(19_999, routine)).toMatchObject({
      phaseKind: "work",
      round: 1,
      remainingInPhaseMs: 1,
    });
    expect(phaseAt(20_000, routine)).toMatchObject({
      phaseKind: "rest",
      round: 1,
      remainingInPhaseMs: 10_000,
    });
    expect(phaseAt(29_999, routine)).toMatchObject({
      phaseKind: "rest",
      round: 1,
      remainingInPhaseMs: 1,
    });
    expect(phaseAt(30_000, routine)).toMatchObject({
      phaseKind: "work",
      round: 2,
      remainingInPhaseMs: 20_000,
    });
    expect(phaseAt(59_999, routine)).toMatchObject({
      phaseKind: "rest",
      round: 2,
      remainingInPhaseMs: 1,
    });
    expect(phaseAt(60_000, routine)).toMatchObject({ status: "done", phaseKind: "done", round: 2 });
  });
});
