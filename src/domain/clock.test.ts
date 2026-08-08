import { describe, expect, it } from "vitest";
import { elapsedMs, pause, resume, start } from "./clock.ts";

describe("clock", () => {
  it("derives elapsed from the current time, never by counting", () => {
    const clock = start(1000);
    expect(elapsedMs(clock, 1000)).toBe(0);
    expect(elapsedMs(clock, 4500)).toBe(3500);
  });

  it("freezes while paused", () => {
    const clock = pause(start(0), 5000);
    expect(elapsedMs(clock, 5000)).toBe(5000);
    expect(elapsedMs(clock, 60_000)).toBe(5000);
  });

  it("excludes paused time after resuming", () => {
    const clock = resume(pause(start(0), 5000), 20_000);
    expect(elapsedMs(clock, 21_000)).toBe(6000);
  });

  it("survives several pause cycles", () => {
    let clock = resume(pause(start(0), 1000), 3000); // paused 2s
    clock = resume(pause(clock, 5000), 9000); // paused 4s more
    expect(elapsedMs(clock, 10_000)).toBe(4000);
  });

  it("ignores a resume when it is not paused", () => {
    const clock = start(0);
    expect(resume(clock, 5000)).toEqual(clock);
  });
});
