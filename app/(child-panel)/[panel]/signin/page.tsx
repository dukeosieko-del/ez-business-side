import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPanelContext } from '@/lib/tenant/context';
import { SigninForm } from '@/components/child-panel/SigninForm';

export default async function ChildSigninPage({ params }: { params: Promise<{ panel: string }> }) {
  const { panel } = await params;
  const context = await getPanelContext({ subdomain: panel });
  if (!context) notFound();
  return <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
    <Link href={`/${panel}`} className="mb-5 text-sm text-blue-700 underline">Back to panel</Link>
    <h1 className="mb-2 text-3xl font-bold text-slate-950">Sign in</h1>
    <p className="mb-6 text-sm text-slate-600">Access your account on {context.subdomain}.</p>
    <SigninForm panelId={panel} />
    <p className="mt-5 text-sm text-slate-600">New here? <Link href={`/${panel}/signup`} className="text-blue-700 underline">Create an account</Link></p>
  </main>;
}
