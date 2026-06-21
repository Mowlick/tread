import { create } from 'zustand';

interface OnboardingState {
  hasCompletedOnboarding: boolean;
  hasCompletedAssessment: boolean;
  assessmentData: Record<string, any>;
  completeOnboarding: () => void;
  saveAssessmentData: (data: Record<string, any>) => void;
  completeAssessment: () => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  hasCompletedOnboarding: false,
  hasCompletedAssessment: false,
  assessmentData: {},
  completeOnboarding: () => set({ hasCompletedOnboarding: true }),
  saveAssessmentData: (data) => set((state) => ({ assessmentData: { ...state.assessmentData, ...data } })),
  completeAssessment: () => set({ hasCompletedAssessment: true }),
}));
