import { describe, expect, it, vi } from "vitest";
import {
  createScreenWakeLock,
  type ScreenWakeLockManager,
  type ScreenWakeLockSentinel,
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

    expect(await lock.acquire()).toBe(true);
    expect(await lock.acquire()).toBe(true);
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

    await lock.acquire();
    sentinel.triggerRelease();

    expect(lock.held).toBe(false);
    expect(onUnexpectedRelease).toHaveBeenCalledOnce();
  });

  it("does not request while hidden or when unsupported", async () => {
    const manager: ScreenWakeLockManager = { request: vi.fn() };
    let visible = false;
    const lock = createScreenWakeLock(
      () => manager,
      () => visible,
    );

    expect(await lock.acquire()).toBe(false);
    expect(manager.request).not.toHaveBeenCalled();

    visible = true;
    const unsupported = createScreenWakeLock(
      () => undefined,
      () => visible,
    );
    expect(await unsupported.acquire()).toBe(false);
  });

  it("treats a rejected request as unsupported", async () => {
    const manager: ScreenWakeLockManager = {
      request: async () => Promise.reject(new Error("denied")),
    };
    const lock = createScreenWakeLock(
      () => manager,
      () => true,
    );

    expect(await lock.acquire()).toBe(false);
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

    expect(await acquiring).toBe(false);
    expect(sentinel.releaseCount).toBe(1);
    expect(lock.held).toBe(false);
  });
});
