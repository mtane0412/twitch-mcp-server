import { ApiClient } from '@twurple/api';
import { formatResponse } from '../../utils/twitch.js';

export async function handleSearchChannels(
  apiClient: ApiClient,
  args: { query: string; limit?: number }
) {
  const channels = await apiClient.search.searchChannels(args.query, { limit: args.limit });

  return formatResponse(
    channels.data.map(channel => ({
      id: channel.id,
      name: channel.name,
      displayName: channel.displayName,
      game: channel.gameName,
      language: channel.language,
      tags: channel.tags,
    }))
  );
}