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
import axios from 'axios';

import { toolDefinitions } from './tools/definitions.js';
import { handleGetChannelInfo, handleGetChatSettings } from './tools/handlers/channel.js';
import { handleGetStreamInfo, handleGetStreams } from './tools/handlers/stream.js';
import { handleGetTopGames, handleGetGame, handleSearchCategories } from './tools/handlers/game.js';
import { handleSearchChannels } from './tools/handlers/search.js';
import { handleGetGlobalEmotes, handleGetGlobalBadges } from './tools/handlers/chat.js';
import { handleGetUsers } from './tools/handlers/user.js';
import { handleGetClips } from './tools/handlers/clip.js';
import { handleGetVideos, handleGetVideoComments } from './tools/handlers/video.js';
import { GraphQLService } from './services/gql.js';
import { handleApiError } from './utils/twitch.js';

const CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;
const GQL_CLIENT_ID = process.env.TWITCH_GQL_CLIENT_ID || 'kimne78kx3ncx6brgo4mv6wki5h1ko';

if (!CLIENT_ID || !CLIENT_SECRET) {
  throw new Error('TWITCH_CLIENT_ID and TWITCH_CLIENT_SECRET environment variables are required');
}

class TwitchServer {
  private server: Server;
  private apiClient: ApiClient;
  private gqlService: GraphQLService;

  constructor() {
    // GraphQL用のセッションを作成
    const gqlSession = axios.create({
      baseURL: 'https://gql.twitch.tv',
      headers: {
        'Client-ID': GQL_CLIENT_ID,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    this.gqlService = new GraphQLService(gqlSession);

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
      tools: toolDefinitions,
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        const args = request.params.arguments as Record<string, unknown>;
        
        switch (request.params.name) {
          case 'get_channel_info':
            return await handleGetChannelInfo(this.apiClient, {
              channelName: args.channelName as string
            });

          case 'get_stream_info':
            return await handleGetStreamInfo(this.apiClient, {
              channelName: args.channelName as string
            });

          case 'get_top_games':
            return await handleGetTopGames(this.apiClient, {
              limit: args.limit as number | undefined
            });

          case 'get_game':
            return await handleGetGame(this.apiClient, {
              name: args.name as string
            });

          case 'search_categories':
            return await handleSearchCategories(this.apiClient, {
              query: args.query as string,
              limit: args.limit as number | undefined
            });

          case 'search_channels':
            return await handleSearchChannels(this.apiClient, {
              query: args.query as string,
              limit: args.limit as number | undefined
            });

          case 'get_streams':
            return await handleGetStreams(this.apiClient, {
              game: args.game as string | undefined,
              language: args.language as string | undefined,
              limit: args.limit as number | undefined
            });

          case 'get_global_emotes':
            return await handleGetGlobalEmotes(this.apiClient);

          case 'get_global_badges':
            return await handleGetGlobalBadges(this.apiClient);

          case 'get_users':
            return await handleGetUsers(this.apiClient, {
              userNames: args.userNames as string[]
            });

          case 'get_clips':
            return await handleGetClips(this.apiClient, {
              channelName: args.channelName as string,
              limit: args.limit as number | undefined
            });

          case 'get_chat_settings':
            return await handleGetChatSettings(this.apiClient, {
              channelName: args.channelName as string
            });

          case 'get_videos':
            return await handleGetVideos(this.apiClient, {
              channelName: args.channelName as string,
              limit: args.limit as number | undefined
            });

          case 'get_video_comments':
            return await handleGetVideoComments(this.gqlService, {
              videoId: args.videoId as string
            });

          default:
            throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
        }
      } catch (error: unknown) {
        handleApiError(error);
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