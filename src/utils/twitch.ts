import { ApiClient } from '@twurple/api';
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';

export async function getUserByName(apiClient: ApiClient, channelName: string) {
  const user = await apiClient.users.getUserByName(channelName);
  if (!user) {
    throw new McpError(ErrorCode.InvalidParams, `Channel "${channelName}" not found`);
  }
  return user;
}

export function formatResponse(data: any) {
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(data, null, 2),
      },
    ],
  };
}

export function handleApiError(error: unknown): never {
  if (error instanceof McpError) {
    throw error;
  }
  console.error('[Twitch API Error]', error);
  const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
  throw new McpError(ErrorCode.InternalError, `Twitch API error: ${errorMessage}`);
}