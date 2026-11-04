import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPanelContext } from '@/lib/tenant/context';
import { SignupForm } from '@/components/child-panel/SignupForm';

export default async function ChildSignupPage({ params }: { params: Promise<{ panel: string }> }) {
  const { panel } = await params;
  const context = await getPanelContext({ subdomain: panel });
  if (!context) notFound();
  return <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
    <Link href={`/${panel}`} className="mb-5 text-sm text-blue-700 underline">Back to panel</Link>
    <h1 className="mb-2 text-3xl font-bold text-slate-950">Create your account</h1>
    <p className="mb-6 text-sm text-slate-600">Register on {context.subdomain}.</p>
    <SignupForm panelId={panel} />
    <p className="mt-5 text-sm text-slate-600">Already registered? <Link href={`/${panel}/signin`} className="text-blue-700 underline">Sign in</Link></p>
  </main>;
}