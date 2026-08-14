/** A Routine chooses count direction and, for countdowns, its configured phases and rounds. */
export type CountDirection = "up" | "down";

export type Routine = {
  direction: CountDirection;
  durationMs: number;
  restMs: number;
  rounds: number;
};

export type DurationUnit = "minutes" | "seconds";

export const MIN_DURATION_MS = 1_000;
export const MAX_DURATION_MS = 99 * 60_000 + 59_000;
export const DEFAULT_DURATION_MS = 5 * 60_000;
export const MIN_ROUNDS = 1;
export const MAX_ROUNDS = 99;

const clampPhaseDuration = (durationMs: number, allowZero: boolean): number => {
  const rounded = Number.isFinite(durationMs) ? Math.round(durationMs) : MIN_DURATION_MS;
  const minimum = allowZero ? 0 : MIN_DURATION_MS;
  return Math.min(MAX_DURATION_MS, Math.max(minimum, rounded));
};

export const clampDuration = (durationMs: number): number => clampPhaseDuration(durationMs, false);
export const clampRestDuration = (durationMs: number): number =>
  clampPhaseDuration(durationMs, true);

export const clampRounds = (rounds: number): number => {
  const whole = Number.isFinite(rounds) ? Math.trunc(rounds) : MIN_ROUNDS;
  return Math.min(MAX_ROUNDS, Math.max(MIN_ROUNDS, whole));
};

export const chrono = (): Routine => ({ direction: "up", durationMs: 0, restMs: 0, rounds: 1 });

export const countdown = (
  durationMs = DEFAULT_DURATION_MS,
  restMs = 0,
  rounds = MIN_ROUNDS,
): Routine => ({
  direction: "down",
  durationMs: clampDuration(durationMs),
  restMs: clampRestDuration(restMs),
  rounds: clampRounds(rounds),
});

/** Parse URL parts with the same carry and bounds as steppers. */
export const durationFromParts = (minutes: number, seconds: number, allowZero = false): number => {
  const whole = (value: number) => (Number.isFinite(value) ? Math.trunc(value) : 0);
  return clampPhaseDuration((whole(minutes) * 60 + whole(seconds)) * 1000, allowZero);
};

/** Step one labelled unit and carry between seconds and minutes naturally. */
export const stepDuration = (
  durationMs: number,
  unit: DurationUnit,
  amount: number,
  allowZero = false,
): number =>
  clampPhaseDuration(durationMs + (unit === "minutes" ? 60_000 : 1_000) * amount, allowZero);

/** Step rounds by one and keep them within the displayable range. */
export const stepRounds = (rounds: number, amount: number): number => clampRounds(rounds + amount);
