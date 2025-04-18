import { Hono } from 'hono';
import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import { Post, PostListParams, PostListResponse } from '../types/post.type';
import { ResponseHandler } from '../utils/response.handler';

const postRoutes = new Hono();
const POSTS_DIR = path.join(import.meta.dir, '../posts');

// Helper function to parse HTML file
async function parseHtmlFile(filename: string): Promise<Post | null> {
  try {
    const filePath = path.join(POSTS_DIR, filename);
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const { data, content } = matter(fileContent);
    
    const slug = filename.replace('.html', '');
    
    return {
      id: slug,
      slug,
      title: data.title || '',
      content,
      description: data.description || '',
      imageUrl: data.imageUrl || '',
      tags: data.tags || [],
      category: data.category || '',
      type: data.type || 'post',
      format: data.format || 'html',
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: data.updatedAt || new Date().toISOString(),
    };
  } catch (error) {
    console.error(`Error parsing HTML file ${filename}:`, error);
    return null;
  }
}

// Helper function to parse markdown file
async function parseMarkdownFile(filename: string): Promise<Post | null> {
  try {
    const filePath = path.join(POSTS_DIR, filename);
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const { data, content } = matter(fileContent);
    
    const slug = filename.replace('.md', '');
    
    return {
      id: slug,
      slug,
      title: data.title || '',
      content,
      description: data.description || '',
      imageUrl: data.imageUrl || '',
      tags: data.tags || [],
      category: data.category || '',
      type: data.type || 'post',
      format: data.format || 'markdown',
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: data.updatedAt || new Date().toISOString(),
    };
  } catch (error) {
    console.error(`Error parsing markdown file ${filename}:`, error);
    return null;
  }
}

/**
 * @route GET /api/posts/:slug
 * @desc Get a single post by slug
 * @access Public
 */
postRoutes.get('/:slug', async (c) => {
  try {
    const { slug } = c.req.param();
    
    // Try markdown file first
    let post = await parseMarkdownFile(`${slug}.md`);
    
    // If not found, try HTML file
    if (!post) {
      post = await parseHtmlFile(`${slug}.html`);
    }

    if (!post) {
      return ResponseHandler.error(
        c,
        'Không tìm thấy bài viết',
        'POST_NOT_FOUND',
        404
      );
    }

    return ResponseHandler.success(
      c,
      post,
      'Lấy bài viết thành công'
    );
  } catch (error: any) {
    console.error('Error getting post:', error);
    return ResponseHandler.error(
      c,
      'Lỗi hệ thống',
      'INTERNAL_SERVER_ERROR',
      500
    );
  }
});

/**
 * @route GET /api/posts
 * @desc Get posts list with filters
 * @access Public
 */
postRoutes.get('/', async (c) => {
  try {
    const query = c.req.query();
    
    // Parse and validate pagination parameters
    const limit = Math.max(1, Math.min(100, parseInt(query.limit || '10'))); // Min 1, Max 100
    const offset = Math.max(0, parseInt(query.offset || '0')); // Min 0
    
    const params: PostListParams = {
      keyword: query.keyword || '',
      tags: query.tags ? JSON.parse(query.tags) : [],
      category: query.category || '',
      limit,
      offset,
    };

    // Read all markdown and HTML files
    const files = await fs.readdir(POSTS_DIR);
    const markdownFiles = files.filter(file => file.endsWith('.md'));
    const htmlFiles = files.filter(file => file.endsWith('.html'));

    // Parse all posts
    const markdownPostsPromises = markdownFiles.map(parseMarkdownFile);
    const htmlPostsPromises = htmlFiles.map(parseHtmlFile);
    const markdownPosts = (await Promise.all(markdownPostsPromises)).filter((post): post is Post => post !== null);
    const htmlPosts = (await Promise.all(htmlPostsPromises)).filter((post): post is Post => post !== null);
    const posts = [...markdownPosts, ...htmlPosts];

    // Apply filters
    let filteredPosts = posts;

    // Filter by type - only return posts, not pages
    filteredPosts = filteredPosts.filter(post => post.type === 'post');

    if (params.keyword) {
      const searchTerm = params.keyword.toLowerCase();
      filteredPosts = filteredPosts.filter(post =>
        post.title.toLowerCase().includes(searchTerm) ||
        post.description.toLowerCase().includes(searchTerm) ||
        post.content.toLowerCase().includes(searchTerm)
      );
    }

    if (params.tags && params.tags.length > 0) {
      filteredPosts = filteredPosts.filter(post =>
        params.tags!.some(tag => post.tags.includes(tag))
      );
    }

    if (params.category) {
      filteredPosts = filteredPosts.filter(post =>
        post.category.toLowerCase() === params.category!.toLowerCase()
      );
    }

    // Sort by date
    filteredPosts.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Apply pagination with validated parameters
    const paginatedPosts = filteredPosts.slice(offset, offset + limit);

    const response: PostListResponse = {
      posts: paginatedPosts,
      total: filteredPosts.length,
    };

    return ResponseHandler.success(
      c,
      response,
      'Lấy danh sách bài viết thành công'
    );
  } catch (error: any) {
    console.error('Error getting posts:', error);
    
    // Handle JSON parse error for tags
    if (error instanceof SyntaxError) {
      return ResponseHandler.error(
        c,
        'Định dạng tags không hợp lệ',
        'INVALID_TAGS_FORMAT',
        400
      );
    }
    
    return ResponseHandler.error(
      c,
      'Lỗi hệ thống',
      'INTERNAL_SERVER_ERROR',
      500
    );
  }
});

export default postRoutes;
