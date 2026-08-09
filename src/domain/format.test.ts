import { describe, expect, it } from "vitest";
import { formatElapsed } from "./format.ts";

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

  it("grows an hours field only once it is needed", () => {
    expect(formatElapsed(59 * 60_000 + 59_000)).toBe("59:59");
    expect(formatElapsed(60 * 60_000)).toBe("1:00:00");
    expect(formatElapsed(10 * 60 * 60_000 + 3 * 60_000 + 7000)).toBe("10:03:07");
  });

  it("never renders a negative time", () => {
    expect(formatElapsed(-5000)).toBe("00:00");
  });
});

describe("announcement", () => {
  it("reads a time a screen reader can speak", async () => {
    const { announceElapsed } = await import("./format.ts");
    expect(announceElapsed(0)).toBe("0 seconds");
    expect(announceElapsed(1000)).toBe("1 second");
    expect(announceElapsed(65_000)).toBe("1 minute 5 seconds");
    expect(announceElapsed(60 * 60_000)).toBe("1 hour");
  });
});
