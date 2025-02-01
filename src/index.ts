#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { ApiClient } from '@twurple/api';
import { AppTokenAuthProvider } from '@twurple/auth';

const CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;

if (!CLIENT_ID || !CLIENT_SECRET) {
  throw new Error('TWITCH_CLIENT_ID and TWITCH_CLIENT_SECRET environment variables are required');
}

class TwitchServer {
  private server: Server;
  private apiClient: ApiClient;

  constructor() {
    const authProvider = new AppTokenAuthProvider(CLIENT_ID as string, CLIENT_SECRET as string);
    this.apiClient = new ApiClient({ authProvider });

    this.server = new Server(
      {
        name: 'twitch-mcp-server',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'get_channel_info',
          description: 'チャンネル情報を取得します',
          inputSchema: {
            type: 'object',
            properties: {
              channelName: {
                type: 'string',
                description: 'Twitchチャンネル名',
              },
            },
            required: ['channelName'],
          },
        },
        {
          name: 'get_stream_info',
          description: '配信情報を取得します',
          inputSchema: {
            type: 'object',
            properties: {
              channelName: {
                type: 'string',
                description: 'Twitchチャンネル名',
              },
            },
            required: ['channelName'],
          },
        },
        {
          name: 'get_top_games',
          description: '人気のゲームのリストを取得します',
          inputSchema: {
            type: 'object',
            properties: {
              limit: {
                type: 'number',
                description: '取得する最大ゲーム数(デフォルト: 20)',
                minimum: 1,
                maximum: 100,
              },
            },
          },
        },
        {
          name: 'get_game',
          description: '特定のゲームの情報を取得します',
          inputSchema: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                description: 'ゲーム名',
              },
            },
            required: ['name'],
          },
        },
        {
          name: 'search_categories',
          description: 'ゲームやカテゴリーを検索します',
          inputSchema: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: '検索キーワード',
              },
              limit: {
                type: 'number',
                description: '取得する最大カテゴリー数(デフォルト: 20)',
                minimum: 1,
                maximum: 100,
              },
            },
            required: ['query'],
          },
        },
        {
          name: 'search_channels',
          description: 'チャンネルを検索します',
          inputSchema: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: '検索キーワード',
              },
              limit: {
                type: 'number',
                description: '取得する最大チャンネル数(デフォルト: 20)',
                minimum: 1,
                maximum: 100,
              },
            },
            required: ['query'],
          },
        },
        {
          name: 'get_streams',
          description: '現在ライブ配信中のストリームを取得します',
          inputSchema: {
            type: 'object',
            properties: {
              game: {
                type: 'string',
                description: 'ゲーム名でフィルター',
              },
              language: {
                type: 'string',
                description: '言語でフィルター (例: ja, en)',
              },
              limit: {
                type: 'number',
                description: '取得する最大ストリーム数(デフォルト: 20)',
                minimum: 1,
                maximum: 100,
              },
            },
          },
        },
        {
          name: 'get_global_emotes',
          description: 'グローバルエモートのリストを取得します',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'get_global_badges',
          description: 'グローバルチャットバッジのリストを取得します',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        switch (request.params.name) {
          case 'get_channel_info': {
            const { channelName } = request.params.arguments as { channelName: string };
            const user = await this.apiClient.users.getUserByName(channelName);
            if (!user) {
              throw new McpError(ErrorCode.InvalidParams, `Channel "${channelName}" not found`);
            }
            const channel = await this.apiClient.channels.getChannelInfoById(user.id);
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

            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(response, null, 2),
                },
              ],
            };
          }

          case 'get_stream_info': {
            const { channelName } = request.params.arguments as { channelName: string };
            const user = await this.apiClient.users.getUserByName(channelName);
            if (!user) {
              throw new McpError(ErrorCode.InvalidParams, `Channel "${channelName}" not found`);
            }
            const stream = await this.apiClient.streams.getStreamByUserId(user.id);
            if (!stream) {
              return {
                content: [
                  {
                    type: 'text',
                    text: JSON.stringify({
                      status: 'offline',
                      message: `${user.displayName} is currently offline`,
                      lastOnline: null
                    }, null, 2),
                  },
                ],
              };
            }
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    status: 'online',
                    title: stream.title,
                    game: stream.gameName,
                    viewers: stream.viewers,
                    startedAt: stream.startDate,
                    language: stream.language,
                    thumbnailUrl: stream.thumbnailUrl,
                    tags: stream.tags,
                  }, null, 2),
                },
              ],
            };
          }

          case 'get_top_games': {
            const { limit = 20 } = request.params.arguments as { limit?: number };
            const games = await this.apiClient.games.getTopGames({ limit });
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(games.data.map(game => ({
                    id: game.id,
                    name: game.name,
                    boxArtUrl: game.boxArtUrl,
                  })), null, 2),
                },
              ],
            };
          }

          case 'get_game': {
            const { name } = request.params.arguments as { name: string };
            const game = await this.apiClient.games.getGameByName(name);
            if (!game) {
              throw new McpError(ErrorCode.InvalidParams, `Game "${name}" not found`);
            }
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    id: game.id,
                    name: game.name,
                    boxArtUrl: game.boxArtUrl,
                  }, null, 2),
                },
              ],
            };
          }

          case 'search_categories': {
            const { query, limit = 20 } = request.params.arguments as { query: string; limit?: number };
            const categories = await this.apiClient.search.searchCategories(query, { limit });
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(categories.data.map(category => ({
                    id: category.id,
                    name: category.name,
                    boxArtUrl: category.boxArtUrl,
                  })), null, 2),
                },
              ],
            };
          }

          case 'search_channels': {
            const { query, limit = 20 } = request.params.arguments as { query: string; limit?: number };
            const channels = await this.apiClient.search.searchChannels(query, { limit });
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(channels.data.map(channel => ({
                    id: channel.id,
                    name: channel.name,
                    displayName: channel.displayName,
                    game: channel.gameName,
                    language: channel.language,
                    tags: channel.tags,
                  })), null, 2),
                },
              ],
            };
          }

          case 'get_streams': {
            const { game, language, limit = 20 } = request.params.arguments as {
              game?: string;
              language?: string;
              limit?: number;
            };
            const streams = await this.apiClient.streams.getStreams({
              game,
              language,
              limit,
            });
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(streams.data.map(stream => ({
                    userId: stream.userId,
                    userName: stream.userName,
                    title: stream.title,
                    game: stream.gameName,
                    viewers: stream.viewers,
                    startedAt: stream.startDate,
                    language: stream.language,
                    thumbnailUrl: stream.thumbnailUrl,
                    tags: stream.tags,
                  })), null, 2),
                },
              ],
            };
          }

          case 'get_global_emotes': {
            const emotes = await this.apiClient.chat.getGlobalEmotes();
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(emotes.map(emote => ({
                    id: emote.id,
                    name: emote.name,
                    urls: {
                      url1x: emote.getImageUrl(1),
                      url2x: emote.getImageUrl(2),
                      url4x: emote.getImageUrl(4),
                    },
                  })), null, 2),
                },
              ],
            };
          }

          case 'get_global_badges': {
            const badges = await this.apiClient.chat.getGlobalBadges();
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(badges.map(badge => ({
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
                  })), null, 2),
                },
              ],
            };
          }

          default:
            throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
        }
      } catch (error: unknown) {
        if (error instanceof McpError) {
          throw error;
        }
        console.error('[Twitch API Error]', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        throw new McpError(ErrorCode.InternalError, `Twitch API error: ${errorMessage}`);
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Twitch MCP server running on stdio');
  }
}

const server = new TwitchServer();
server.run().catch(console.error);