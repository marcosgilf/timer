export type ScreenWakeLockSentinel = {
  addEventListener: (type: "release", listener: () => void) => void;
  release: () => Promise<void>;
};

export type ScreenWakeLockManager = {
  request: (type: "screen") => Promise<ScreenWakeLockSentinel>;
};

export type WakeLockAcquireResult = "acquired" | "unsupported" | "failed" | "cancelled";

export const createScreenWakeLock = (
  getManager: () => ScreenWakeLockManager | undefined,
  isVisible: () => boolean,
  onUnexpectedRelease: () => void = () => {},
) => {
  let sentinel: ScreenWakeLockSentinel | null = null;
  let requestVersion = 0;
  let pending: { version: number; promise: Promise<WakeLockAcquireResult> } | null = null;

  const releaseSentinel = async (value: ScreenWakeLockSentinel) => {
    try {
      await value.release();
    } catch {
      // Wake Lock is an optional enhancement. Release failures cannot affect Clock state.
    }
  };

  const acquire = (): Promise<WakeLockAcquireResult> => {
    if (sentinel) return Promise.resolve("acquired");
    if (!isVisible()) return Promise.resolve("cancelled");
    if (pending?.version === requestVersion) return pending.promise;

    const manager = getManager();
    if (!manager) return Promise.resolve("unsupported");

    const version = requestVersion;
    let request: Promise<ScreenWakeLockSentinel>;
    try {
      request = manager.request("screen");
    } catch {
      return Promise.resolve("failed" as const);
    }

    const promise = request
      .then(async (next) => {
        if (version !== requestVersion || sentinel) {
          await releaseSentinel(next);
          return "cancelled" as const;
        }

        sentinel = next;
        next.addEventListener("release", () => {
          if (sentinel !== next) return;
          sentinel = null;
          onUnexpectedRelease();
        });
        return "acquired" as const;
      })
      .catch(() => (version === requestVersion ? "failed" : "cancelled"))
      .finally(() => {
        if (pending?.version === version) pending = null;
      });

    pending = { version, promise };
    return promise;
  };

  const release = async (): Promise<void> => {
    requestVersion += 1;
    pending = null;
    const current = sentinel;
    sentinel = null;
    if (current) await releaseSentinel(current);
  };

  return {
    acquire,
    release,
    get held() {
      return sentinel !== null;
    },
  };
};
