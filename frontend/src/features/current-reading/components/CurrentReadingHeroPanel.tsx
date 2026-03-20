import type { FeaturedCurrentRead } from '../services/currentReadingApi';

type CurrentReadingHeroPanelProps = {
  items: FeaturedCurrentRead[];
  isLoading?: boolean;
  hasError?: boolean;
};

export function CurrentReadingHeroPanel({ items, isLoading = false, hasError = false }: CurrentReadingHeroPanelProps) {
  return (
    <section className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-600 via-indigo-500 to-sky-500 p-6 text-white shadow-sm">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-100">Main page spotlight</p>
        <h2 className="text-2xl font-bold">Top current reads</h2>
        <p className="max-w-3xl text-sm text-indigo-50">
          See which books are being read by the most people right now.
        </p>
      </div>

      {isLoading ? (
        <div className="mt-6 rounded-xl bg-white/10 p-4 text-sm text-indigo-50">Loading featured books…</div>
      ) : null}

      {!isLoading && hasError ? (
        <div className="mt-6 rounded-xl bg-white/10 p-4 text-sm text-indigo-50">
          Featured books are unavailable right now. You can still browse the full current reading feed below.
        </div>
      ) : null}

      {!isLoading && !hasError && items.length === 0 ? (
        <div className="mt-6 rounded-xl bg-white/10 p-4 text-sm text-indigo-50">
          No featured current reads yet. Be the first to share what you are reading.
        </div>
      ) : null}

      {!isLoading && !hasError && items.length > 0 ? (
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {items.map((item) => (
            <article key={item.bookTitle} className="rounded-xl bg-white/15 p-5 backdrop-blur-sm">
              <p className="text-sm font-semibold text-indigo-100">#{item.rank}</p>
              <h3 className="mt-3 text-lg font-semibold text-white">{item.bookTitle}</h3>
              <p className="mt-2 text-sm text-indigo-50">
                {item.readerCount} {item.readerCount === 1 ? 'reader currently' : 'readers currently'}
              </p>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}

