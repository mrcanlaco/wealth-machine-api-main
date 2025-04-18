export const chat = {
  schemas: {
    ChatMessage: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        machine_id: { type: 'string', format: 'uuid' },
        role: { type: 'string', enum: ['USER', 'ASSISTANT'] },
        content: { type: 'string' },
        created_at: { type: 'string', format: 'date-time' }
      }
    },
    ChatMessageCreateRequest: {
      type: 'object',
      properties: {
        content: { type: 'string' }
      },
      required: ['content']
    }
  },
  paths: {
    '/api/chat/messages': {
      post: {
        tags: ['Trò chuyện'],
        summary: 'Gửi tin nhắn mới',
        security: [{ bearerAuth: [], machineId: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ChatMessageCreateRequest' }
            }
          }
        },
        responses: {
          '201': {
            description: 'Gửi tin nhắn thành công',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/StandardResponse' },
                    {
                      properties: {
                        data: { $ref: '#/components/schemas/ChatMessage' }
                      }
                    }
                  ]
                }
              }
            }
          },
          '400': {
            description: 'Dữ liệu đầu vào không hợp lệ',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          },
          '401': {
            description: 'Không có quyền truy cập',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          },
          '500': {
            description: 'Lỗi hệ thống',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      },
      get: {
        tags: ['Trò chuyện'],
        summary: 'Lấy lịch sử tin nhắn',
        security: [{ bearerAuth: [], machineId: [] }],
        parameters: [
          {
            in: 'query',
            name: 'limit',
            schema: { type: 'integer', minimum: 1, maximum: 100, default: 50 },
            description: 'Số lượng tin nhắn trả về'
          },
          {
            in: 'query',
            name: 'before',
            schema: { type: 'string', format: 'date-time' },
            description: 'Lấy tin nhắn trước thời điểm này'
          }
        ],
        responses: {
          '200': {
            description: 'Lấy lịch sử tin nhắn thành công',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/StandardResponse' },
                    {
                      properties: {
                        data: {
                          type: 'array',
                          items: { $ref: '#/components/schemas/ChatMessage' }
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          '401': {
            description: 'Không có quyền truy cập',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          },
          '500': {
            description: 'Lỗi hệ thống',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      }
    }
  }
};
