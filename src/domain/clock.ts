/**
 * A Clock is three numbers. Elapsed time is always *derived* from them and the current wall clock —
 * never counted up — so nothing accumulates, nothing drifts, and a tab that was hidden for ten
 * minutes shows the right time the moment it comes back.
 */
export type Clock = {
  startedAt: number | null;
  pausedTotalMs: number;
  pausedAt: number | null;
};

export const stopped: Clock = { startedAt: null, pausedTotalMs: 0, pausedAt: null };

export const isRunning = (clock: Clock): boolean =>
  clock.startedAt !== null && clock.pausedAt === null;

export const elapsedMs = (clock: Clock, now: number): number =>
  clock.startedAt === null
    ? 0
    : Math.max(0, (clock.pausedAt ?? now) - clock.startedAt - clock.pausedTotalMs);

export const start = (clock: Clock, now: number): Clock =>
  clock.startedAt === null ? { startedAt: now, pausedTotalMs: 0, pausedAt: null } : clock;

export const pause = (clock: Clock, now: number): Clock =>
  isRunning(clock) ? { ...clock, pausedAt: now } : clock;

export const resume = (clock: Clock, now: number): Clock =>
  clock.pausedAt === null
    ? clock
    : { ...clock, pausedTotalMs: clock.pausedTotalMs + (now - clock.pausedAt), pausedAt: null };

export const reset = (_clock: Clock): Clock => stopped;
