'use client';

import { ActivationButton } from './ActivationButton';

interface ActivationModalProps {
  partnerId: string;
}

export function ActivationModal({ partnerId }: ActivationModalProps) {
  return (
    <div style={{ border: '1px solid #ccc', padding: '16px', borderRadius: '8px' }}>
      <h2>Complete Activation</h2>
      <p>
        To activate your account, you will need to pay KES 1,499 via M-Pesa.
        This one-time payment activates your partner account and unlocks all features.
      </p>
      <p><strong>Instructions:</strong></p>
      <ol>
        <li>Click the &quot;Activate with M-Pesa&quot; button below</li>
        <li>You will receive an M-Pesa prompt on your phone</li>
        <li>Confirm the payment of KES 1,499</li>
        <li>Your account will be activated immediately</li>
      </ol>
      <ActivationButton partnerId={partnerId} />
    </div>
  );
}