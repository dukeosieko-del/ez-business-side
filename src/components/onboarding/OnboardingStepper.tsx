'use client';

const steps = ['Account Created', 'Payment', 'Activation Complete'];

interface OnboardingStepperProps {
  currentStep: number;
}

export function OnboardingStepper({ currentStep }: OnboardingStepperProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      {steps.map((step, index) => (
        <div key={step} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: index <= currentStep ? '#4CAF50' : '#e0e0e0',
              color: index <= currentStep ? '#fff' : '#666',
              fontWeight: 'bold',
            }}
          >
            {index + 1}
          </div>
          <span style={{ color: index <= currentStep ? '#333' : '#999', fontWeight: index === currentStep ? 'bold' : 'normal' }}>
            {step}
          </span>
          {index < steps.length - 1 && (
            <div style={{ width: '40px', height: '2px', backgroundColor: index < currentStep ? '#4CAF50' : '#e0e0e0' }} />
          )}
        </div>
      ))}
    </div>
  );
}
