import { DEFAULT_PREPARE_MS, type PhaseKind, type Routine } from "./routine.ts";

export type PhaseState = {
  kind: PhaseKind;
  /** Time left in the current Phase. Zero once the Routine is done. */
  remainingMs: number;
  /** How far through the current Phase, 0–1 — for the progress bar. */
  progress: number;
  totalElapsedMs: number;
};

/**
 * The whole engine: a pure function of elapsed time. Nothing is stepped or accumulated, so any
 * elapsed value — including one reconstructed after a reload or a device sleep — yields the right
 * Phase.
 */
export function phaseAt(
  elapsedMs: number,
  routine: Routine,
  prepareMs = DEFAULT_PREPARE_MS,
): PhaseState {
  const elapsed = Math.max(0, elapsedMs);

  if (elapsed < prepareMs) {
    return {
      kind: "prepare",
      remainingMs: prepareMs - elapsed,
      progress: prepareMs === 0 ? 1 : elapsed / prepareMs,
      totalElapsedMs: elapsed,
    };
  }

  const inRoutine = elapsed - prepareMs;
  if (inRoutine >= routine.workMs) {
    return { kind: "done", remainingMs: 0, progress: 1, totalElapsedMs: elapsed };
  }

  return {
    kind: "work",
    remainingMs: routine.workMs - inRoutine,
    progress: inRoutine / routine.workMs,
    totalElapsedMs: elapsed,
  };
}
