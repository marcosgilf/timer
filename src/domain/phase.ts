import { MAX_DURATION_MS, type Routine } from "./routine.ts";

export type PhaseKind = "prepare" | "work" | "rest" | "done";
export type TimerStatus = "running" | "done";

export type TimerState = {
  status: TimerStatus;
  phaseKind: PhaseKind;
  remainingInPhaseMs: number;
  elapsedInPhaseMs: number;
  phaseProgress: number;
  round: number;
  totalRounds: number;
  nextPhaseKind: PhaseKind | null;
  totalElapsedMs: number;
  /** Compatibility aliases used by the existing display and clock screens. */
  displayMs: number;
  elapsedMs: number;
};

const doneState = (
  elapsedMs: number,
  totalRounds: number,
  totalElapsedMs: number,
  displayMs = 0,
): TimerState => ({
  status: "done",
  phaseKind: "done",
  remainingInPhaseMs: 0,
  elapsedInPhaseMs: 0,
  phaseProgress: 1,
  round: totalRounds,
  totalRounds,
  nextPhaseKind: null,
  totalElapsedMs,
  displayMs,
  elapsedMs,
});

/**
 * Derive display state from elapsed time. No ticking state lives here, so a delayed frame still lands
 * on the correct value and exact phase boundaries never drift.
 */
export const phaseAt = (rawElapsedMs: number, routine: Routine): TimerState => {
  const elapsedMs = Number.isFinite(rawElapsedMs) ? Math.max(0, rawElapsedMs) : 0;

  if (routine.direction === "up") {
    const displayMs = Math.min(MAX_DURATION_MS, elapsedMs);
    return displayMs === MAX_DURATION_MS
      ? doneState(elapsedMs, 1, MAX_DURATION_MS, MAX_DURATION_MS)
      : {
          status: "running",
          phaseKind: "work",
          remainingInPhaseMs: elapsedMs,
          elapsedInPhaseMs: elapsedMs,
          phaseProgress: 0,
          round: 1,
          totalRounds: 1,
          nextPhaseKind: null,
          totalElapsedMs: elapsedMs,
          displayMs,
          elapsedMs,
        };
  }

  const roundLengthMs = routine.durationMs + routine.restMs;
  const totalDurationMs = roundLengthMs * routine.rounds;
  if (elapsedMs >= totalDurationMs) return doneState(elapsedMs, routine.rounds, totalDurationMs);

  const round = Math.floor(elapsedMs / roundLengthMs) + 1;
  const elapsedInRoundMs = elapsedMs % roundLengthMs;
  const inRest = routine.restMs > 0 && elapsedInRoundMs >= routine.durationMs;
  const phaseKind: PhaseKind = inRest ? "rest" : "work";
  const phaseDurationMs = inRest ? routine.restMs : routine.durationMs;
  const elapsedInPhaseMs = inRest ? elapsedInRoundMs - routine.durationMs : elapsedInRoundMs;
  const remainingInPhaseMs = phaseDurationMs - elapsedInPhaseMs;
  const nextPhaseKind: PhaseKind = inRest
    ? round < routine.rounds
      ? "work"
      : "done"
    : routine.restMs > 0
      ? "rest"
      : round < routine.rounds
        ? "work"
        : "done";

  return {
    status: "running",
    phaseKind,
    remainingInPhaseMs,
    elapsedInPhaseMs,
    phaseProgress: elapsedInPhaseMs / phaseDurationMs,
    round,
    totalRounds: routine.rounds,
    nextPhaseKind,
    totalElapsedMs: elapsedMs,
    displayMs: remainingInPhaseMs,
    elapsedMs,
  };
};
