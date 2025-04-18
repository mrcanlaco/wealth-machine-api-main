export type PostType = 'post' | 'page';
export type PostFormat = 'markdown' | 'html';

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  description: string;
  imageUrl: string;
  tags: string[];
  category: string;
  type: PostType;
  format: PostFormat;
  createdAt: string;
  updatedAt: string;
}

export interface PostListParams {
  keyword?: string;
  tags?: string[];
  category?: string;
  limit?: number;
  offset?: number;
}

export interface PostListResponse {
  posts: Post[];
  total: number;
}
