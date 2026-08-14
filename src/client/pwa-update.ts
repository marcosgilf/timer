export type UpdateSW = (reloadPage?: boolean) => Promise<void>;

export type RegisterSW = (options: {
  onNeedRefresh: () => void;
  onRegisterError: (error: unknown) => void;
}) => UpdateSW;

type PwaUpdateControllerOptions = {
  registerSW: RegisterSW;
  onActivationStarted: () => void;
  onActivationFailed?: () => void;
};

export const createPwaUpdateController = ({
  registerSW,
  onActivationStarted,
  onActivationFailed,
}: PwaUpdateControllerOptions) => {
  let updateSW: UpdateSW | null = null;
  let updateReady = false;
  let activationRequested = false;
  let activationStarted = false;

  const activate = async (): Promise<boolean> => {
    activationRequested = true;
    if (!updateReady || !updateSW || activationStarted) return false;

    activationStarted = true;

    try {
      onActivationStarted();
      await updateSW(true);
      return true;
    } catch {
      activationStarted = false;
      onActivationFailed?.();
      return false;
    }
  };

  const register = () => {
    try {
      updateSW = registerSW({
        onNeedRefresh: () => {
          updateReady = true;
          if (activationRequested) void activate();
        },
        onRegisterError: () => {},
      });
    } catch {
      // Service-worker support is an enhancement. Timer behavior stays independent.
    }
  };

  return {
    register,
    activate,
    get ready() {
      return updateReady;
    },
  };
};
