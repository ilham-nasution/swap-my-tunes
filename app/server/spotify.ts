import type { Playlist, Track } from './types';

const API_BASE = 'https://api.spotify.com/v1';

function headers() {
  const token = process.env.SPOTIFY_ACCESS_TOKEN;
  if (!token) {
    throw new Error('Missing SPOTIFY_ACCESS_TOKEN');
  }
  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function getPlaylists(limit = 50): Promise<Playlist[]> {
  const playlists: Playlist[] = [];
  let offset = 0;
  while (true) {
    const params = new URLSearchParams({ limit: `${limit}`, offset: `${offset}` });
    const response = await fetch(`${API_BASE}/me/playlists?${params}`, { headers: headers() });
    if (!response.ok) {
      throw new Error(`Spotify playlists failed: ${response.statusText}`);
    }
    const data = await response.json();
    const items: any[] = data?.items ?? [];
    playlists.push(
      ...items.map((item) => ({
        id: item.id,
        name: item.name ?? 'Unnamed playlist',
        description: item.description ?? undefined,
      })),
    );
    if (data?.next) {
      offset += limit;
    } else {
      break;
    }
  }
  return playlists;
}

export async function getPlaylistTracks(playlistId: string, limit = 100): Promise<Track[]> {
  const tracks: Track[] = [];
  let offset = 0;
  while (true) {
    const params = new URLSearchParams({ market: 'from_token', limit: `${limit}`, offset: `${offset}` });
    const response = await fetch(`${API_BASE}/playlists/${playlistId}/tracks?${params}`, { headers: headers() });
    if (!response.ok) {
      throw new Error(`Spotify playlist tracks failed: ${response.statusText}`);
    }
    const data = await response.json();
    const items: any[] = data?.items ?? [];
    items.forEach((item) => {
      if (!item?.track) return;
      const track = item.track;
      tracks.push({
        title: track.name ?? 'Unknown Title',
        artist: (track.artists ?? []).map((artist: any) => artist?.name).filter(Boolean).join(', '),
        album: track.album?.name,
        isrc: track.external_ids?.isrc,
      });
    });
    if (data?.next) {
      offset += limit;
    } else {
      break;
    }
  }
  return tracks;
}

export async function getLikedTracks(limit = 50): Promise<Track[]> {
  const tracks: Track[] = [];
  let offset = 0;
  while (true) {
    const params = new URLSearchParams({ market: 'from_token', limit: `${limit}`, offset: `${offset}` });
    const response = await fetch(`${API_BASE}/me/tracks?${params}`, { headers: headers() });
    if (!response.ok) {
      throw new Error(`Spotify liked tracks failed: ${response.statusText}`);
    }
    const data = await response.json();
    const items: any[] = data?.items ?? [];
    items.forEach((item) => {
      const track = item?.track;
      if (!track) return;
      tracks.push({
        title: track.name ?? 'Unknown Title',
        artist: (track.artists ?? []).map((artist: any) => artist?.name).filter(Boolean).join(', '),
        album: track.album?.name,
        isrc: track.external_ids?.isrc,
      });
    });
    if (data?.next) {
      offset += limit;
    } else {
      break;
    }
  }
  return tracks;
}
