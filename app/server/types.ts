export type Track = {
  title: string;
  artist: string;
  album?: string | null;
  isrc?: string | null;
  sourceId?: string | null;
};

export type Playlist = {
  id: string;
  name: string;
  description?: string | null;
};
