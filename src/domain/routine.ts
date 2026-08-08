/** A Routine is a Mode plus its settings — the whole configured thing the user starts. */
export type Mode = "countdown";

export type PhaseKind = "prepare" | "work" | "rest" | "done";

export type Routine = {
  mode: Mode;
  /** Duration of the work Phase. */
  workMs: number;
};

export const MIN_DURATION_MS = 1000;
export const MAX_DURATION_MS = 99 * 60_000 + 59_000;
export const DEFAULT_PREPARE_MS = 10_000;

/** Clamps silently: invalid input never blocks Start and never shows an error. */
export const clampDuration = (ms: number): number =>
  Math.min(MAX_DURATION_MS, Math.max(MIN_DURATION_MS, Math.round(ms) || MIN_DURATION_MS));

/** Seconds above 59 roll into minutes, so typing 0:75 gives 1:15. */
export const durationFromParts = (minutes: number, seconds: number): number =>
  clampDuration(((minutes || 0) * 60 + (seconds || 0)) * 1000);

export const countdown = (workMs = 300_000): Routine => ({
  mode: "countdown",
  workMs: clampDuration(workMs),
});
