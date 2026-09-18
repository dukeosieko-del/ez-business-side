import Image from 'next/image';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-[#0d0d0d] text-white">
      {/* ===== FIXED FULL-PAGE BACKGROUND ===== */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/images/landing-hero.png"
          alt="Kenyan entrepreneurs building their social media business on Janjez"
          fill
          priority
          quality={90}
          className="object-cover object-right"
          sizes="100vw"
        />
        {/* Dark gradient for text readability — strong on left, transparent on right */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/80 to-black/30" />
        {/* Additional bottom gradient for footer readability */}
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black to-transparent" />
      </div>

      {/* ===== CONTENT LAYER ===== */}
      <div className="relative z-10 flex min-h-screen flex-col">

        {/* ===== HEADER ===== */}
        <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/60 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            {/* Logo + brand */}
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-white">Janjez</span>
              <span className="hidden text-xs font-semibold uppercase tracking-widest text-green-500 sm:inline">
                Business Side
              </span>
            </Link>

            {/* Center nav — desktop only */}
            <nav className="hidden items-center gap-8 text-sm md:flex">
              <Link href="#categories" className="text-white/80 transition hover:text-white">
                Categories
              </Link>
              <Link href="#how-it-works" className="text-white/80 transition hover:text-white">
                How It Works
              </Link>
              <Link href="#pricing" className="text-white/80 transition hover:text-white">
                Pricing
              </Link>
              <Link href="#faq" className="text-white/80 transition hover:text-white">
                FAQ
              </Link>
              <a
                href="https://janjez.social"
                className="text-white/80 transition hover:text-white"
              >
                Main Site
              </a>
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-3">
              <Link
                href="/auth/sign-in"
                className="hidden text-sm text-white/80 transition hover:text-white sm:inline"
              >
                Sign In
              </Link>
              <Link
                href="/auth/sign-in"
                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700"
              >
                Get Started
              </Link>
            </div>
          </div>
        </header>

        {/* ===== MAIN CONTENT ===== */}
        <main className="flex-1">

          {/* --- HERO SECTION --- */}
          <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
            <div className="max-w-2xl">
              {/* Pill badge */}
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1">
                <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                <span className="text-xs font-semibold uppercase tracking-wider text-green-400">
                  Janjez Business Side
                </span>
              </div>

              {/* Headline */}
              <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                Build Your Social Media Business on Kenya&apos;s #1 SMM Infrastructure
              </h1>

              {/* Subheadline */}
              <p className="mb-10 text-lg leading-relaxed text-white/80 sm:text-xl">
                Resell, white-label, or refer — powered by Janjez. Instant delivery, M-Pesa payments, and full backend infrastructure ready to go.
              </p>

              {/* CTA row */}
              <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                <Link
                  href="/auth/sign-in"
                  className="rounded-lg bg-green-600 px-8 py-4 text-center font-semibold text-white shadow-lg shadow-green-900/40 transition hover:bg-green-700"
                >
                  Continue with Janjez
                </Link>
                <a
                  href="#categories"
                  className="rounded-lg border border-white/30 px-8 py-4 text-center font-semibold text-white transition hover:border-white/60 hover:bg-white/5"
                >
                  Explore Categories
                </a>
              </div>
            </div>
          </section>

          {/* --- CATEGORIES SECTION --- */}
          <section id="categories" className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
                Choose Your Path
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-white/70">
                Three ways to earn with Janjez — pick the one that matches your business.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {/* Reseller */}
              <div className="rounded-2xl border border-white/10 bg-black/50 p-6 backdrop-blur-md transition hover:border-green-500/50 lg:p-8">
                <div className="mb-3 text-xs font-bold uppercase tracking-widest text-green-500">
                  Category 01
                </div>
                <h3 className="mb-4 text-2xl font-bold text-white">Reseller</h3>
                <p className="mb-6 leading-relaxed text-white/70">
                  Buy social media services at wholesale prices. Set your own markups. Serve your own customers. Full margin control.
                </p>
                <ul className="mb-8 space-y-2 text-sm text-white/60">
                  <li>✓ Bulk purchase pricing</li>
                  <li>✓ Your own pricing rules</li>
                  <li>✓ Instant fulfilment</li>
                  <li>✓ No activation fee</li>
                </ul>
                <Link
                  href="/auth/sign-in"
                  className="block w-full rounded-lg border border-green-500/40 bg-green-600/20 py-3 text-center font-semibold text-green-400 transition hover:bg-green-600/40 hover:text-white"
                >
                  Start Reselling
                </Link>
              </div>

              {/* Child Panel — highlighted */}
              <div className="relative rounded-2xl border-2 border-green-500/60 bg-gradient-to-b from-green-900/40 to-black/60 p-6 backdrop-blur-md lg:p-8">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-green-500 px-3 py-1 text-xs font-bold text-black">
                  MOST POPULAR
                </div>
                <div className="mb-3 text-xs font-bold uppercase tracking-widest text-green-500">
                  Category 02
                </div>
                <h3 className="mb-4 text-2xl font-bold text-white">Child Panel</h3>
                <p className="mb-6 leading-relaxed text-white/80">
                  Launch your own white-label SMM panel under your own domain. Full branding, custom pricing, complete autonomy.
                </p>
                <ul className="mb-8 space-y-2 text-sm text-white/70">
                  <li>✓ Your own domain</li>
                  <li>✓ Custom branding &amp; copy</li>
                  <li>✓ Import Janjez services</li>
                  <li>✓ KES 1,499 one-time activation</li>
                </ul>
                <Link
                  href="/auth/sign-in"
                  className="block w-full rounded-lg bg-green-600 py-3 text-center font-semibold text-white shadow-lg shadow-green-900/50 transition hover:bg-green-700"
                >
                  Launch Your Panel
                </Link>
              </div>

              {/* Affiliate */}
              <div className="rounded-2xl border border-white/10 bg-black/50 p-6 backdrop-blur-md transition hover:border-green-500/50 lg:p-8">
                <div className="mb-3 text-xs font-bold uppercase tracking-widest text-green-500">
                  Category 03
                </div>
                <h3 className="mb-4 text-2xl font-bold text-white">Affiliate</h3>
                <p className="mb-6 leading-relaxed text-white/70">
                  Earn 10% commission on every sale you refer. Share your unique link anywhere. Track every conversion.
                </p>
                <ul className="mb-8 space-y-2 text-sm text-white/60">
                  <li>✓ 10% commission per sale</li>
                  <li>✓ Real-time tracking</li>
                  <li>✓ M-Pesa payouts</li>
                  <li>✓ No activation fee</li>
                </ul>
                <Link
                  href="/auth/sign-in"
                  className="block w-full rounded-lg border border-green-500/40 bg-green-600/20 py-3 text-center font-semibold text-green-400 transition hover:bg-green-600/40 hover:text-white"
                >
                  Become an Affiliate
                </Link>
              </div>
            </div>
          </section>

          {/* --- HOW IT WORKS --- */}
          <section id="how-it-works" className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
                Get Started in 5 Steps
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-white/70">
                From sign-up to earning — the entire journey takes minutes, not weeks.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
              {[
                { n: '01', t: 'Create Account', d: 'Sign up free with your Janjez account' },
                { n: '02', t: 'Choose Your Path', d: 'Reseller, Child Panel, or Affiliate' },
                { n: '03', t: 'Set Up Tools', d: 'Import services, set prices, or generate links' },
                { n: '04', t: 'Activate & Grow', d: 'Start earning from your customers' },
                { n: '05', t: 'Get Paid', d: 'M-Pesa payouts to your verified number' },
              ].map((step) => (
                <div
                  key={step.n}
                  className="rounded-xl border border-white/10 bg-black/50 p-6 text-center backdrop-blur-md"
                >
                  <div className="mb-3 text-3xl font-bold text-green-500">{step.n}</div>
                  <div className="mb-2 font-semibold text-white">{step.t}</div>
                  <div className="text-sm leading-relaxed text-white/60">{step.d}</div>
                </div>
              ))}
            </div>
          </section>

          {/* --- TRUST / ASSURANCE --- */}
          <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
            <div className="rounded-2xl border border-white/10 bg-black/50 p-8 backdrop-blur-md lg:p-10">
              <div className="mb-10 text-center">
                <h2 className="mb-3 text-2xl font-bold text-white sm:text-3xl">Built for Trust</h2>
                <p className="text-white/60">
                  Every transaction protected. Every order fulfilled. Every payout secured.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-6 text-center md:grid-cols-4">
                <div>
                  <div className="mb-2 text-3xl">🔒</div>
                  <div className="mb-1 font-semibold text-white">Secure Payments</div>
                  <div className="text-xs text-white/50">M-Pesa native</div>
                </div>
                <div>
                  <div className="mb-2 text-3xl">⚡</div>
                  <div className="mb-1 font-semibold text-white">Instant Delivery</div>
                  <div className="text-xs text-white/50">Automated fulfilment</div>
                </div>
                <div>
                  <div className="mb-2 text-3xl">🛡️</div>
                  <div className="mb-1 font-semibold text-white">24/7 Support</div>
                  <div className="text-xs text-white/50">Always available</div>
                </div>
                <div>
                  <div className="mb-2 text-3xl">📈</div>
                  <div className="mb-1 font-semibold text-white">Proven Scale</div>
                  <div className="text-xs text-white/50">Powered by Janjez</div>
                </div>
              </div>
            </div>
          </section>

          {/* --- FINAL CTA --- */}
          <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
            <div className="rounded-2xl border border-green-500/30 bg-gradient-to-r from-green-900/60 to-black/60 p-8 text-center backdrop-blur-md lg:p-12">
              <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
                Ready to Start Your Social Media Business?
              </h2>
              <p className="mx-auto mb-8 max-w-xl text-lg text-white/80">
                Join hundreds of Kenyan entrepreneurs already earning with Janjez Business Side.
              </p>
              <Link
                href="/auth/sign-in"
                className="inline-block rounded-lg bg-green-600 px-10 py-4 font-semibold text-white shadow-lg shadow-green-900/50 transition hover:bg-green-700"
              >
                Get Started — Free
              </Link>
            </div>
          </section>
        </main>

        {/* ===== FOOTER ===== */}
        <footer className="border-t border-white/10 bg-black/60 backdrop-blur-md">
          <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="mb-10 grid grid-cols-2 gap-8 md:grid-cols-4">
              <div className="col-span-2 md:col-span-1">
                <div className="mb-4 text-lg font-bold text-white">Janjez Business Side</div>
                <p className="text-sm leading-relaxed text-white/60">
                  Kenya&apos;s infrastructure for social media entrepreneurs.
                </p>
              </div>
              <div>
                <div className="mb-4 font-semibold text-white">Product</div>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link href="#categories" className="text-white/60 transition hover:text-white">
                      Categories
                    </Link>
                  </li>
                  <li>
                    <Link href="#how-it-works" className="text-white/60 transition hover:text-white">
                      How It Works
                    </Link>
                  </li>
                  <li>
                    <a href="https://janjez.social" className="text-white/60 transition hover:text-white">
                      Main Site
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <div className="mb-4 font-semibold text-white">Categories</div>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link href="/auth/sign-in" className="text-white/60 transition hover:text-white">
                      Reseller
                    </Link>
                  </li>
                  <li>
                    <Link href="/auth/sign-in" className="text-white/60 transition hover:text-white">
                      Child Panel
                    </Link>
                  </li>
                  <li>
                    <Link href="/auth/sign-in" className="text-white/60 transition hover:text-white">
                      Affiliate
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <div className="mb-4 font-semibold text-white">Account</div>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link href="/auth/sign-in" className="text-white/60 transition hover:text-white">
                      Sign In
                    </Link>
                  </li>
                  <li>
                    <Link href="/dashboard" className="text-white/60 transition hover:text-white">
                      Dashboard
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row">
              <div className="text-sm text-white/40">
                © 2026 Janjez Business Side. All rights reserved.
              </div>
              <div className="text-sm text-white/40">
                Powered by{' '}
                <a href="https://janjez.social" className="text-green-500 hover:underline">
                  Janjez
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
