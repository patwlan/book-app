import { OwnerContextPanel } from '../components/OwnerContextPanel';

/**
 * Renders user-configurable application settings.
 */
export function SettingsPage() {
  return (
    <div className="max-w-3xl space-y-6">
      <section className="space-y-2">
        <h2 className="text-2xl font-semibold">Settings</h2>
        <p className="text-sm text-slate-600">
          Manage the local owner context used by the app when creating, updating, and deleting your
          current reading post.
        </p>
      </section>

      <OwnerContextPanel />
    </div>
  );
}

