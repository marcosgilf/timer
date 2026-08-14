export const COMPLETION_CUE_DURATION_SECONDS = 0.24;

export type CompletionCueSchedule = {
  at: number;
  stopAt: number;
};

/** Book count-down completion sound from audio clock, not a render callback. */
export const completionCueSchedule = (
  currentTime: number,
  remainingMs: number,
): CompletionCueSchedule => {
  const at = currentTime + Math.max(0, remainingMs) / 1000;
  return { at, stopAt: at + COMPLETION_CUE_DURATION_SECONDS };
};
