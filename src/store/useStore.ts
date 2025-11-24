import { create } from 'zustand';

type ScenePhase = 'intro' | 'main' | 'outro';

interface AppState {
  phase: ScenePhase;
  isAudioPlaying: boolean;
  setPhase: (phase: ScenePhase) => void;
  setAudioPlaying: (playing: boolean) => void;
}

export const useStore = create<AppState>((set) => ({
  phase: 'intro',
  isAudioPlaying: false,
  setPhase: (phase) => set({ phase }),
  setAudioPlaying: (playing) => set({ isAudioPlaying: playing }),
}));

