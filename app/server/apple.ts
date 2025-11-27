import type { Playlist, Track } from './types';

const API_BASE = 'https://api.music.apple.com/v1';

function headers() {
  const developerToken = process.env.APPLE_DEVELOPER_TOKEN;
  const musicUserToken = process.env.APPLE_MUSIC_TOKEN;
  if (!developerToken || !musicUserToken) {
    throw new Error('Missing APPLE_DEVELOPER_TOKEN or APPLE_MUSIC_TOKEN');
  }
  return {
    Authorization: `Bearer ${developerToken}`,
    'Music-User-Token': musicUserToken,
  };
}

function storefront() {
  return process.env.APPLE_STOREFRONT || 'us';
}

export async function searchSongIds(tracks: Track[]): Promise<string[]> {
  const ids: string[] = [];
  for (const track of tracks) {
    const found = track.isrc ? await findTrackByIsrc(track.isrc) : null;
    if (found?.sourceId) {
      ids.push(found.sourceId);
      continue;
    }
    const query = encodeURIComponent(`${track.title} ${track.artist}`);
    const response = await fetch(
      `${API_BASE}/catalog/${storefront()}/search?term=${query}&types=songs&limit=1`,
      { headers: headers() },
    );
    if (!response.ok) continue;
    const data = await response.json();
    const song = data?.results?.songs?.data?.[0];
    if (song?.id) {
      ids.push(song.id);
    }
  }
  return ids;
}

export async function findTrackByIsrc(isrc: string): Promise<Track | null> {
  const response = await fetch(
    `${API_BASE}/catalog/${storefront()}/songs?filter[isrc]=${encodeURIComponent(isrc)}&types=songs&limit=1`,
    { headers: headers() },
  );
  if (!response.ok) return null;
  const data = await response.json();
  const song = data?.data?.[0];
  if (!song) return null;
  return {
    title: song.attributes?.name ?? 'Unknown Title',
    artist: song.attributes?.artistName ?? '',
    album: song.attributes?.albumName,
    isrc: song.attributes?.isrc,
    sourceId: song.id,
  };
}

export async function createPlaylist(name: string, description?: string): Promise<Playlist> {
  const payload = {
    attributes: { name, description: description || '' },
    relationships: { tracks: { data: [] } },
  };
  const response = await fetch(`${API_BASE}/me/library/playlists`, {
    method: 'POST',
    headers: { ...headers(), 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`Apple playlist creation failed: ${response.statusText}`);
  }
  const playlist = (await response.json())?.data?.[0];
  return {
    id: playlist?.id,
    name: playlist?.attributes?.name ?? name,
    description: playlist?.attributes?.description,
  };
}

export async function addTracksToPlaylist(playlistId: string, songIds: string[]): Promise<void> {
  const chunks = chunk(songIds, 100);
  for (const piece of chunks) {
    if (!piece.length) continue;
    const payload = { data: piece.map((id) => ({ id, type: 'songs' })) };
    const response = await fetch(`${API_BASE}/me/library/playlists/${playlistId}/tracks`, {
      method: 'POST',
      headers: { ...headers(), 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error(`Apple playlist track insert failed: ${response.statusText}`);
    }
  }
}

function chunk<T>(values: T[], size: number): T[][] {
  const batches: T[][] = [];
  for (let i = 0; i < values.length; i += size) {
    batches.push(values.slice(i, i + size));
  }
  return batches;
}
