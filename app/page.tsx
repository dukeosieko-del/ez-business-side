import Image from 'next/image';
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0d0d0d]">
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/landing-hero.png"
          alt="Kenyan entrepreneurs building their social media business on Janjez"
          fill
          priority
          quality={90}
          className="object-cover object-right"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16 lg:py-24">
        <div className="flex items-center gap-3 mb-12">
          <span className="text-sm font-semibold text-green-500 uppercase tracking-wider">
            Janjez Business Side
          </span>
        </div>

        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-6">
            Build Your Social Media Business with Kenya&apos;s #1 SMM Infrastructure
          </h1>
          <p className="text-lg md:text-xl text-white/80 mb-8">
            Resell, white-label, or refer — powered by Janjez. Instant delivery,
            M-Pesa payments, and full backend infrastructure ready to go.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mb-16">
            <Link
              href="/auth/sign-in"
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-semibold text-center transition"
            >
              Continue with Janjez
            </Link>
            <a
              href="#categories"
              className="border border-white/30 hover:border-white/60 text-white px-8 py-4 rounded-lg font-semibold text-center transition"
            >
              Explore Categories
            </a>
          </div>
        </div>

        <section id="categories" className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <div className="text-green-500 font-bold text-sm uppercase tracking-wider mb-2">
              Reseller
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Buy Bulk, Sell Smart</h3>
            <p className="text-white/70 text-sm">
              Acquire services at wholesale prices. Set your own markups. Serve your own customers.
            </p>
          </div>

          <div className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <div className="text-green-500 font-bold text-sm uppercase tracking-wider mb-2">
              Child Panel
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Your Own White-Label Panel</h3>
            <p className="text-white/70 text-sm">
              Launch your branded SMM panel under your own domain. KES 1,499 one-time activation.
            </p>
          </div>

          <div className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <div className="text-green-500 font-bold text-sm uppercase tracking-wider mb-2">
              Affiliate
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Earn 10% Per Sale</h3>
            <p className="text-white/70 text-sm">
              Share your unique link. Earn commission on every order. Payouts to your M-Pesa.
            </p>
          </div>
        </section>

        <section className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl p-8 mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">
            Get Started in 5 Simple Steps
          </h2>
          <ol className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {[
              { n: '01', t: 'Create Account', d: 'Sign up free with your Janjez account' },
              { n: '02', t: 'Choose Your Path', d: 'Reseller, Child Panel, or Affiliate' },
              { n: '03', t: 'Set Up Tools', d: 'Import services, set prices, or generate links' },
              { n: '04', t: 'Activate & Grow', d: 'Start earning from your customers' },
              { n: '05', t: 'Get Paid', d: 'M-Pesa payouts to your verified number' },
            ].map((step) => (
              <li key={step.n} className="space-y-2">
                <div className="text-green-500 font-bold text-2xl">{step.n}</div>
                <div className="text-white font-semibold">{step.t}</div>
                <div className="text-white/60 text-sm">{step.d}</div>
              </li>
            ))}
          </ol>
        </section>

        <section className="flex flex-wrap justify-center gap-6 text-sm text-white/60 mb-16">
          <span>🔒 Secure M-Pesa Payments</span>
          <span>⚡ Instant Service Delivery</span>
          <span>🛡️ 24/7 Support</span>
          <span>📈 Trusted by Kenyan Creators</span>
        </section>

        <footer className="text-center text-white/40 text-sm">
          Powered by{' '}
          <a href="https://janjez.social" className="text-green-500 hover:underline">
            Janjez
          </a>{' '}
          — Kenya&apos;s #1 SMM Panel
        </footer>
      </div>
    </main>
  );
}