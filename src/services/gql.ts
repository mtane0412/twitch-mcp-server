import { AxiosInstance } from 'axios';
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';

export class GraphQLService {
  constructor(private gqlSession: AxiosInstance) {}

  async getVideoComments(videoId: string): Promise<any[]> {
    const comments: any[] = [];
    let cursor = '';
    let hasNextPage = true;

    // 最初のリクエスト
    const firstQuery = this.createVideoCommentsQuery(videoId);
    const firstResponse = await this.executeQuery(firstQuery);
    this.processCommentsResponse(firstResponse, comments);

    cursor = this.getNextCursor(firstResponse);
    hasNextPage = this.hasNextPage(firstResponse);

    // 残りのコメントを取得
    while (hasNextPage) {
      const query = this.createVideoCommentsQuery(videoId, cursor);
      const response = await this.executeQuery(query);
      this.processCommentsResponse(response, comments);

      cursor = this.getNextCursor(response);
      hasNextPage = this.hasNextPage(response);

      // レートリミット対策
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return comments;
  }

  private createVideoCommentsQuery(videoId: string, cursor?: string) {
    return {
      operationName: 'VideoCommentsByOffsetOrCursor',
      variables: cursor
        ? { videoID: videoId, cursor }
        : { videoID: videoId, contentOffsetSeconds: 0 },
      query: cursor
        ? this.getCommentsWithCursorQuery()
        : this.getInitialCommentsQuery(),
    };
  }

  private getInitialCommentsQuery(): string {
    return `
      query VideoCommentsByOffsetOrCursor($videoID: ID!, $contentOffsetSeconds: Int!) {
        video(id: $videoID) {
          comments(contentOffsetSeconds: $contentOffsetSeconds) {
            edges {
              cursor
              node {
                id
                createdAt
                commenter {
                  id
                  displayName
                  login
                }
                message {
                  fragments {
                    text
                  }
                }
              }
            }
            pageInfo {
              hasNextPage
            }
          }
        }
      }
    `;
  }

  private getCommentsWithCursorQuery(): string {
    return `
      query VideoCommentsByOffsetOrCursor($videoID: ID!, $cursor: String!) {
        video(id: $videoID) {
          comments(after: $cursor) {
            edges {
              cursor
              node {
                id
                createdAt
                commenter {
                  id
                  displayName
                  login
                }
                message {
                  fragments {
                    text
                  }
                }
              }
            }
            pageInfo {
              hasNextPage
            }
          }
        }
      }
    `;
  }

  private async executeQuery(query: any) {
    try {
      const response = await this.gqlSession.post('/gql', [query]);
      
      if (response.status !== 200) {
        throw new McpError(
          ErrorCode.InvalidParams,
          `Request failed with status ${response.status}: ${response.statusText}`
        );
      }

      const responseData = response.data?.[0];
      if (!responseData?.data?.video) {
        throw new McpError(
          ErrorCode.InvalidParams,
          `Video not found or invalid response`
        );
      }

      const data = responseData.data.video.comments;
      if (!data?.edges) {
        throw new McpError(
          ErrorCode.InvalidParams,
          `Comments are disabled or not available`
        );
      }

      return data;
    } catch (error: any) {
      if (error instanceof McpError) {
        throw error;
      }
      throw new McpError(
        ErrorCode.InternalError,
        `GraphQL API error: ${error.response?.data?.message || error.message}`
      );
    }
  }

  private processCommentsResponse(data: any, comments: any[]) {
    comments.push(...(data.edges || []).map((edge: any) => ({
      id: edge.node.id,
      createdAt: edge.node.createdAt,
      message: edge.node.message?.fragments?.[0]?.text ?? 'No message content',
      commenter: {
        id: edge.node.commenter?.id,
        displayName: edge.node.commenter?.displayName,
        login: edge.node.commenter?.login
      }
    })));
  }

  private getNextCursor(data: any): string {
    return data.edges[data.edges.length - 1].cursor;
  }

  private hasNextPage(data: any): boolean {
    return data.pageInfo.hasNextPage;
  }
}