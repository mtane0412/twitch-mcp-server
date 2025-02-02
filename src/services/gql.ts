import { AxiosInstance } from 'axios';
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';

export class GraphQLService {
  constructor(private gqlSession: AxiosInstance) {}

  async getVideoComments(videoId: string): Promise<any[]> {
    const comments: any[] = [];
    try {
      // 最初のリクエスト
      const firstQuery = this.createFirstQuery(videoId);
      const firstResponse = await this.gqlSession.post('/gql', firstQuery);
      const firstData = firstResponse.data;

      // 最初のコメントを処理
      firstData[0]?.data?.video?.comments?.edges?.forEach((comment: any) => {
        comments.push(this.processComment(comment));
      });

      // 次ページの確認とcursor取得
      let cursor: string | null = null;
      if (firstData[0]?.data?.video?.comments?.pageInfo?.hasNextPage) {
        const edges = firstData[0].data.video.comments.edges;
        if (edges.length > 0) {
          cursor = edges[edges.length - 1].cursor;
          await this.sleep(100);
        }
      }

      // ページネーションループ
      while (cursor) {
        const query = this.createCursorQuery(videoId, cursor);
        const response = await this.gqlSession.post('/gql', query);
        const data = response.data;

        // コメントを処理
        data[0]?.data?.video?.comments?.edges?.forEach((comment: any) => {
          comments.push(this.processComment(comment));
        });

        // 次ページの確認
        if (data[0]?.data?.video?.comments?.pageInfo?.hasNextPage) {
          const edges = data[0].data.video.comments.edges;
          if (edges.length > 0) {
            cursor = edges[edges.length - 1].cursor;
            await this.sleep(100);
          } else {
            cursor = null;
          }
        } else {
          cursor = null;
        }
      }

      return comments;
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