import { completionCueSchedule, type CompletionCueSchedule } from "../domain/cue.ts";

type AudioContextConstructor = new () => AudioContext;
type AudioSession = { type: string };
type BrowserNavigator = Navigator & { audioSession?: AudioSession };
type BrowserWindow = Window & {
  AudioContext?: AudioContextConstructor;
  webkitAudioContext?: AudioContextConstructor;
};

type ScheduledCue = {
  oscillator: OscillatorNode;
  gain: GainNode;
};

const getAudioContext = (): AudioContext | null => {
  if (typeof window === "undefined") return null;

  const browserWindow = window as BrowserWindow;
  const Context = browserWindow.AudioContext ?? browserWindow.webkitAudioContext;
  if (!Context) return null;

  try {
    return new Context();
  } catch {
    return null;
  }
};

const setAudioSessionType = (type: "auto" | "transient") => {
  if (typeof navigator === "undefined") return;

  try {
    const audioSession = (navigator as BrowserNavigator).audioSession;
    if (audioSession) audioSession.type = type;
  } catch {
    // Audio session is progressive enhancement. Unsupported or rejected writes are harmless.
  }
};

const disconnect = (node: AudioNode) => {
  try {
    node.disconnect();
  } catch {
    // The node may already have ended or been disconnected by the browser.
  }
};

const stop = (node: OscillatorNode) => {
  try {
    node.stop();
  } catch {
    // An ended oscillator cannot be stopped twice.
  }
};

const verifyUnlock = (context: AudioContext) => {
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  try {
    gain.gain.value = 0;
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.01);
  } catch (error) {
    stop(oscillator);
    disconnect(oscillator);
    disconnect(gain);
    throw error;
  }
};

const scheduleTone = (context: AudioContext, schedule: CompletionCueSchedule): ScheduledCue => {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const cue = { oscillator, gain };

  try {
    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(880, schedule.at);
    oscillator.frequency.exponentialRampToValueAtTime(440, schedule.stopAt);

    gain.gain.setValueAtTime(0.001, schedule.at);
    gain.gain.linearRampToValueAtTime(0.28, schedule.at + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, schedule.stopAt);

    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(schedule.at);
    oscillator.stop(schedule.stopAt);
    return cue;
  } catch (error) {
    stop(oscillator);
    disconnect(oscillator);
    disconnect(gain);
    throw error;
  }
};

export const createCompletionSound = () => {
  let context: AudioContext | null = null;
  let scheduled: ScheduledCue | null = null;
  let requestVersion = 0;

  const cancelScheduled = () => {
    const cue = scheduled;
    scheduled = null;
    if (!cue) return;

    stop(cue.oscillator);
    disconnect(cue.oscillator);
    disconnect(cue.gain);
  };

  const cancel = () => {
    requestVersion += 1;
    cancelScheduled();
    setAudioSessionType("auto");
  };

  const start = async (remainingMs: number): Promise<boolean> => {
    cancel();
    if (!Number.isFinite(remainingMs) || remainingMs <= 0) return false;

    const version = requestVersion;
    context ??= getAudioContext();
    if (!context) return false;

    setAudioSessionType("transient");

    try {
      await context.resume();
      if (version !== requestVersion || context.state !== "running") {
        if (version === requestVersion) setAudioSessionType("auto");
        return false;
      }

      verifyUnlock(context);
      if (version !== requestVersion) return false;

      const schedule = completionCueSchedule(context.currentTime, remainingMs);
      if (schedule.at <= context.currentTime) {
        setAudioSessionType("auto");
        return true;
      }

      const cue = scheduleTone(context, schedule);
      cue.oscillator.addEventListener("ended", () => {
        if (scheduled !== cue) return;
        scheduled = null;
        disconnect(cue.oscillator);
        disconnect(cue.gain);
        setAudioSessionType("auto");
      });
      scheduled = cue;
      return true;
    } catch {
      if (version === requestVersion) setAudioSessionType("auto");
      return false;
    }
  };

  const resume = async (remainingMs: number): Promise<boolean> => {
    if (context?.state === "running" && scheduled) return true;
    return start(remainingMs);
  };

  const complete = () => {
    requestVersion += 1;
    setAudioSessionType("auto");
  };

  return { start, resume, cancel, complete };
};
