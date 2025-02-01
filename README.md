# Twitch MCP Server

A Model Context Protocol (MCP) server that provides tools for interacting with the Twitch API using the Helix API.

## Features

- Get channel information
- Get stream information
- Get top games
- Search channels
- Get live streams
- Get followers (requires user access token, currently not available)

## Prerequisites

- Node.js
- Twitch Developer Account
- Twitch API Client ID and Client Secret

## Installation

```bash
npm install
```

## Configuration

Set the following environment variables:

```bash
export TWITCH_CLIENT_ID="your_client_id"
export TWITCH_CLIENT_SECRET="your_client_secret"
```

## Usage

1. Build the project:
```bash
npm run build
```

2. Start the server:
```bash
npm start
```

## Available Tools

### get_channel_info
Get information about a Twitch channel.

Input:
```json
{
  "channelName": "string" // Required: Twitch channel name
}
```

### get_stream_info
Get information about a live stream.

Input:
```json
{
  "channelName": "string" // Required: Twitch channel name
}
```

### get_top_games
Get a list of the most popular games on Twitch.

Input:
```json
{
  "limit": "number" // Optional: Number of games to retrieve (1-100, default: 20)
}
```

### search_channels
Search for Twitch channels.

Input:
```json
{
  "query": "string", // Required: Search query
  "limit": "number"  // Optional: Number of results to retrieve (1-100, default: 20)
}
```

### get_streams
Get information about live streams.

Input:
```json
{
  "game": "string",     // Optional: Filter by game name
  "language": "string", // Optional: Filter by language (e.g., "ja", "en")
  "limit": "number"     // Optional: Number of results to retrieve (1-100, default: 20)
}
```

### get_followers
Get follower information for a channel (currently not available, requires user access token).

Input:
```json
{
  "channelName": "string", // Required: Twitch channel name
  "limit": "number"        // Optional: Number of followers to retrieve (1-100, default: 20)
}
```

## Development

Watch mode for TypeScript compilation:
```bash
npm run dev
```

## License

MIT License