/**
 * The three numbers a running Routine is made of. Elapsed time is always *derived* from them and the
 * current wall clock — never counted up — so nothing accumulates and nothing drifts.
 */
export type Clock = {
  startedAt: number;
  pausedTotalMs: number;
  pausedAt: number | null;
};

export const start = (now: number): Clock => ({ startedAt: now, pausedTotalMs: 0, pausedAt: null });

export const elapsedMs = (clock: Clock, now: number): number =>
  (clock.pausedAt ?? now) - clock.startedAt - clock.pausedTotalMs;

export const isPaused = (clock: Clock): boolean => clock.pausedAt !== null;

export const pause = (clock: Clock, now: number): Clock =>
  isPaused(clock) ? clock : { ...clock, pausedAt: now };

export const resume = (clock: Clock, now: number): Clock =>
  clock.pausedAt === null
    ? clock
    : { ...clock, pausedTotalMs: clock.pausedTotalMs + (now - clock.pausedAt), pausedAt: null };
