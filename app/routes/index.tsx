import { createFileRoute } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/start';
import { useMemo, useState } from 'react';
import type { Playlist } from '../server/types';
import { getPlaylists } from '../server/spotify';
import { transferLiked, transferPlaylist } from '../server/transfer';

const loadPlaylists = createServerFn({ method: 'GET' }, async () => {
  return await getPlaylists();
});

const transferPlaylistFn = createServerFn({ method: 'POST' }, async ({ playlistId, description }: { playlistId: string; description?: string }) => {
  return await transferPlaylist(playlistId, description);
});

const transferLikedFn = createServerFn({ method: 'POST' }, async ({ name }: { name: string }) => {
  return await transferLiked(name);
});

export const Route = createFileRoute('/')({
  loader: async () => ({ playlists: await loadPlaylists() }),
  component: Dashboard,
});

function Dashboard() {
  const { playlists } = Route.useLoaderData() as { playlists: Playlist[] };
  const [status, setStatus] = useState<string>('');
  const [selectedPlaylist, setSelectedPlaylist] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [likedName, setLikedName] = useState<string>('Liked on Spotify');

  const options = useMemo(
    () => playlists.map((p) => ({ label: p.name, value: p.id })),
    [playlists],
  );

  const handlePlaylistTransfer = async () => {
    setStatus('Transferring playlist...');
    try {
      const result = await transferPlaylistFn({ playlistId: selectedPlaylist, description });
      setStatus(`Created Apple Music playlist with ${result.total} tracks (id: ${result.destinationId}).`);
    } catch (err: any) {
      setStatus(err?.message ?? 'Transfer failed');
    }
  };

  const handleLikedTransfer = async () => {
    setStatus('Transferring liked songs...');
    try {
      const result = await transferLikedFn({ name: likedName });
      setStatus(`Created Apple Music playlist with ${result.total} tracks (id: ${result.destinationId}).`);
    } catch (err: any) {
      setStatus(err?.message ?? 'Transfer failed');
    }
  };

  return (
    <div className="space-y-8">
      <section className="rounded-lg border border-slate-800 bg-slate-900/50 p-6 shadow-lg shadow-slate-900/30">
        <h1 className="text-2xl font-semibold">Spotify to Apple Music</h1>
        <p className="mt-2 text-sm text-slate-300">
          Use your access tokens to copy playlists or liked songs directly into your Apple Music library.
        </p>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-200">Playlist</label>
            <select
              className="w-full rounded bg-slate-800 p-3 text-sm text-slate-100 outline-none ring-1 ring-slate-700"
              value={selectedPlaylist}
              onChange={(e) => setSelectedPlaylist(e.target.value)}
            >
              <option value="" disabled>
                Select a playlist
              </option>
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <label className="block text-sm font-medium text-slate-200">Description (optional)</label>
            <input
              className="w-full rounded bg-slate-800 p-3 text-sm text-slate-100 outline-none ring-1 ring-slate-700"
              placeholder="Override description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <button
              className="rounded bg-emerald-500 px-4 py-3 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400"
              onClick={handlePlaylistTransfer}
              disabled={!selectedPlaylist}
            >
              Transfer playlist
            </button>
          </div>
          <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-200">Destination playlist name</label>
            <input
              className="w-full rounded bg-slate-800 p-3 text-sm text-slate-100 outline-none ring-1 ring-slate-700"
              value={likedName}
              onChange={(e) => setLikedName(e.target.value)}
            />
            <button
              className="rounded bg-indigo-500 px-4 py-3 text-sm font-semibold text-indigo-950 transition hover:bg-indigo-400"
              onClick={handleLikedTransfer}
            >
              Transfer liked songs
            </button>
          </div>
        </div>
        {status && <p className="mt-4 text-sm text-slate-200">{status}</p>}
      </section>
      <section className="rounded-lg border border-slate-800 bg-slate-900/40 p-6">
        <h2 className="text-lg font-semibold">Environment</h2>
        <p className="mt-2 text-sm text-slate-300">
          Ensure <code>SPOTIFY_ACCESS_TOKEN</code>, <code>APPLE_DEVELOPER_TOKEN</code>, and <code>APPLE_MUSIC_TOKEN</code>{' '}
          are set before running <code>npm run dev</code>. Requests are executed server-side via TanStack Start server functions.
        </p>
      </section>
    </div>
  );
}
