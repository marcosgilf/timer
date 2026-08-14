export type ScreenWakeLockSentinel = {
  addEventListener: (type: "release", listener: () => void) => void;
  release: () => Promise<void>;
};

export type ScreenWakeLockManager = {
  request: (type: "screen") => Promise<ScreenWakeLockSentinel>;
};

export const createScreenWakeLock = (
  getManager: () => ScreenWakeLockManager | undefined,
  isVisible: () => boolean,
  onUnexpectedRelease: () => void = () => {},
) => {
  let sentinel: ScreenWakeLockSentinel | null = null;
  let requestVersion = 0;

  const acquire = async (): Promise<boolean> => {
    if (sentinel) return true;
    if (!isVisible()) return false;

    const manager = getManager();
    if (!manager) return false;

    const version = ++requestVersion;
    try {
      const next = await manager.request("screen");
      if (version !== requestVersion || sentinel) {
        await next.release();
        return false;
      }

      sentinel = next;
      next.addEventListener("release", () => {
        if (sentinel !== next) return;
        sentinel = null;
        onUnexpectedRelease();
      });
      return true;
    } catch {
      return false;
    }
  };

  const release = async (): Promise<void> => {
    requestVersion += 1;
    const current = sentinel;
    sentinel = null;
    if (!current) return;

    try {
      await current.release();
    } catch {
      // Releasing is best effort. Clock accuracy does not depend on Wake Lock.
    }
  };

  return {
    acquire,
    release,
    get held() {
      return sentinel !== null;
    },
  };
};
