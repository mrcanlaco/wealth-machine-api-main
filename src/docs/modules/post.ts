export const post = {
  schemas: {
    PostType: {
      type: 'string',
      enum: ['post', 'page'],
      description: 'Loại bài viết'
    },
    PostFormat: {
      type: 'string',
      enum: ['markdown', 'html'],
      description: 'Định dạng nội dung'
    },
    Post: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        title: { type: 'string' },
        slug: { type: 'string' },
        content: { type: 'string' },
        description: { type: 'string' },
        imageUrl: { type: 'string' },
        tags: {
          type: 'array',
          items: { type: 'string' }
        },
        category: { type: 'string' },
        type: { $ref: '#/components/schemas/PostType' },
        format: { $ref: '#/components/schemas/PostFormat' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
      }
    },
    PostListResponse: {
      type: 'object',
      properties: {
        posts: {
          type: 'array',
          items: { $ref: '#/components/schemas/Post' }
        },
        total: { type: 'number' }
      }
    }
  },
  paths: {
    '/api/posts': {
      get: {
        tags: ['Bài viết'],
        summary: 'Lấy danh sách bài viết',
        parameters: [
          {
            in: 'query',
            name: 'keyword',
            schema: { type: 'string' },
            description: 'Từ khóa tìm kiếm'
          },
          {
            in: 'query',
            name: 'tags',
            schema: {
              type: 'string',
              description: 'JSON array of tags'
            },
            description: 'Danh sách tags (định dạng JSON array)'
          },
          {
            in: 'query',
            name: 'category',
            schema: { type: 'string' },
            description: 'Danh mục bài viết'
          },
          {
            in: 'query',
            name: 'limit',
            schema: {
              type: 'integer',
              minimum: 1,
              maximum: 100,
              default: 10
            },
            description: 'Số lượng bài viết trên một trang'
          },
          {
            in: 'query',
            name: 'offset',
            schema: {
              type: 'integer',
              minimum: 0,
              default: 0
            },
            description: 'Vị trí bắt đầu'
          }
        ],
        responses: {
          '200': {
            description: 'Lấy danh sách bài viết thành công',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Lấy danh sách bài viết thành công' },
                    data: { $ref: '#/components/schemas/PostListResponse' }
                  }
                }
              }
            }
          },
          '400': {
            description: 'Lỗi định dạng tham số',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: false },
                    message: { type: 'string', example: 'Định dạng tags không hợp lệ' },
                    error: { type: 'string', example: 'INVALID_TAGS_FORMAT' }
                  }
                }
              }
            }
          },
          '500': {
            description: 'Lỗi hệ thống',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: false },
                    message: { type: 'string', example: 'Lỗi hệ thống' },
                    error: { type: 'string', example: 'INTERNAL_SERVER_ERROR' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/posts/{slug}': {
      get: {
        tags: ['Bài viết'],
        summary: 'Lấy thông tin một bài viết',
        parameters: [
          {
            in: 'path',
            name: 'slug',
            required: true,
            schema: { type: 'string' },
            description: 'Slug của bài viết'
          }
        ],
        responses: {
          '200': {
            description: 'Lấy bài viết thành công',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Lấy bài viết thành công' },
                    data: { $ref: '#/components/schemas/Post' }
                  }
                }
              }
            }
          },
          '404': {
            description: 'Không tìm thấy bài viết',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: false },
                    message: { type: 'string', example: 'Không tìm thấy bài viết' },
                    error: { type: 'string', example: 'POST_NOT_FOUND' }
                  }
                }
              }
            }
          },
          '500': {
            description: 'Lỗi hệ thống',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: false },
                    message: { type: 'string', example: 'Lỗi hệ thống' },
                    error: { type: 'string', example: 'INTERNAL_SERVER_ERROR' }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};
