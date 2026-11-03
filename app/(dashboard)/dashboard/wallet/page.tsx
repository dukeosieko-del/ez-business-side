import { WalletBalance } from '@/components/wallet/WalletBalance';
import { TopupForm } from '@/components/wallet/TopupForm';
import { TransactionList } from '@/components/wallet/TransactionList';
import { WithdrawalRequest } from '@/components/wallet/WithdrawalRequest';

export default function WalletPage() {
  return <main className="space-y-6">
    <h1 className="text-2xl font-bold text-gray-900">Wallet</h1>
    <div className="flex flex-wrap gap-4"><WalletBalance /><TopupForm /></div>
    <section className="rounded-lg border border-gray-200 bg-white p-4"><h2 className="mb-3 font-semibold text-gray-900">Request withdrawal</h2><WithdrawalRequest /></section>
    <TransactionList />
  </main>;
}
