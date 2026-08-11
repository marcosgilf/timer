import { describe, expect, it } from "vitest";
import { elapsedMs, isRunning, pause, reset, resume, start, stopped } from "./clock.ts";

describe("clock", () => {
  it("starts stopped at zero", () => {
    expect(elapsedMs(stopped, 10_000)).toBe(0);
    expect(isRunning(stopped)).toBe(false);
  });

  it("derives elapsed from the current time, never by counting", () => {
    const clock = start(stopped, 1000);
    expect(elapsedMs(clock, 1000)).toBe(0);
    expect(elapsedMs(clock, 4500)).toBe(3500);
  });

  it("freezes while paused", () => {
    const clock = pause(start(stopped, 0), 5000);
    expect(elapsedMs(clock, 5000)).toBe(5000);
    expect(elapsedMs(clock, 60_000)).toBe(5000);
    expect(isRunning(clock)).toBe(false);
  });

  it("continues from where it stopped, excluding the paused time", () => {
    const clock = resume(pause(start(stopped, 0), 5000), 20_000);
    expect(elapsedMs(clock, 21_000)).toBe(6000);
    expect(isRunning(clock)).toBe(true);
  });

  it("survives several pause cycles", () => {
    let clock = resume(pause(start(stopped, 0), 1000), 3000); // paused 2s
    clock = resume(pause(clock, 5000), 9000); // paused 4s more
    expect(elapsedMs(clock, 10_000)).toBe(4000);
  });

  it("resets to a stopped zero", () => {
    const clock = reset();
    expect(elapsedMs(clock, 500_000)).toBe(0);
    expect(isRunning(clock)).toBe(false);
  });

  it("ignores pause when not running and resume when not paused", () => {
    const running = start(stopped, 0);
    expect(resume(running, 5000)).toEqual(running);
    expect(pause(stopped, 5000)).toEqual(stopped);
  });

  it("is unaffected by a clock that jumps backwards", () => {
    const clock = start(stopped, 10_000);
    expect(elapsedMs(clock, 9000)).toBe(0);
  });
});
