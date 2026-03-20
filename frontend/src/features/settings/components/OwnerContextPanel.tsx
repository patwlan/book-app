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
    <section className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold">Owner context</h2>
        <p className="mt-2 text-sm text-slate-600">
          This minimal app uses local owner headers instead of a full authentication system.
        </p>
      </div>

      <div className="rounded-lg bg-slate-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Active owner</p>
        <p className="mt-2 text-sm font-medium text-slate-900">{currentUser.displayName}</p>
        <p className="text-sm text-slate-600">{currentUser.userId}</p>
      </div>

      <div className="grid gap-3">
        <label className="text-sm font-medium text-slate-700">
          User ID
          <input
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            value={draftUser.userId}
            onChange={handleUserIdChange}
          />
        </label>
        <label className="text-sm font-medium text-slate-700">
          Display name
          <input
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            value={draftUser.displayName}
            onChange={handleDisplayNameChange}
          />
        </label>
        <button
          type="button"
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          onClick={handleApplyOwnerContext}
          disabled={!hasChanges}
        >
          Apply owner context
        </button>
      </div>
    </section>
  );
}

