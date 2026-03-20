import type { FeaturedCurrentRead } from '../services/currentReadingApi';

type CurrentReadingHeroPanelProps = {
  items: FeaturedCurrentRead[];
  isLoading?: boolean;
  hasError?: boolean;
};

export function CurrentReadingHeroPanel({ items, isLoading = false, hasError = false }: CurrentReadingHeroPanelProps) {
  return (
    <section className="panel-surface relative overflow-hidden p-6 sm:p-8 lg:p-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.95),rgba(255,255,255,0.65)_28%,rgba(191,219,254,0.32)_62%,rgba(224,231,255,0.14)_100%)]" />
      <div className="pointer-events-none absolute -right-16 top-0 h-56 w-56 rounded-full bg-sky-200/50 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-12 h-40 w-40 rounded-full bg-indigo-200/40 blur-3xl" />

      <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(300px,0.95fr)] lg:items-start">
        <div className="space-y-4">
          <p className="section-kicker">Main page spotlight</p>
          <div className="space-y-3">
            <h2 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Top current reads</h2>
            <p className="max-w-2xl text-base leading-7 text-slate-600">
              See which books are being read by the most people right now.
            </p>
          </div>

          <div className="inline-flex rounded-full border border-white/80 bg-white/70 px-4 py-2 text-sm font-medium text-slate-600 shadow-soft backdrop-blur-xl">
            Updated from the live team reading feed
          </div>
        </div>

        {isLoading ? (
          <div className="glass-surface p-6 text-sm leading-6 text-slate-600">Loading featured books…</div>
        ) : null}

        {!isLoading && hasError ? (
          <div className="glass-surface p-6 text-sm leading-6 text-slate-600">
            Featured books are unavailable right now. You can still browse the full current reading feed below.
          </div>
        ) : null}

        {!isLoading && !hasError && items.length === 0 ? (
          <div className="glass-surface p-6 text-sm leading-6 text-slate-600">
            No featured current reads yet. Be the first to share what you are reading.
          </div>
        ) : null}

        {!isLoading && !hasError && items.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            {items.map((item) => (
              <article
                key={item.bookTitle}
                className="glass-surface p-5 transition duration-300 hover:-translate-y-1 hover:bg-white/80"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-500">#{item.rank}</p>
                    <h3 className="mt-3 text-lg font-semibold tracking-tight text-slate-950">{item.bookTitle}</h3>
                  </div>
                  <div className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white">
                    Top {item.rank}
                  </div>
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-600">
                  {item.readerCount} {item.readerCount === 1 ? 'reader currently' : 'readers currently'}
                </p>
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

