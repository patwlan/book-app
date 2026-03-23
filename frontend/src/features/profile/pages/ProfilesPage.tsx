import { Link } from 'react-router-dom';
import { useProfilesQuery } from '../state/profileQueries';

/**
 * Renders the profiles overview page with all known reader summaries.
 */
export function ProfilesPage() {
  const profilesQuery = useProfilesQuery();
  const items = profilesQuery.data?.items ?? [];

  return (
    <div className="max-w-5xl space-y-8">
      <section className="panel-surface space-y-3 p-6 sm:p-8">
        <p className="section-kicker">Profiles</p>
        <h2 className="text-3xl font-semibold tracking-tight text-slate-950">Profiles</h2>
        <p className="max-w-3xl text-sm leading-6 text-slate-600">
          Browse all known readers and the number of distinct books they have recorded.
        </p>
      </section>

      {profilesQuery.isLoading ? (
        <section className="panel-subtle p-6 text-sm text-slate-500">Loading reader summaries…</section>
      ) : null}

      {profilesQuery.isError ? (
        <section className="rounded-[22px] border border-rose-100 bg-rose-50/90 p-6 text-sm font-medium text-rose-700">
          Profiles are unavailable right now.
        </section>
      ) : null}

      {!profilesQuery.isLoading && !profilesQuery.isError && items.length === 0 ? (
        <section className="panel-subtle p-6 text-sm text-slate-500">No reader summaries yet.</section>
      ) : null}

      {!profilesQuery.isLoading && !profilesQuery.isError && items.length > 0 ? (
        <section className="grid gap-5 md:grid-cols-2">
          {items.map((item) => (
            <article key={item.userId} className="panel-surface flex flex-col gap-5 p-6 sm:p-8">
              <div className="space-y-2">
                <p className="section-kicker">Reader</p>
                <h3 className="text-2xl font-semibold tracking-tight text-slate-950">
                  <Link className="underline-offset-4 hover:underline" to={`/profiles/${item.userId}`}>
                    {item.displayName}
                  </Link>
                </h3>
                <p className="text-sm leading-6 text-slate-500">{item.userId}</p>
              </div>

              <div className="glass-surface p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Books read</p>
                <p className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">{item.booksReadCount}</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">Total distinct books recorded by this reader.</p>
              </div>
            </article>
          ))}
        </section>
      ) : null}
    </div>
  );
}
