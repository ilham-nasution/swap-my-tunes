import { addTracksToPlaylist, createPlaylist, searchSongIds } from './apple';
import { getLikedTracks, getPlaylistTracks, getPlaylists } from './spotify';

export async function transferPlaylist(playlistId: string, description?: string) {
  const [tracks, playlists] = await Promise.all([getPlaylistTracks(playlistId), getPlaylists()]);
  const source = playlists.find((p) => p.id === playlistId);
  const songIds = await searchSongIds(tracks);
  const destination = await createPlaylist(
    source?.name || 'Imported playlist',
    description || source?.description || 'Imported from Spotify',
  );
  await addTracksToPlaylist(destination.id, songIds);
  return { destinationId: destination.id, total: songIds.length };
}

export async function transferLiked(name: string) {
  const tracks = await getLikedTracks();
  const songIds = await searchSongIds(tracks);
  const destination = await createPlaylist(name, 'Imported from Spotify likes');
  await addTracksToPlaylist(destination.id, songIds);
  return { destinationId: destination.id, total: songIds.length };
}
