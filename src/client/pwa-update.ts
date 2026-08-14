export type UpdateSW = (reloadPage?: boolean) => Promise<void>;

export type RegisterSW = (options: {
  onNeedRefresh: () => void;
  onRegisterError: (error: unknown) => void;
}) => UpdateSW;

type PwaUpdateControllerOptions = {
  registerSW: RegisterSW;
  isRoutineActive: () => boolean;
  confirmLeave: () => boolean;
  onUpdateReady: () => void;
  onActivationConfirmed: () => void;
  onActivationFailed?: () => void;
};

export const createPwaUpdateController = ({
  registerSW,
  isRoutineActive,
  confirmLeave,
  onUpdateReady,
  onActivationConfirmed,
  onActivationFailed,
}: PwaUpdateControllerOptions) => {
  let updateSW: UpdateSW | null = null;
  let updateReady = false;
  let activationStarted = false;

  const register = () => {
    try {
      updateSW = registerSW({
        onNeedRefresh: () => {
          updateReady = true;
          onUpdateReady();
        },
        onRegisterError: () => {},
      });
    } catch {
      // Service-worker support is an enhancement. Timer behavior stays independent.
    }
  };

  const activate = async (): Promise<boolean> => {
    if (!updateReady || !updateSW || activationStarted) return false;

    const routineActive = isRoutineActive();
    if (routineActive && !confirmLeave()) return false;

    activationStarted = true;

    try {
      if (routineActive) onActivationConfirmed();
      await updateSW(true);
      return true;
    } catch {
      activationStarted = false;
      onActivationFailed?.();
      return false;
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
