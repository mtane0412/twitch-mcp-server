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

// モジュールトップレベルでの環境変数チェックを削除
// ※　後述の通り、コンストラクタ内部でチェックする

export class TwitchServer {
  private server: Server;
  private apiClient: ApiClient;

  constructor() {
    // インスタンス生成時に環境変数をチェックする
    const CLIENT_ID = process.env.TWITCH_CLIENT_ID;
    const CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;
    if (!CLIENT_ID || !CLIENT_SECRET) {
      throw new Error('TWITCH_CLIENT_ID and TWITCH_CLIENT_SECRET environment variables are required');
    }

    const authProvider = new AppTokenAuthProvider(CLIENT_ID, CLIENT_SECRET);
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
    // ListToolsRequest のハンドラー登録
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
        // …（省略）…
      ],
    }));

    // CallToolRequest のハンドラー登録
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

          // …（他のケースもそのまま）…

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

// このファイルが直接実行された場合のみサーバーを起動
if (import.meta.url === process.argv[1] || process.argv[1]?.endsWith('index.js')) {
  const server = new TwitchServer();
  server.run().catch(console.error);
}
