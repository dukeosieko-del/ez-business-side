export type OnboardingState = 'pending' | 'onboarding' | 'active' | 'suspended';

export type OnboardingAction =
  | { type: 'START_ONBOARDING' }
  | { type: 'COMPLETE_ONBOARDING' }
  | { type: 'SUSPEND' }
  | { type: 'REACTIVATE' };

const TRANSITIONS: Record<OnboardingState, OnboardingAction['type'][]> = {
  pending: ['START_ONBOARDING'],
  onboarding: ['COMPLETE_ONBOARDING', 'SUSPEND'],
  active: ['SUSPEND'],
  suspended: ['REACTIVATE'],
};

export function canTransition(
  current: OnboardingState,
  action: OnboardingAction['type']
): boolean {
  return (TRANSITIONS[current] ?? []).includes(action);
}

export function transition(
  current: OnboardingState,
  action: OnboardingAction
): { state: OnboardingState; changed: boolean } {
  if (!canTransition(current, action.type)) {
    return { state: current, changed: false };
  }

  const next: Record<OnboardingState, OnboardingState> = {
    pending: 'onboarding',
    onboarding: 'active',
    active: 'suspended',
    suspended: 'pending',
  };

  return { state: next[current], changed: true };
}

export function isOnboarded(state: OnboardingState): boolean {
  return state === 'active';
}
