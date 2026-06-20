import { Sparkles } from 'lucide-react';

export default function About() {
  return (
    <div className="container-page py-12">
      <section className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary-700">About Khwaja</p>
          <h1 className="mt-3 text-5xl font-semibold text-store-dark md:text-6xl">Everyday clothing for men and kids.</h1>
          <p className="mt-5 text-base leading-8 text-store-dark/70">
            Khwaja Textiles & readymades brings together practical, good-looking readymade clothing for men and children. Every collection is arranged to make browsing simple, checking availability quick, and ordering personal over WhatsApp.
          </p>
        </div>
        <div className="rounded-md bg-white p-7 shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-100 text-primary-700">
            <Sparkles size={26} />
          </div>
          <h2 className="mt-5 text-3xl font-semibold text-store-dark">Our Promise</h2>
          <p className="mt-3 text-sm leading-7 text-store-dark/70">
            Clear photos, transparent prices, practical support, and quick WhatsApp confirmation. The site stays lightweight by using GitHub-hosted catalogue data and images, so the store owner can update collections without managing a backend.
          </p>
        </div>
      </section>
    </div>
  );
}
