/** A Routine chooses count direction and, for countdowns, its configured duration. */
export type CountDirection = "up" | "down";

export type Routine = {
  direction: CountDirection;
  durationMs: number;
};

export type DurationUnit = "minutes" | "seconds";

export const MIN_DURATION_MS = 1_000;
export const MAX_DURATION_MS = 99 * 60_000 + 59_000;
export const DEFAULT_DURATION_MS = 5 * 60_000;

export const chrono = (): Routine => ({ direction: "up", durationMs: 0 });

export const clampDuration = (durationMs: number): number => {
  const rounded = Number.isFinite(durationMs) ? Math.round(durationMs) : MIN_DURATION_MS;
  return Math.min(MAX_DURATION_MS, Math.max(MIN_DURATION_MS, rounded));
};

export const countdown = (durationMs = DEFAULT_DURATION_MS): Routine => ({
  direction: "down",
  durationMs: clampDuration(durationMs),
});

/** Step one labelled unit and carry between seconds and minutes naturally. */
export const stepDuration = (durationMs: number, unit: DurationUnit, amount: number): number =>
  clampDuration(durationMs + (unit === "minutes" ? 60_000 : 5_000) * amount);
