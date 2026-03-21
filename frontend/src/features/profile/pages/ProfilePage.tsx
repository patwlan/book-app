import { useAuth } from '../../../shared/auth/AuthProvider';
import { HttpError } from '../../../shared/api/httpClient';
import { useParams } from 'react-router-dom';
import { useProfileSummaryQuery } from '../state/profileQueries';

/**
 * Renders the active user's profile summary and books-read count.
 */
export function ProfilePage() {
  const { currentUser } = useAuth();
  const { userId } = useParams();
  const profileQuery = useProfileSummaryQuery(currentUser, userId);

  const hasInvalidCount = (profileQuery.data?.booksReadCount ?? 0) < 0;
  const isForeignProfile = Boolean(userId && userId !== currentUser.userId);
  const isNotFound = profileQuery.error instanceof HttpError && profileQuery.error.status === 404;
  const isFallback = (profileQuery.isError && !isNotFound) || hasInvalidCount;
  const booksReadCount = !isFallback && profileQuery.data ? profileQuery.data.booksReadCount : null;
  const displayedUserId = profileQuery.data?.userId ?? userId ?? currentUser.userId;
  const displayedDisplayName = profileQuery.data?.displayName ?? (isForeignProfile ? userId ?? 'Unknown reader' : currentUser.displayName);
  const helperText = profileQuery.isLoading
    ? isForeignProfile
      ? 'Loading this reader’s profile summary…'
      : 'Loading your reading summary…'
    : isNotFound
      ? 'Profile not found.'
      : isFallback
        ? 'Profile summary is unavailable right now.'
        : booksReadCount === 0
          ? 'No books read yet.'
          : isForeignProfile
            ? 'Profile summary for this reader.'
            : 'Your books-read total updates from the titles you record in the app.';

  return (
    <div className="max-w-5xl space-y-8">
      <section className="panel-surface space-y-3 p-6 sm:p-8">
        <p className="section-kicker">Profile</p>
        <h2 className="text-3xl font-semibold tracking-tight text-slate-950">Profile</h2>
        <p className="max-w-3xl text-sm leading-6 text-slate-600">
          {isForeignProfile ? 'Read-only summary for a selected reader.' : 'Personal reading summary for the active owner context.'}
        </p>
      </section>

      <section className="panel-surface grid gap-6 p-6 sm:p-8 lg:grid-cols-[minmax(0,1.2fr)_220px] lg:items-start">
        <div className="space-y-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              {isForeignProfile ? 'Reader profile' : 'Active reader'}
            </p>
            <h3 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{displayedDisplayName}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">{displayedUserId}</p>
          </div>

          <div className="rounded-[22px] bg-slate-950 px-5 py-4 text-sm leading-6 text-white">
            {helperText}
          </div>
        </div>

        <div className="glass-surface p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Books read</p>
          <p className="mt-4 text-5xl font-semibold tracking-tight text-slate-950">
            {profileQuery.isLoading ? '…' : isFallback || isNotFound ? '—' : booksReadCount}
          </p>
          <p className="mt-3 text-sm leading-6 text-slate-500">Total distinct books recorded by this reader.</p>
        </div>
      </section>
    </div>
  );
}
