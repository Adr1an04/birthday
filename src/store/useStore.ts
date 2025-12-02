import { create } from 'zustand';

type ScenePhase = 'intro' | 'main' | 'outro';

export interface InspectionTarget {
  position: [number, number, number];
  title: string;
  text: string;
  image: string;
}

interface AppState {
  phase: ScenePhase;
  isAudioPlaying: boolean;
  isBirthdayView: boolean;
  inspectionTarget: InspectionTarget | null;
  cinematicAnimationCompleted: boolean;
  birthdayAnimationCompleted: boolean;
  isSandboxFocused: boolean;
  isCandleLit: boolean;
  setPhase: (phase: ScenePhase) => void;
  setAudioPlaying: (playing: boolean) => void;
  setBirthdayView: (view: boolean) => void;
  setInspectionTarget: (target: InspectionTarget | null) => void;
  setCinematicAnimationCompleted: (completed: boolean) => void;
  setBirthdayAnimationCompleted: (completed: boolean) => void;
  setSandboxFocused: (focused: boolean) => void;
  setCandleLit: (lit: boolean) => void;
}

export const useStore = create<AppState>((set) => ({
  phase: 'intro',
  isAudioPlaying: false,
  isBirthdayView: false,
  inspectionTarget: null,
  cinematicAnimationCompleted: false,
  birthdayAnimationCompleted: false,
  isSandboxFocused: false,
  isCandleLit: false,
  setPhase: (phase) => set({ phase }),
  setAudioPlaying: (playing) => set({ isAudioPlaying: playing }),
  setBirthdayView: (view) => set({ isBirthdayView: view }),
  setInspectionTarget: (target) => set({ inspectionTarget: target }),
  setCinematicAnimationCompleted: (completed) => set({ cinematicAnimationCompleted: completed }),
  setBirthdayAnimationCompleted: (completed) => set({ birthdayAnimationCompleted: completed }),
  setSandboxFocused: (focused) => set({ isSandboxFocused: focused }),
  setCandleLit: (lit) => set({ isCandleLit: lit }),
}));
