import { describe, expect, it, vi } from "vitest";
import { createPwaUpdateController, type RegisterSW } from "./pwa-update.ts";

const createHarness = () => {
  let onNeedRefresh = () => {};
  const updateSW = vi.fn<ReturnType<RegisterSW>>();
  updateSW.mockResolvedValue(undefined);
  const registerSW = vi.fn<RegisterSW>((options) => {
    onNeedRefresh = options.onNeedRefresh;
    return updateSW;
  });
  const onActivationStarted = vi.fn();
  const onActivationFailed = vi.fn();
  const controller = createPwaUpdateController({
    registerSW,
    onActivationStarted,
    onActivationFailed,
  });

  return {
    controller,
    get onNeedRefresh() {
      return onNeedRefresh;
    },
    updateSW,
    onActivationStarted,
    onActivationFailed,
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
    expect(harness.updateSW).not.toHaveBeenCalled();
  });

  it("activates ready update automatically when a counter starts", async () => {
    const harness = createHarness();
    harness.controller.register();
    harness.onNeedRefresh();

    await expect(harness.controller.activate()).resolves.toBe(true);

    expect(harness.onActivationStarted).toHaveBeenCalledOnce();
    expect(harness.updateSW).toHaveBeenCalledOnce();
    expect(harness.updateSW).toHaveBeenCalledWith(true);
  });

  it("waits for update readiness when counter starts first", async () => {
    const harness = createHarness();
    harness.controller.register();

    await expect(harness.controller.activate()).resolves.toBe(false);
    expect(harness.updateSW).not.toHaveBeenCalled();

    harness.onNeedRefresh();

    expect(harness.onActivationStarted).toHaveBeenCalledOnce();
    expect(harness.updateSW).toHaveBeenCalledOnce();
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
    const registerSW = vi.fn(() => {
      throw new Error("registration failed");
    });
    const controller = createPwaUpdateController({
      registerSW,
      onActivationStarted: vi.fn(),
    });

    expect(() => controller.register()).not.toThrow();
    expect(controller.ready).toBe(false);
  });
});
