import { WalletBalance } from '@/components/wallet/WalletBalance';
import { TopupForm } from '@/components/wallet/TopupForm';
import { TransactionList } from '@/components/wallet/TransactionList';

export default function WalletPage() {
  return (
    <main style={{ padding: '24px' }}>
      <h1>Wallet</h1>
      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        <WalletBalance />
        <TopupForm />
      </div>
      <TransactionList />
    </main>
  );
}