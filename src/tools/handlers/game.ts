import { ApiClient } from '@twurple/api';
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import { formatResponse } from '../../utils/twitch.js';

export async function handleGetTopGames(apiClient: ApiClient, args: { limit?: number }) {
  const games = await apiClient.games.getTopGames({ limit: args.limit });
  
  return formatResponse(
    games.data.map(game => ({
      id: game.id,
      name: game.name,
      boxArtUrl: game.boxArtUrl,
    }))
  );
}

export async function handleGetGame(apiClient: ApiClient, args: { name: string }) {
  const game = await apiClient.games.getGameByName(args.name);
  if (!game) {
    throw new McpError(ErrorCode.InvalidParams, `Game "${args.name}" not found`);
  }

  return formatResponse({
    id: game.id,
    name: game.name,
    boxArtUrl: game.boxArtUrl,
  });
}

export async function handleSearchCategories(
  apiClient: ApiClient,
  args: { query: string; limit?: number }
) {
  const categories = await apiClient.search.searchCategories(args.query, { limit: args.limit });

  return formatResponse(
    categories.data.map(category => ({
      id: category.id,
      name: category.name,
      boxArtUrl: category.boxArtUrl,
    }))
  );
}