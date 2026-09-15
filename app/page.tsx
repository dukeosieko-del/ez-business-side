import Link from 'next/link';

const categoryLinks = [
  { label: 'Product', href: '#product' },
  { label: 'Categories', href: '#categories' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Main Site', href: 'https://janjez.social' },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#06130d] text-white">
      <section className="relative min-h-screen overflow-hidden bg-[#06130d]" aria-labelledby="hero-heading">
        <img
          src="/images/landing-hero.png"
          alt="Kenyan entrepreneurs working together in a Nairobi office"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#020806]/95 via-[#020806]/65 to-[#020806]/10" />
        <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-[#020806] via-[#020806]/95 to-transparent px-6 pb-8 pt-36 sm:px-10 sm:pb-12 sm:pt-44 lg:px-16">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-7">
            <div className="max-w-3xl">
              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.28em] text-emerald-300">
                Janjez Business Side
              </p>
              <h1 id="hero-heading" className="text-4xl font-bold leading-tight tracking-tight text-balance sm:text-5xl lg:text-6xl">
                Ready to Start Your Social Media Business?
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-emerald-50/80 sm:text-lg">
                Join hundreds of Kenyan entrepreneurs already earning with Janjez Business Side.
              </p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <Link
                href="/auth/sign-in"
                className="inline-flex w-fit items-center justify-center rounded-xl bg-emerald-400 px-7 py-4 text-base font-bold text-[#03140c] shadow-lg shadow-emerald-950/40 transition hover:bg-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#020806]"
              >
                Get Started — Free
              </Link>
              <nav aria-label="Landing page categories" className="flex flex-wrap gap-2">
                {categoryLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur-sm transition hover:border-emerald-300/70 hover:bg-emerald-400/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
            </div>
            <p className="text-sm text-white/55">Kenya&apos;s infrastructure for social media entrepreneurs.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
