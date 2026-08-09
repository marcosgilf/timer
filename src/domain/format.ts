const parts = (ms: number) => {
  const total = Math.floor(Math.max(0, ms) / 1000);
  return {
    hours: Math.floor(total / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
};

const pad = (value: number) => String(value).padStart(2, "0");

/** Counting up, so a part-second is not yet a second. Hours appear only once there are any. */
export function formatElapsed(ms: number): string {
  const { hours, minutes, seconds } = parts(ms);
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${pad(minutes)}:${pad(seconds)}`;
}

/**
 * The same time as words. The visible digits are far too noisy to announce every second, so a screen
 * reader is given this on demand — when the Routine is paused or reset — instead.
 */
export function announceElapsed(ms: number): string {
  const { hours, minutes, seconds } = parts(ms);
  const unit = (value: number, name: string) => (value === 1 ? `1 ${name}` : `${value} ${name}s`);

  const spoken = [
    hours > 0 ? unit(hours, "hour") : "",
    minutes > 0 ? unit(minutes, "minute") : "",
    seconds > 0 ? unit(seconds, "second") : "",
  ].filter(Boolean);

  return spoken.length === 0 ? "0 seconds" : spoken.join(" ");
}
