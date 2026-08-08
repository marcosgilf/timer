import { describe, expect, it } from "vitest";
import { phaseAt } from "./phase.ts";
import { countdown } from "./routine.ts";

const routine = countdown(60_000);
const PREPARE = 10_000;

describe("phaseAt", () => {
  it("starts in the prepare Phase, counting down", () => {
    const phase = phaseAt(0, routine, PREPARE);
    expect(phase.kind).toBe("prepare");
    expect(phase.remainingMs).toBe(PREPARE);
  });

  it("is exact at the prepare/work boundary", () => {
    expect(phaseAt(PREPARE - 1, routine, PREPARE).kind).toBe("prepare");
    expect(phaseAt(PREPARE, routine, PREPARE).kind).toBe("work");
  });

  it("is exact at the work/done boundary", () => {
    const end = PREPARE + routine.workMs;
    expect(phaseAt(end - 1, routine, PREPARE).kind).toBe("work");
    expect(phaseAt(end, routine, PREPARE).kind).toBe("done");
    expect(phaseAt(end + 1, routine, PREPARE).kind).toBe("done");
  });

  it("counts the work Phase down to zero", () => {
    expect(phaseAt(PREPARE, routine, PREPARE).remainingMs).toBe(60_000);
    expect(phaseAt(PREPARE + 20_000, routine, PREPARE).remainingMs).toBe(40_000);
  });

  it("reports progress through the current Phase, not the Routine", () => {
    expect(phaseAt(PREPARE + 15_000, routine, PREPARE).progress).toBeCloseTo(0.25);
  });

  it("skips the prepare Phase entirely when it is disabled", () => {
    expect(phaseAt(0, routine, 0).kind).toBe("work");
  });

  it("clamps a negative elapsed to the start", () => {
    expect(phaseAt(-500, routine, PREPARE).kind).toBe("prepare");
  });

  it("does not drift: the boundary is the same after a long Routine", () => {
    const long = countdown(30 * 60_000);
    const end = PREPARE + long.workMs;
    expect(phaseAt(end - 1, long, PREPARE).kind).toBe("work");
    expect(phaseAt(end, long, PREPARE).kind).toBe("done");
  });
});
