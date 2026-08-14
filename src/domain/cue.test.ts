import { describe, expect, it } from "vitest";
import { COMPLETION_CUE_DURATION_SECONDS, completionCueSchedule } from "./cue.ts";

describe("count-down completion cue", () => {
  it("books cue at current audio time plus derived remaining time", () => {
    expect(completionCueSchedule(12.5, 2500)).toEqual({
      at: 15,
      stopAt: 15 + COMPLETION_CUE_DURATION_SECONDS,
    });
  });

  it("never schedules before current audio time", () => {
    expect(completionCueSchedule(12.5, -1)).toEqual({
      at: 12.5,
      stopAt: 12.5 + COMPLETION_CUE_DURATION_SECONDS,
    });
  });
});
