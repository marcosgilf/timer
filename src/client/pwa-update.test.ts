import { describe, expect, it, vi } from "vitest";
import { createPwaUpdateController, type RegisterSW } from "./pwa-update.ts";

const createHarness = () => {
  let routineActive = false;
  let onNeedRefresh = () => {};
  const updateSW = vi.fn<ReturnType<RegisterSW>>();
  updateSW.mockResolvedValue(undefined);
  const registerSW = vi.fn<RegisterSW>((options) => {
    onNeedRefresh = options.onNeedRefresh;
    return updateSW;
  });
  const confirmLeave = vi.fn(() => true);
  const onUpdateReady = vi.fn();
  const onActivationConfirmed = vi.fn();
  const onActivationFailed = vi.fn();
  const controller = createPwaUpdateController({
    registerSW,
    isRoutineActive: () => routineActive,
    confirmLeave,
    onUpdateReady,
    onActivationConfirmed,
    onActivationFailed,
  });

  return {
    controller,
    get onNeedRefresh() {
      return onNeedRefresh;
    },
    updateSW,
    confirmLeave,
    onUpdateReady,
    onActivationConfirmed,
    onActivationFailed,
    setRoutineActive: (active: boolean) => {
      routineActive = active;
    },
  };
};

describe("PWA update controller", () => {
  it("starts current and becomes ready only when service worker needs refresh", () => {
    const harness = createHarness();

    expect(harness.controller.ready).toBe(false);
    harness.controller.register();
    expect(harness.controller.ready).toBe(false);

    harness.onNeedRefresh();

    expect(harness.controller.ready).toBe(true);
    expect(harness.onUpdateReady).toHaveBeenCalledOnce();
  });

  it("activates ready update immediately when no Routine is active", async () => {
    const harness = createHarness();
    harness.controller.register();
    harness.onNeedRefresh();

    await expect(harness.controller.activate()).resolves.toBe(true);

    expect(harness.confirmLeave).not.toHaveBeenCalled();
    expect(harness.onActivationConfirmed).not.toHaveBeenCalled();
    expect(harness.updateSW).toHaveBeenCalledOnce();
    expect(harness.updateSW).toHaveBeenCalledWith(true);
  });

  it("keeps update ready and current Routine when active user cancels", async () => {
    const harness = createHarness();
    harness.setRoutineActive(true);
    harness.confirmLeave.mockReturnValue(false);
    harness.controller.register();
    harness.onNeedRefresh();

    await expect(harness.controller.activate()).resolves.toBe(false);

    expect(harness.confirmLeave).toHaveBeenCalledOnce();
    expect(harness.onActivationConfirmed).not.toHaveBeenCalled();
    expect(harness.updateSW).not.toHaveBeenCalled();
    expect(harness.controller.ready).toBe(true);
  });

  it("confirms active Routine once before activating waiting update", async () => {
    const harness = createHarness();
    harness.setRoutineActive(true);
    harness.controller.register();
    harness.onNeedRefresh();

    await expect(harness.controller.activate()).resolves.toBe(true);

    expect(harness.confirmLeave).toHaveBeenCalledOnce();
    expect(harness.onActivationConfirmed).toHaveBeenCalledOnce();
    expect(harness.updateSW).toHaveBeenCalledOnce();
    expect(harness.updateSW).toHaveBeenCalledWith(true);
  });

  it("allows retry when waiting-version activation fails", async () => {
    const harness = createHarness();
    harness.updateSW.mockRejectedValueOnce(new Error("activation failed"));
    harness.controller.register();
    harness.onNeedRefresh();

    await expect(harness.controller.activate()).resolves.toBe(false);
    await expect(harness.controller.activate()).resolves.toBe(true);

    expect(harness.onActivationFailed).toHaveBeenCalledOnce();
    expect(harness.updateSW).toHaveBeenCalledTimes(2);
  });

  it("does not activate twice while first activation is in flight", async () => {
    const harness = createHarness();
    let resolveUpdate = () => {};
    harness.updateSW.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveUpdate = resolve;
        }),
    );
    harness.controller.register();
    harness.onNeedRefresh();

    const first = harness.controller.activate();
    const second = harness.controller.activate();
    resolveUpdate();

    await expect(first).resolves.toBe(true);
    await expect(second).resolves.toBe(false);
    expect(harness.updateSW).toHaveBeenCalledOnce();
  });

  it("leaves timer behavior alone when registration fails", () => {
    const onUpdateReady = vi.fn();
    const registerSW = vi.fn(() => {
      throw new Error("registration failed");
    });
    const controller = createPwaUpdateController({
      registerSW,
      isRoutineActive: () => true,
      confirmLeave: vi.fn(),
      onUpdateReady,
      onActivationConfirmed: vi.fn(),
    });

    expect(() => controller.register()).not.toThrow();
    expect(controller.ready).toBe(false);
    expect(onUpdateReady).not.toHaveBeenCalled();
  });
});
