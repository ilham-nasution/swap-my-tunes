import { createRootRoute, Link, Outlet } from '@tanstack/react-router';
import { RouterDevtools } from '@tanstack/router-devtools';

import '../styles.css';

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div className="text-lg font-semibold">Swap My Tunes</div>
          <nav className="space-x-4 text-sm uppercase tracking-wide text-slate-300">
            <Link to="/" className="hover:text-white">
              Dashboard
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>
      <RouterDevtools position="bottom-right" />
    </div>
  );
}
