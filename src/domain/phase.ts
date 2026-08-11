import { MAX_DURATION_MS, type Routine } from "./routine.ts";

export type TimerStatus = "running" | "done";

export type TimerState = {
  status: TimerStatus;
  displayMs: number;
  elapsedMs: number;
};

/**
 * Derive display state from elapsed time. No ticking state lives here, so a delayed frame still lands
 * on the correct value and exact countdown zero can end the Routine without rendering a negative time.
 */
export const phaseAt = (rawElapsedMs: number, routine: Routine): TimerState => {
  const elapsedMs = Math.max(0, rawElapsedMs);

  if (routine.direction === "down") {
    const displayMs = Math.max(0, routine.durationMs - elapsedMs);
    return { status: displayMs === 0 ? "done" : "running", displayMs, elapsedMs };
  }

  const displayMs = Math.min(MAX_DURATION_MS, elapsedMs);
  return { status: displayMs === MAX_DURATION_MS ? "done" : "running", displayMs, elapsedMs };
};
