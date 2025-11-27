# swap-my-tunes

A TanStack Start web app for moving playlists and liked songs between Spotify and Apple Music. All requests run on the server so your API tokens stay off the client.

## Features
- List your Spotify playlists for selection.
- Copy a specific Spotify playlist into Apple Music.
- Create an Apple Music playlist populated with your Spotify liked tracks.

## Setup
1. Install Node.js 18+ and dependencies:
   ```bash
   npm install
   ```

2. Export the required tokens so the server functions can call the Spotify and Apple Music APIs:
   ```bash
   export SPOTIFY_ACCESS_TOKEN="<spotify access token>"
   export APPLE_DEVELOPER_TOKEN="<musickit developer token>"
   export APPLE_MUSIC_TOKEN="<user token>"
   export APPLE_STOREFRONT="us"
   ```

## Usage
Run the development server and open the dashboard at http://localhost:3000:
```bash
npm run dev
```

Use the UI to pick a Spotify playlist or move your liked songs directly into Apple Music. Transfers are executed on the server using your provided tokens.

## Notes
- Apple Music APIs may limit access to library playlists; this tool focuses on moving content from Spotify to Apple Music.
- ISRC matching is preferred when available, with fallback title/artist search for best-effort transfers.
