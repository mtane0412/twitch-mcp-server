import { ApiClient } from '@twurple/api';
import { getUserByName, formatResponse } from '../../utils/twitch.js';
import { GraphQLService } from '../../services/gql.js';

export async function handleGetVideos(
  apiClient: ApiClient,
  args: { channelName: string; limit?: number }
) {
  const user = await getUserByName(apiClient, args.channelName);
  const videos = await apiClient.videos.getVideosByUser(user.id, { limit: args.limit });

  return formatResponse({
    total: videos.data.length,
    videos: videos.data.map(video => ({
      id: video.id,
      title: video.title,
      description: video.description,
      url: video.url,
      thumbnailUrl: video.thumbnailUrl,
      viewCount: video.views,
      creationDate: video.creationDate,
      duration: video.duration,
      language: video.language,
      type: video.type,
      publishDate: video.publishDate,
      mutedSegments: video.mutedSegmentData,
    })),
  });
}

export async function handleGetVideoComments(
  gqlService: GraphQLService,
  args: { videoId: string }
) {
  const comments = await gqlService.getVideoComments(args.videoId);

  return formatResponse({
    total: comments.length,
    comments,
  });
}