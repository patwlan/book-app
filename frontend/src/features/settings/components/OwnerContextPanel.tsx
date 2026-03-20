import { type ChangeEvent, useEffect, useState } from 'react';
import { useAuth, type CurrentUser } from '../../../shared/auth/AuthProvider';

/**
 * Allows users to manage the local owner context used for API ownership headers.
 */
export function OwnerContextPanel() {
  const { currentUser, setCurrentUser } = useAuth();
  const [draftUser, setDraftUser] = useState(currentUser);

  useEffect(() => {
    setDraftUser(currentUser);
  }, [currentUser]);

  const hasChanges =
    draftUser.userId !== currentUser.userId || draftUser.displayName !== currentUser.displayName;

  function updateDraftUser(nextPartialUser: Partial<CurrentUser>) {
    setDraftUser((currentDraftUser) => ({ ...currentDraftUser, ...nextPartialUser }));
  }

  function handleUserIdChange(event: ChangeEvent<HTMLInputElement>) {
    updateDraftUser({ userId: event.target.value });
  }

  function handleDisplayNameChange(event: ChangeEvent<HTMLInputElement>) {
    updateDraftUser({ displayName: event.target.value });
  }

  function handleApplyOwnerContext() {
    setCurrentUser(draftUser);
  }

  return (
    <section className="panel-surface space-y-8 p-6 sm:p-8">
      <div className="space-y-3">
        <p className="section-kicker">Identity</p>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Owner context</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
          This minimal app uses local owner headers instead of a full authentication system.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(260px,0.9fr)_minmax(0,1.1fr)]">
        <div className="glass-surface p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Active owner</p>
          <p className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">{currentUser.displayName}</p>
          <p className="mt-2 text-sm leading-6 text-slate-500">{currentUser.userId}</p>

          <div className="mt-6 rounded-[22px] bg-slate-950 px-4 py-4 text-sm leading-6 text-white">
            Changes are stored locally in this browser and used for ownership-aware actions in the app.
          </div>
        </div>

        <div className="grid gap-5">
          <label className="text-sm font-medium text-slate-700">
            <span className="mb-2 block">User ID</span>
            <input className="input-field" value={draftUser.userId} onChange={handleUserIdChange} />
          </label>
          <label className="text-sm font-medium text-slate-700">
            <span className="mb-2 block">Display name</span>
            <input className="input-field" value={draftUser.displayName} onChange={handleDisplayNameChange} />
          </label>
          <div className="flex flex-wrap gap-3">
            <button type="button" className="primary-button" onClick={handleApplyOwnerContext} disabled={!hasChanges}>
              Apply owner context
            </button>
            <div className="inline-flex items-center rounded-full border border-slate-200 bg-white/70 px-4 py-3 text-sm text-slate-500">
              {hasChanges ? 'Unsaved changes' : 'All changes applied'}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

