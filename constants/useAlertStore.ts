import { create } from 'zustand'; 

export interface AlertState {
  hasNewAlert: boolean;
  setHasNewAlert: (value: boolean) => void;
}

// 1. Notice the extra () after <AlertState>
// 2. We no longer type 'set' manually; TS now knows what it is.
export const useAlertStore = create<AlertState>()((set) => ({
  hasNewAlert: false,
  setHasNewAlert: (value) => set({ hasNewAlert: value }),
}));