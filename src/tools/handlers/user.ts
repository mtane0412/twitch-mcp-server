import { ApiClient } from '@twurple/api';
import { formatResponse } from '../../utils/twitch.js';

export async function handleGetUsers(apiClient: ApiClient, args: { userNames: string[] }) {
  const users = await apiClient.users.getUsersByNames(args.userNames);

  return formatResponse(
    users.map(user => ({
      id: user.id,
      name: user.name,
      displayName: user.displayName,
      description: user.description,
      profilePictureUrl: user.profilePictureUrl,
      offlinePlaceholderUrl: user.offlinePlaceholderUrl,
      creationDate: user.creationDate,
      broadcasterType: user.broadcasterType,
      type: user.type,
    }))
  );
}