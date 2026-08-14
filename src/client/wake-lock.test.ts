import { describe, expect, it, vi } from "vitest";
import {
  createScreenWakeLock,
  type ScreenWakeLockManager,
  type ScreenWakeLockSentinel,
  type WakeLockAcquireResult,
} from "./wake-lock.ts";

type FakeSentinel = ScreenWakeLockSentinel & {
  releaseCount: number;
  triggerRelease: () => void;
};

const fakeSentinel = (): FakeSentinel => {
  let onRelease = () => {};
  const sentinel = {
    releaseCount: 0,
    addEventListener: (_type: "release", listener: () => void) => {
      onRelease = listener;
    },
    release: async () => {
      sentinel.releaseCount += 1;
      onRelease();
    },
    triggerRelease: () => onRelease(),
  };
  return sentinel;
};

describe("screen wake lock", () => {
  it("requests once while visible and releases without reporting an expected release", async () => {
    const sentinel = fakeSentinel();
    const manager: ScreenWakeLockManager = { request: vi.fn(async () => sentinel) };
    const onUnexpectedRelease = vi.fn();
    const lock = createScreenWakeLock(
      () => manager,
      () => true,
      onUnexpectedRelease,
    );

    expect(await lock.acquire()).toBe("acquired");
    expect(await lock.acquire()).toBe("acquired");
    expect(manager.request).toHaveBeenCalledTimes(1);
    expect(lock.held).toBe(true);

    await lock.release();
    expect(sentinel.releaseCount).toBe(1);
    expect(lock.held).toBe(false);
    expect(onUnexpectedRelease).not.toHaveBeenCalled();
  });

  it("reports a sentinel released by the platform", async () => {
    const sentinel = fakeSentinel();
    const manager: ScreenWakeLockManager = { request: async () => sentinel };
    const onUnexpectedRelease = vi.fn();
    const lock = createScreenWakeLock(
      () => manager,
      () => true,
      onUnexpectedRelease,
    );

    expect(await lock.acquire()).toBe("acquired");
    sentinel.triggerRelease();

    expect(lock.held).toBe(false);
    expect(onUnexpectedRelease).toHaveBeenCalledOnce();
  });

  it("shares one in-flight acquisition", async () => {
    const sentinel = fakeSentinel();
    let resolveRequest!: (value: ScreenWakeLockSentinel) => void;
    const request = new Promise<ScreenWakeLockSentinel>((resolve) => {
      resolveRequest = resolve;
    });
    const manager: ScreenWakeLockManager = { request: vi.fn(() => request) };
    const lock = createScreenWakeLock(
      () => manager,
      () => true,
    );

    const first = lock.acquire();
    const second = lock.acquire();
    expect(manager.request).toHaveBeenCalledOnce();

    resolveRequest(sentinel);
    expect(await first).toBe("acquired");
    expect(await second).toBe("acquired");
  });

  it("retries after release and recovers after a failed retry", async () => {
    const first = fakeSentinel();
    const recovered = fakeSentinel();
    const denial = new Error("denied");
    const manager: ScreenWakeLockManager = {
      request: vi
        .fn()
        .mockResolvedValueOnce(first)
        .mockRejectedValueOnce(denial)
        .mockResolvedValueOnce(recovered),
    };
    let retry!: Promise<WakeLockAcquireResult>;
    const lock = createScreenWakeLock(
      () => manager,
      () => true,
      () => {
        retry = lock.acquire();
      },
    );

    expect(await lock.acquire()).toBe("acquired");
    first.triggerRelease();
    expect(await retry).toEqual({ status: "failed", error: denial });
    expect(await lock.acquire()).toBe("acquired");
    expect(lock.held).toBe(true);
    expect(manager.request).toHaveBeenCalledTimes(3);
  });

  it("does not request while hidden or when unsupported", async () => {
    const manager: ScreenWakeLockManager = { request: vi.fn() };
    let visible = false;
    const lock = createScreenWakeLock(
      () => manager,
      () => visible,
    );

    expect(await lock.acquire()).toBe("cancelled");
    expect(manager.request).not.toHaveBeenCalled();

    visible = true;
    const unsupported = createScreenWakeLock(
      () => undefined,
      () => visible,
    );
    expect(await unsupported.acquire()).toBe("unsupported");
  });

  it("reports a rejected supported request as a failure", async () => {
    const error = new Error("denied");
    const manager: ScreenWakeLockManager = {
      request: async () => Promise.reject(error),
    };
    const lock = createScreenWakeLock(
      () => manager,
      () => true,
    );

    expect(await lock.acquire()).toEqual({ status: "failed", error });
    expect(lock.held).toBe(false);
  });

  it("releases a request that resolves after the routine stopped", async () => {
    const sentinel = fakeSentinel();
    let resolveRequest!: (value: ScreenWakeLockSentinel) => void;
    const request = new Promise<ScreenWakeLockSentinel>((resolve) => {
      resolveRequest = resolve;
    });
    const manager: ScreenWakeLockManager = { request: () => request };
    const lock = createScreenWakeLock(
      () => manager,
      () => true,
    );

    const acquiring = lock.acquire();
    await lock.release();
    resolveRequest(sentinel);

    expect(await acquiring).toBe("cancelled");
    expect(sentinel.releaseCount).toBe(1);
    expect(lock.held).toBe(false);
  });
});
