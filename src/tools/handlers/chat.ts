import { ApiClient } from '@twurple/api';
import { formatResponse } from '../../utils/twitch.js';

export async function handleGetGlobalEmotes(apiClient: ApiClient) {
  const emotes = await apiClient.chat.getGlobalEmotes();

  return formatResponse(
    emotes.map(emote => ({
      id: emote.id,
      name: emote.name,
      urls: {
        url1x: emote.getImageUrl(1),
        url2x: emote.getImageUrl(2),
        url4x: emote.getImageUrl(4),
      },
    }))
  );
}

export async function handleGetGlobalBadges(apiClient: ApiClient) {
  const badges = await apiClient.chat.getGlobalBadges();

  return formatResponse(
    badges.map(badge => ({
      id: badge.id,
      versions: Object.fromEntries(
        badge.versions.map(version => [
          version.id,
          {
            title: version.title,
            imageUrl: version.getImageUrl(1),
          },
        ])
      ),
    }))
  );
}