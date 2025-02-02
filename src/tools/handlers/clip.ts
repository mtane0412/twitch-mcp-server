import { ApiClient } from '@twurple/api';
import { getUserByName, formatResponse } from '../../utils/twitch.js';

export async function handleGetClips(
  apiClient: ApiClient,
  args: { channelName: string; limit?: number }
) {
  const user = await getUserByName(apiClient, args.channelName);
  const clips = await apiClient.clips.getClipsForBroadcaster(user.id, { limit: args.limit });

  return formatResponse(
    clips.data.map(clip => ({
      id: clip.id,
      url: clip.url,
      embedUrl: clip.embedUrl,
      broadcasterId: clip.broadcasterId,
      broadcasterName: clip.broadcasterDisplayName,
      creatorId: clip.creatorId,
      creatorName: clip.creatorDisplayName,
      videoId: clip.videoId,
      gameId: clip.gameId,
      language: clip.language,
      title: clip.title,
      viewCount: clip.views,
      creationDate: clip.creationDate,
      thumbnailUrl: clip.thumbnailUrl,
      duration: clip.duration,
    }))
  );
}