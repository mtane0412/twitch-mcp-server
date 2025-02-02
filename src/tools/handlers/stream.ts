import { ApiClient } from '@twurple/api';
import { getUserByName, formatResponse } from '../../utils/twitch.js';

export async function handleGetStreamInfo(apiClient: ApiClient, args: { channelName: string }) {
  const user = await getUserByName(apiClient, args.channelName);
  const stream = await apiClient.streams.getStreamByUserId(user.id);

  if (!stream) {
    return formatResponse({
      status: 'offline',
      message: `${user.displayName} is currently offline`,
      lastOnline: null
    });
  }

  return formatResponse({
    status: 'online',
    title: stream.title,
    game: stream.gameName,
    viewers: stream.viewers,
    startedAt: stream.startDate,
    language: stream.language,
    thumbnailUrl: stream.thumbnailUrl,
    tags: stream.tags,
  });
}

export async function handleGetStreams(
  apiClient: ApiClient,
  args: { game?: string; language?: string; limit?: number }
) {
  const streams = await apiClient.streams.getStreams({
    game: args.game,
    language: args.language,
    limit: args.limit,
  });

  return formatResponse(
    streams.data.map(stream => ({
      userId: stream.userId,
      userName: stream.userName,
      title: stream.title,
      game: stream.gameName,
      viewers: stream.viewers,
      startedAt: stream.startDate,
      language: stream.language,
      thumbnailUrl: stream.thumbnailUrl,
      tags: stream.tags,
    }))
  );
}