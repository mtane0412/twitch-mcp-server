import { ApiClient } from '@twurple/api';
import { getUserByName, formatResponse } from '../../utils/twitch.js';

export async function handleGetChannelInfo(apiClient: ApiClient, args: { channelName: string }) {
  const user = await getUserByName(apiClient, args.channelName);
  const channel = await apiClient.channels.getChannelInfoById(user.id);

  const response: any = {
    id: user.id,
    name: user.name,
    displayName: user.displayName,
    description: user.description,
    profilePictureUrl: user.profilePictureUrl,
    creationDate: user.creationDate,
  };

  if (channel) {
    response.channel = {
      name: channel.name,
      game: channel.gameName,
      title: channel.title,
      language: channel.language,
      tags: channel.tags,
    };
  }

  return formatResponse(response);
}

export async function handleGetChatSettings(apiClient: ApiClient, args: { channelName: string }) {
  const user = await getUserByName(apiClient, args.channelName);
  const settings = await apiClient.chat.getSettings(user.id);

  return formatResponse({
    emoteOnlyModeEnabled: settings.emoteOnlyModeEnabled,
    followerOnlyModeEnabled: settings.followerOnlyModeEnabled,
    followerOnlyModeDelay: settings.followerOnlyModeDelay,
    slowModeEnabled: settings.slowModeEnabled,
    slowModeDelay: settings.slowModeDelay,
    subscriberOnlyModeEnabled: settings.subscriberOnlyModeEnabled,
    uniqueChatModeEnabled: settings.uniqueChatModeEnabled,
  });
}