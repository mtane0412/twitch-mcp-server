import { Tool } from '@modelcontextprotocol/sdk/types.js';

export const toolDefinitions: Tool[] = [
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
  {
    name: 'get_users',
    description: 'ユーザーの情報を取得します',
    inputSchema: {
      type: 'object',
      properties: {
        userNames: {
          type: 'array',
          description: 'Twitchユーザー名の配列',
          items: {
            type: 'string',
          },
          maxItems: 100,
        },
      },
      required: ['userNames'],
    },
  },
  {
    name: 'get_clips',
    description: 'クリップの情報を取得します',
    inputSchema: {
      type: 'object',
      properties: {
        channelName: {
          type: 'string',
          description: 'Twitchチャンネル名',
        },
        limit: {
          type: 'number',
          description: '取得する最大クリップ数(デフォルト: 20)',
          minimum: 1,
          maximum: 100,
        },
      },
      required: ['channelName'],
    },
  },
  {
    name: 'get_chat_settings',
    description: 'チャット設定を取得します',
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
    name: 'get_videos',
    description: 'チャンネルのビデオを取得します',
    inputSchema: {
      type: 'object',
      properties: {
        channelName: {
          type: 'string',
          description: 'Twitchチャンネル名',
        },
        limit: {
          type: 'number',
          description: '取得する最大ビデオ数(デフォルト: 20)',
          minimum: 1,
          maximum: 100,
        },
      },
      required: ['channelName'],
    },
  },
  {
    name: 'get_video_comments',
    description: 'アーカイブ動画のコメントを取得します',
    inputSchema: {
      type: 'object',
      properties: {
        videoId: {
          type: 'string',
          description: 'ビデオID',
        },
        limit: {
          type: 'number',
          description: '取得する最大コメント数(デフォルト: 20)',
          minimum: 1,
          maximum: 100,
        },
        cursor: {
          type: 'string',
          description: '次のページのカーソル',
        },
      },
      required: ['videoId'],
    },
  },
];