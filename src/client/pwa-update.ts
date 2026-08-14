export type UpdateSW = (reloadPage?: boolean) => Promise<void>;

export type RegisterSW = (options: {
  onNeedRefresh: () => void;
  onRegisterError: (error: unknown) => void;
}) => UpdateSW;

type PwaUpdateControllerOptions = {
  registerSW: RegisterSW;
  isRoutineActive: () => boolean;
  onActivationStarted: () => void;
  onActivationFailed?: () => void;
};

export const createPwaUpdateController = ({
  registerSW,
  isRoutineActive,
  onActivationStarted,
  onActivationFailed,
}: PwaUpdateControllerOptions) => {
  let updateSW: UpdateSW | null = null;
  let updateReady = false;
  let activationStarted = false;

  const activate = async (): Promise<boolean> => {
    if (!updateReady || !updateSW || activationStarted || isRoutineActive()) return false;

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
          if (!isRoutineActive()) void activate();
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
