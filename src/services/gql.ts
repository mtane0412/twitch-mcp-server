import { AxiosInstance } from 'axios';
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';

export class GraphQLService {
  constructor(private gqlSession: AxiosInstance) {}

  async getVideoComments(videoId: string, limit: number = 20, cursor?: string): Promise<{ comments: any[], nextCursor: string | null }> {
    try {
      // クエリの作成
      const query = cursor
        ? this.createCursorQuery(videoId, cursor)
        : this.createFirstQuery(videoId);
      
      // リクエストの実行
      const response = await this.gqlSession.post('/gql', query);
      const data = response.data;

      const comments: any[] = [];
      const edges = data[0]?.data?.video?.comments?.edges || [];
      const pageInfo = data[0]?.data?.video?.comments?.pageInfo;

      // コメントの処理(指定された数まで)
      for (let i = 0; i < Math.min(edges.length, limit); i++) {
        comments.push(this.processComment(edges[i]));
      }

      // 次のページのカーソルを取得
      let nextCursor: string | null = null;
      if (pageInfo?.hasNextPage && comments.length === limit) {
        nextCursor = edges[edges.length - 1].cursor;
      }

      return {
        comments,
        nextCursor
      };
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new McpError(
          ErrorCode.InvalidParams,
          `GraphQL API error: ${error.response.data.message}`
        );
      }
      throw new McpError(
        ErrorCode.InternalError,
        `Network error: ${error.message}`
      );
    }
  }

  private createFirstQuery(videoId: string) {
    return [{
      operationName: 'VideoCommentsByOffsetOrCursor',
      variables: {
        videoID: videoId,
        contentOffsetSeconds: 0
      },
      extensions: {
        persistedQuery: {
          version: 1,
          sha256Hash: 'b70a3591ff0f4e0313d126c6a1502d79a1c02baebb288227c582044aa76adf6a'
        }
      }
    }];
  }

  private createCursorQuery(videoId: string, cursor: string) {
    return [{
      operationName: 'VideoCommentsByOffsetOrCursor',
      variables: {
        videoID: videoId,
        cursor: cursor
      },
      extensions: {
        persistedQuery: {
          version: 1,
          sha256Hash: 'b70a3591ff0f4e0313d126c6a1502d79a1c02baebb288227c582044aa76adf6a'
        }
      }
    }];
  }

  private processComment(comment: any) {
    const node = comment.node;
    return {
      id: node.id,
      createdAt: node.createdAt,
      message: node.message?.fragments?.[0]?.text ?? '',
      commenter: node.commenter ? {
        id: node.commenter.id,
        displayName: node.commenter.displayName || node.commenter.login,
        login: node.commenter.login
      } : null
    };
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}