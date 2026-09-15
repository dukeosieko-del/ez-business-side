import Image from 'next/image';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-[#0d0d0d]">
      <div className="fixed inset-0 z-0">
        <Image
          src="/images/landing-hero.png"
          alt="Kenyan entrepreneurs growing their social media business with Janjez"
          fill
          priority
          quality={90}
          className="object-cover object-right"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/95 via-black/75 to-black/40" />
      </div>

      <div className="absolute inset-x-0 bottom-0 z-20">
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent h-40" />
        <div className="relative max-w-7xl mx-auto px-6 pb-8 pt-12">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
            <div className="max-w-xl">
              <h2 className="text-2xl md:text-4xl font-bold text-white mb-3 drop-shadow">
                Ready to Start Your Social Media Business?
              </h2>
              <p className="text-white/85 text-base md:text-lg drop-shadow">
                Join hundreds of Kenyan entrepreneurs already earning with Janjez Business Side.
              </p>
            </div>
            <Link
              href="/auth/sign-in"
              className="shrink-0 inline-flex items-center justify-center bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-full font-bold text-lg shadow-xl shadow-green-900/60 transition transform hover:scale-105"
            >
              Get Started — Free
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-6">
            <Link href="#categories" className="px-4 py-2 rounded-full border border-white/25 bg-black/30 backdrop-blur-sm text-white/90 text-sm font-medium hover:border-green-500/60 hover:bg-green-500/10 hover:text-white transition">Categories</Link>
            <Link href="#how-it-works" className="px-4 py-2 rounded-full border border-white/25 bg-black/30 backdrop-blur-sm text-white/90 text-sm font-medium hover:border-green-500/60 hover:bg-green-500/10 hover:text-white transition">How It Works</Link>
            <Link href="#product" className="px-4 py-2 rounded-full border border-white/25 bg-black/30 backdrop-blur-sm text-white/90 text-sm font-medium hover:border-green-500/60 hover:bg-green-500/10 hover:text-white transition">Product</Link>
            <a href="https://janjez.social" className="px-4 py-2 rounded-full border border-white/25 bg-black/30 backdrop-blur-sm text-white/90 text-sm font-medium hover:border-green-500/60 hover:bg-green-500/10 hover:text-white transition">Main Site</a>
          </div>
        </div>
      </div>

      <div className="relative z-10">
        <header className="sticky top-0 z-50 backdrop-blur-md bg-black/60 border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-bold text-white">Janjez</span>
              <span className="hidden sm:inline text-xs font-semibold text-green-500 uppercase tracking-wider">
                Business Side
              </span>
            </Link>
            <nav className="hidden md:flex items-center gap-8 text-sm">
              <Link href="#categories" className="text-white/80 hover:text-white transition">Categories</Link>
              <Link href="#how-it-works" className="text-white/80 hover:text-white transition">How It Works</Link>
              <Link href="#pricing" className="text-white/80 hover:text-white transition">Pricing</Link>
              <Link href="#faq" className="text-white/80 hover:text-white transition">FAQ</Link>
              <a href="https://janjez.social" className="text-white/80 hover:text-white transition">Main Site</a>
            </nav>
            <div className="flex items-center gap-3">
              <Link href="/auth/sign-in" className="text-sm text-white/80 hover:text-white transition hidden sm:inline">Sign In</Link>
              <Link href="/auth/sign-in" className="text-sm bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition">Get Started</Link>
            </div>
          </div>
        </header>

        <section className="max-w-7xl mx-auto px-6 py-20 lg:py-32">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-full px-3 py-1 mb-6">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-semibold text-green-400 uppercase tracking-wider">Janjez Business Side</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-6">
              Build Your Social Media Business on Kenya&apos;s #1 SMM Infrastructure
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-10 leading-relaxed">
              Resell, white-label, or refer — powered by Janjez. Instant delivery, M-Pesa payments, and full backend infrastructure ready to go.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/auth/sign-in" className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-semibold text-center transition shadow-lg shadow-green-900/40">Continue with Janjez</Link>
              <a href="#categories" className="border border-white/30 hover:border-white/60 hover:bg-white/5 text-white px-8 py-4 rounded-lg font-semibold text-center transition">Explore Categories</a>
            </div>
          </div>
        </section>
        <section id="product" className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Our Product</h2>
            <p className="text-white/70 text-lg max-w-2xl mx-auto">Everything you need to run a social media business in one place — reseller, child panel, and affiliate under one roof.</p>
          </div>
        </section>
        <section id="categories" className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Choose Your Path</h2>
            <p className="text-white/70 text-lg max-w-2xl mx-auto">Three ways to earn with Janjez — pick the one that matches your business.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="group bg-black/50 backdrop-blur-md border border-white/10 hover:border-green-500/50 rounded-2xl p-8 transition">
              <div className="text-green-500 font-bold text-xs uppercase tracking-widest mb-3">Category 01</div>
              <h3 className="text-2xl font-bold text-white mb-4">Reseller</h3>
              <p className="text-white/70 mb-6 leading-relaxed">Buy social media services at wholesale prices. Set your own markups. Serve your own customers. Full margin control.</p>
              <ul className="space-y-2 text-sm text-white/60 mb-8">
                <li>✓ Bulk purchase pricing</li>
                <li>✓ Your own pricing rules</li>
                <li>✓ Instant fulfilment</li>
                <li>✓ No activation fee</li>
              </ul>
              <Link href="/auth/sign-in" className="inline-block w-full text-center bg-green-600/20 hover:bg-green-600/40 border border-green-500/40 text-green-400 hover:text-white py-3 rounded-lg font-semibold transition">Start Reselling</Link>
            </div>
            <div className="group relative bg-gradient-to-b from-green-900/40 to-black/60 backdrop-blur-md border-2 border-green-500/60 rounded-2xl p-8 transition">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-black text-xs font-bold px-3 py-1 rounded-full">MOST POPULAR</div>
              <div className="text-green-500 font-bold text-xs uppercase tracking-widest mb-3">Category 02</div>
              <h3 className="text-2xl font-bold text-white mb-4">Child Panel</h3>
              <p className="text-white/80 mb-6 leading-relaxed">Launch your own white-label SMM panel under your own domain. Full branding, custom pricing, complete autonomy.</p>
              <ul className="space-y-2 text-sm text-white/70 mb-8">
                <li>✓ Your own domain</li>
                <li>✓ Custom branding &amp; copy</li>
                <li>✓ Import Janjez services</li>
                <li>✓ KES 1,499 one-time activation</li>
              </ul>
              <Link href="/auth/sign-in" className="inline-block w-full text-center bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition shadow-lg shadow-green-900/50">Launch Your Panel</Link>
            </div>
            <div className="group bg-black/50 backdrop-blur-md border border-white/10 hover:border-green-500/50 rounded-2xl p-8 transition">
              <div className="text-green-500 font-bold text-xs uppercase tracking-widest mb-3">Category 03</div>
              <h3 className="text-2xl font-bold text-white mb-4">Affiliate</h3>
              <p className="text-white/70 mb-6 leading-relaxed">Earn 10% commission on every sale you refer. Share your unique link anywhere. Track every conversion.</p>
              <ul className="space-y-2 text-sm text-white/60 mb-8">
                <li>✓ 10% commission per sale</li>
                <li>✓ Real-time tracking</li>
                <li>✓ M-Pesa payouts</li>
                <li>✓ No activation fee</li>
              </ul>
              <Link href="/auth/sign-in" className="inline-block w-full text-center bg-green-600/20 hover:bg-green-600/40 border border-green-500/40 text-green-400 hover:text-white py-3 rounded-lg font-semibold transition">Become an Affiliate</Link>
            </div>
          </div>
        </section>
        <section id="how-it-works" className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Get Started in 5 Steps</h2>
            <p className="text-white/70 text-lg max-w-2xl mx-auto">From sign-up to earning — the entire journey takes minutes, not weeks.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="bg-black/50 backdrop-blur-md border border-white/10 rounded-xl p-6 text-center">
              <div className="text-green-500 font-bold text-3xl mb-3">01</div>
              <div className="text-white font-semibold mb-2">Create Account</div>
              <div className="text-white/60 text-sm leading-relaxed">Sign up free with your Janjez account</div>
            </div>
            <div className="bg-black/50 backdrop-blur-md border border-white/10 rounded-xl p-6 text-center">
              <div className="text-green-500 font-bold text-3xl mb-3">02</div>
              <div className="text-white font-semibold mb-2">Choose Your Path</div>
              <div className="text-white/60 text-sm leading-relaxed">Reseller, Child Panel, or Affiliate</div>
            </div>
            <div className="bg-black/50 backdrop-blur-md border border-white/10 rounded-xl p-6 text-center">
              <div className="text-green-500 font-bold text-3xl mb-3">03</div>
              <div className="text-white font-semibold mb-2">Set Up Tools</div>
              <div className="text-white/60 text-sm leading-relaxed">Import services, set prices, or generate links</div>
            </div>
            <div className="bg-black/50 backdrop-blur-md border border-white/10 rounded-xl p-6 text-center">
              <div className="text-green-500 font-bold text-3xl mb-3">04</div>
              <div className="text-white font-semibold mb-2">Activate &amp; Grow</div>
              <div className="text-white/60 text-sm leading-relaxed">Start earning from your customers</div>
            </div>
            <div className="bg-black/50 backdrop-blur-md border border-white/10 rounded-xl p-6 text-center">
              <div className="text-green-500 font-bold text-3xl mb-3">05</div>
              <div className="text-white font-semibold mb-2">Get Paid</div>
              <div className="text-white/60 text-sm leading-relaxed">M-Pesa payouts to your verified number</div>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="bg-black/50 backdrop-blur-md border border-white/10 rounded-2xl p-10">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Built for Trust</h2>
              <p className="text-white/60">Every transaction protected. Every order fulfilled. Every payout secured.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div><div className="text-3xl mb-2">🔒</div><div className="text-white font-semibold mb-1">Secure Payments</div><div className="text-white/50 text-xs">M-Pesa native</div></div>
              <div><div className="text-3xl mb-2">⚡</div><div className="text-white font-semibold mb-1">Instant Delivery</div><div className="text-white/50 text-xs">Automated fulfilment</div></div>
              <div><div className="text-3xl mb-2">🛡️</div><div className="text-white font-semibold mb-1">24/7 Support</div><div className="text-white/50 text-xs">Always available</div></div>
              <div><div className="text-3xl mb-2">📈</div><div className="text-white font-semibold mb-1">Proven Scale</div><div className="text-white/50 text-xs">Powered by Janjez</div></div>
            </div>
          </div>
        </section>

        <footer className="border-t border-white/10 mt-20">
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
              <div><div className="text-white font-bold mb-4">Janjez Business Side</div><p className="text-white/60 text-sm leading-relaxed">Kenya&apos;s infrastructure for social media entrepreneurs.</p></div>
              <div>
                <div className="text-white font-semibold mb-4">Product</div>
                <div className="flex flex-wrap gap-2">
                  <Link href="#categories" className="px-4 py-2 rounded-full border border-white/20 bg-black/40 text-white/80 text-sm font-medium hover:border-green-500/60 hover:bg-green-500/10 hover:text-white transition">Categories</Link>
                  <Link href="#how-it-works" className="px-4 py-2 rounded-full border border-white/20 bg-black/40 text-white/80 text-sm font-medium hover:border-green-500/60 hover:bg-green-500/10 hover:text-white transition">How It Works</Link>
                  <a href="https://janjez.social" className="px-4 py-2 rounded-full border border-white/20 bg-black/40 text-white/80 text-sm font-medium hover:border-green-500/60 hover:bg-green-500/10 hover:text-white transition">Main Site</a>
                </div>
              </div>
              <div>
                <div className="text-white font-semibold mb-4">Categories</div>
                <div className="flex flex-wrap gap-2">
                  <Link href="/auth/sign-in" className="px-4 py-2 rounded-full border border-white/20 bg-black/40 text-white/80 text-sm font-medium hover:border-green-500/60 hover:bg-green-500/10 hover:text-white transition">Reseller</Link>
                  <Link href="/auth/sign-in" className="px-4 py-2 rounded-full border border-white/20 bg-black/40 text-white/80 text-sm font-medium hover:border-green-500/60 hover:bg-green-500/10 hover:text-white transition">Child Panel</Link>
                  <Link href="/auth/sign-in" className="px-4 py-2 rounded-full border border-white/20 bg-black/40 text-white/80 text-sm font-medium hover:border-green-500/60 hover:bg-green-500/10 hover:text-white transition">Affiliate</Link>
                </div>
              </div>
              <div>
                <div className="text-white font-semibold mb-4">Account</div>
                <div className="flex flex-wrap gap-2">
                  <Link href="/auth/sign-in" className="px-4 py-2 rounded-full border border-white/20 bg-black/40 text-white/80 text-sm font-medium hover:border-green-500/60 hover:bg-green-500/10 hover:text-white transition">Sign In</Link>
                  <Link href="/dashboard" className="px-4 py-2 rounded-full border border-white/20 bg-black/40 text-white/80 text-sm font-medium hover:border-green-500/60 hover:bg-green-500/10 hover:text-white transition">Dashboard</Link>
                </div>
              </div>
            </div>
            <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-white/40 text-sm">© 2026 Janjez Business Side. All rights reserved.</div>
              <div className="text-white/40 text-sm">Powered by <a href="https://janjez.social" className="text-green-500 hover:underline">Janjez</a></div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
