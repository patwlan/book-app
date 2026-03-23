import { OwnerContextPanel } from '../components/OwnerContextPanel';

/**
 * Renders user-configurable application settings.
 */
export function SettingsPage() {
  return (
    <div className="max-w-5xl space-y-8">
      <section className="panel-surface space-y-3 p-6 sm:p-8">
        <p className="section-kicker">Preferences</p>
        <h2 className="text-3xl font-semibold tracking-tight text-slate-950">Settings</h2>
        <p className="max-w-3xl text-sm leading-6 text-slate-600">
          Manage the local owner context used by the app when creating, updating, and deleting your
          current reading post.
        </p>
      </section>

      <OwnerContextPanel />
    </div>
  );
}

