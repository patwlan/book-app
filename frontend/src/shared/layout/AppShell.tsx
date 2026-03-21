import { PropsWithChildren } from 'react';
import { NavLink } from 'react-router-dom';

const navigationItems = [
  {
    to: '/',
    label: 'Current reading',
    end: true,
  },
  {
    to: '/profiles',
    label: 'Profiles',
  },
  {
    to: '/settings',
    label: 'Settings',
  },
];

export function AppShell({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen text-slate-950">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 pb-10 pt-4 sm:px-6 lg:px-8">
        <header className="sticky top-4 z-20">
          <div className="glass-surface flex flex-col gap-5 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <div>
              <p className="section-kicker">Book App</p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                Reading snapshots
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Track what the team is reading now, browse reader summaries, and manage your local owner context.
              </p>
            </div>
            <nav
              aria-label="Primary navigation"
              className="inline-flex items-center gap-2 self-start rounded-full border border-white/80 bg-white/70 p-1 shadow-soft backdrop-blur-xl"
            >
            {navigationItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  [
                    'rounded-full px-4 py-2 text-sm font-semibold transition duration-200',
                    isActive
                      ? 'bg-slate-950 text-white shadow-soft'
                      : 'text-slate-500 hover:bg-white hover:text-slate-900',
                  ].join(' ')
                }
              >
                {item.label}
              </NavLink>
            ))}
            </nav>
          </div>
        </header>
        <main className="flex-1 pt-8">{children}</main>
      </div>
    </div>
  );
}

