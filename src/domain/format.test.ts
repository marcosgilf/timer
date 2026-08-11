import { describe, expect, it } from "vitest";
import { announceElapsed, formatElapsed, formatRemaining, MAX_ELAPSED_MS } from "./format.ts";

describe("formatElapsed", () => {
  it("shows minutes and seconds", () => {
    expect(formatElapsed(0)).toBe("00:00");
    expect(formatElapsed(9000)).toBe("00:09");
    expect(formatElapsed(65_000)).toBe("01:05");
  });

  it("counts up, so a part-second is not yet a second", () => {
    expect(formatElapsed(999)).toBe("00:00");
    expect(formatElapsed(1000)).toBe("00:01");
  });

  it("keeps counting minutes past an hour instead of growing an hours field", () => {
    expect(formatElapsed(60 * 60_000)).toBe("60:00");
    expect(formatElapsed(90 * 60_000 + 7000)).toBe("90:07");
  });

  it("stops at the ceiling of 99:59", () => {
    expect(formatElapsed(MAX_ELAPSED_MS)).toBe("99:59");
    expect(formatElapsed(MAX_ELAPSED_MS + 60_000)).toBe("99:59");
  });

  it("never renders a negative time", () => {
    expect(formatElapsed(-5000)).toBe("00:00");
  });
});

describe("formatRemaining", () => {
  it("rounds countdown values up so zero never flashes before completion", () => {
    expect(formatRemaining(0)).toBe("00:00");
    expect(formatRemaining(1)).toBe("00:01");
    expect(formatRemaining(1000)).toBe("00:01");
    expect(formatRemaining(1001)).toBe("00:02");
  });
});

describe("announceElapsed", () => {
  it("reads a time a screen reader can speak", () => {
    expect(announceElapsed(0)).toBe("0 seconds");
    expect(announceElapsed(1000)).toBe("1 second");
    expect(announceElapsed(65_000)).toBe("1 minute 5 seconds");
    expect(announceElapsed(120_000)).toBe("2 minutes");
  });

  it("is capped like the display", () => {
    expect(announceElapsed(MAX_ELAPSED_MS + 60_000)).toBe("99 minutes 59 seconds");
  });
});
