/** The display never grows an hours field, so the timer tops out here. */
export const MAX_ELAPSED_MS = 99 * 60_000 + 59_000;

const parts = (ms: number) => {
  const total = Math.floor(Math.min(MAX_ELAPSED_MS, Math.max(0, ms)) / 1000);
  return { minutes: Math.floor(total / 60), seconds: total % 60 };
};

const pad = (value: number) => String(value).padStart(2, "0");

/** Counting up, so a part-second is not yet a second. */
export function formatElapsed(ms: number): string {
  const { minutes, seconds } = parts(ms);
  return `${pad(minutes)}:${pad(seconds)}`;
}

/**
 * The same time as words. The visible digits are far too noisy to announce every second, so a screen
 * reader is given this on demand — when the Routine is paused, reset or finished — instead.
 */
export function announceElapsed(ms: number): string {
  const { minutes, seconds } = parts(ms);
  const unit = (value: number, name: string) => (value === 1 ? `1 ${name}` : `${value} ${name}s`);

  const spoken = [
    minutes > 0 ? unit(minutes, "minute") : "",
    seconds > 0 ? unit(seconds, "second") : "",
  ].filter(Boolean);

  return spoken.length === 0 ? "0 seconds" : spoken.join(" ");
}
