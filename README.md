# Twitch MCP Server

A Model Context Protocol (MCP) server that interacts with the Twitch API. This server utilizes the Twitch Helix API to retrieve channel information, stream details, game data, and more.

## Features

- Get channel information (profile, description, creation date, etc.)
- Get stream information (title, game, viewer count, start time, etc.)
- Get list of top games
- Search categories/games
- Search channels
- Get live streams (filterable by game and language)
- Get global emotes
- Get global chat badges
- Get user information
- Get clips from a channel
- Get chat settings
- Get videos from a specified channel
- Get comments from archived videos (using GraphQL API)

## Prerequisites

- Node.js (v18 or higher recommended)
- Twitch Developer Account
- Twitch API Client ID and Client Secret
- Twitch GraphQL Client ID (for video comments feature)

## Installation

Install the package using npm:

```bash
npm install @mtane0412/twitch-mcp-server
```

## Configuration

1. Create a new application in the [Twitch Developer Console](https://dev.twitch.tv/console)

2. Set the following environment variables:

```bash
# macOS/Linux
export TWITCH_CLIENT_ID="your_client_id"
export TWITCH_CLIENT_SECRET="your_client_secret"
export TWITCH_GQL_CLIENT_ID="your_gql_client_id"  # Optional: For video comments feature

# Windows (PowerShell)
$env:TWITCH_CLIENT_ID="your_client_id"
$env:TWITCH_CLIENT_SECRET="your_client_secret"
$env:TWITCH_GQL_CLIENT_ID="your_gql_client_id"    # Optional: For video comments feature
```

Alternatively, you can create a `.env` file:

```env
TWITCH_CLIENT_ID=your_client_id
TWITCH_CLIENT_SECRET=your_client_secret
TWITCH_GQL_CLIENT_ID=your_gql_client_id  # Optional: For video comments feature
```

Note: For information about obtaining the TWITCH_GQL_CLIENT_ID, please refer to [twitch-graphql-api](https://github.com/SuperSonicHub1/twitch-graphql-api).

## Usage

After installation, you can start using the server by running:

```bash
npx @mtane0412/twitch-mcp-server
```

## Available Tools

### get_channel_info
Retrieves detailed information about a Twitch channel.

Input:
```json
{
  "channelName": "string" // Required: Twitch channel name
}
```

Example output:
```json
{
  "id": "12345678",
  "name": "channel_name",
  "displayName": "Channel Name",
  "description": "Channel description",
  "profilePictureUrl": "https://...",
  "creationDate": "2020-01-01T00:00:00Z",
  "channel": {
    "name": "Channel Name",
    "game": "Game Name",
    "title": "Stream Title",
    "language": "en",
    "tags": ["tag1", "tag2"]
  }
}
```

### get_stream_info
Retrieves information about a live stream.

Input:
```json
{
  "channelName": "string" // Required: Twitch channel name
}
```

Example output (when online):
```json
{
  "status": "online",
  "title": "Stream Title",
  "game": "Game Name",
  "viewers": 1000,
  "startedAt": "2024-02-01T12:00:00Z",
  "language": "en",
  "thumbnailUrl": "https://...",
  "tags": ["tag1", "tag2"]
}
```

### get_top_games
Retrieves a list of the most popular games on Twitch.

Input:
```json
{
  "limit": "number" // Optional: Number of games to retrieve (1-100, default: 20)
}
```

### search_categories
Searches for games and categories.

Input:
```json
{
  "query": "string", // Required: Search query
  "limit": "number"  // Optional: Number of results to retrieve (1-100, default: 20)
}
```

### search_channels
Searches for Twitch channels.

Input:
```json
{
  "query": "string", // Required: Search query
  "limit": "number"  // Optional: Number of results to retrieve (1-100, default: 20)
}
```

### get_streams
Retrieves information about currently live streams.

Input:
```json
{
  "game": "string",     // Optional: Filter by game name
  "language": "string", // Optional: Filter by language (e.g., ja, en)
  "limit": "number"     // Optional: Number of results to retrieve (1-100, default: 20)
}
```

### get_global_emotes
Retrieves a list of Twitch global emotes.

Input: None required

### get_global_badges
Retrieves a list of Twitch global chat badges.

Input: None required

### get_users
Retrieves information about specified Twitch users.

Input:
```json
{
  "userNames": ["string"] // Required: Array of Twitch usernames (max 100)
}
```

### get_clips
Retrieves clips from a specified channel.

Input:
```json
{
  "channelName": "string", // Required: Twitch channel name
  "limit": "number"        // Optional: Number of clips to retrieve (1-100, default: 20)
}
```

### get_chat_settings
Retrieves chat settings for a specified channel.

Input:
```json
{
  "channelName": "string" // Required: Twitch channel name
}
```

### get_videos
Retrieves videos from a specified channel.

Input:
```json
{
  "channelName": "string", // Required: Twitch channel name
  "limit": "number"        // Optional: Number of videos to retrieve (1-100, default: 20)
}
```

Example output:
```json
{
  "total": 5,
  "videos": [
    {
      "id": "1234567890",
      "title": "Stream Title",
      "description": "Video description",
      "url": "https://www.twitch.tv/videos/1234567890",
      "thumbnailUrl": "https://...",
      "viewCount": 1000,
      "creationDate": "2024-02-01T12:00:00Z",
      "duration": "1h30m20s",
      "language": "en",
      "type": "archive",
      "publishDate": "2024-02-01T12:00:00Z",
      "mutedSegments": []
    }
  ]
}
```

### get_video_comments
Retrieves comments from an archived video using Twitch's GraphQL API.

Input:
```json
{
  "videoId": "string" // Required: Video ID
}
```

Example output:
```json
{
  "total": 41,
  "comments": [
    {
      "id": "comment-id",
      "createdAt": "2024-02-01T12:00:00Z",
      "message": "Comment text",
      "commenter": {
        "id": "user-id",
        "displayName": "User Name",
        "login": "username"
      }
    }
  ]
}
```

## License

MIT License