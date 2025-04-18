export const wallet = {
  schemas: {
    Wallet: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        machine_id: { type: 'string', format: 'uuid' },
        name: { type: 'string' },
        icon: { type: 'string' },
        type: { type: 'string', enum: ['cash', 'bank', 'crypto', 'savings'] },
        balance: { type: 'number', minimum: 0 },
        currency: { type: 'string', default: 'VND' },
        config: { type: 'object', default: {} },
        meta: { type: 'object', default: {} },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' }
      }
    },
    WalletCreateRequest: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        icon: { type: 'string' },
        type: { type: 'string', enum: ['cash', 'bank', 'crypto', 'savings'] },
        currency: { type: 'string', default: 'VND' },
        balance: { type: 'number', minimum: 0 },
        config: { type: 'object' },
        meta: { type: 'object' }
      },
      required: ['name', 'type']
    },
    WalletUpdateRequest: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        icon: { type: 'string' },
        balance: { type: 'number', minimum: 0 },
        config: { type: 'object' },
        meta: { type: 'object' }
      }
    }
  },
  paths: {
    '/api/wallets': {
      post: {
        tags: ['Ví'],
        summary: 'Tạo ví mới',
        security: [{ bearerAuth: [], machineId: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/WalletCreateRequest' }
            }
          }
        },
        responses: {
          '201': {
            description: 'Tạo ví thành công',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/StandardResponse' },
                    {
                      properties: {
                        success: { type: 'boolean', default: true },
                        data: { $ref: '#/components/schemas/Wallet' },
                        message: { type: 'string', default: 'Tạo ví thành công' }
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
        tags: ['Ví'],
        summary: 'Lấy danh sách ví',
        security: [{ bearerAuth: [], machineId: [] }],
        parameters: [
          {
            in: 'query',
            name: 'type',
            schema: { type: 'string', enum: ['cash', 'bank', 'crypto', 'savings'] },
            description: 'Loại ví'
          },
          {
            in: 'query',
            name: 'status',
            schema: { type: 'string', enum: ['ACTIVE', 'INACTIVE'] },
            description: 'Trạng thái ví'
          },
          {
            in: 'query',
            name: 'currency',
            schema: { type: 'string', enum: ['VND', 'USD'] },
            description: 'Loại tiền tệ'
          },
          {
            in: 'query',
            name: 'limit',
            schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
            description: 'Số lượng kết quả trả về'
          },
          {
            in: 'query',
            name: 'offset',
            schema: { type: 'integer', minimum: 0, default: 0 },
            description: 'Vị trí bắt đầu'
          }
        ],
        responses: {
          '200': {
            description: 'Lấy danh sách ví thành công',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/StandardResponse' },
                    {
                      properties: {
                        success: { type: 'boolean', default: true },
                        data: {
                          type: 'array',
                          items: { $ref: '#/components/schemas/Wallet' }
                        },
                        message: { type: 'string', default: 'Lấy danh sách ví thành công' }
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
    },
    '/api/wallets/{id}': {
      get: {
        tags: ['Ví'],
        summary: 'Lấy thông tin ví',
        security: [{ bearerAuth: [], machineId: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            schema: { type: 'string', format: 'uuid' },
            required: true,
            description: 'ID của ví'
          }
        ],
        responses: {
          '200': {
            description: 'Lấy thông tin ví thành công',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/StandardResponse' },
                    {
                      properties: {
                        success: { type: 'boolean', default: true },
                        data: { $ref: '#/components/schemas/Wallet' },
                        message: { type: 'string', default: 'Lấy thông tin ví thành công' }
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
          '404': {
            description: 'Không tìm thấy ví',
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
      put: {
        tags: ['Ví'],
        summary: 'Cập nhật thông tin ví',
        security: [{ bearerAuth: [], machineId: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            schema: { type: 'string', format: 'uuid' },
            required: true,
            description: 'ID của ví'
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/WalletUpdateRequest' }
            }
          }
        },
        responses: {
          '200': {
            description: 'Cập nhật ví thành công',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/StandardResponse' },
                    {
                      properties: {
                        success: { type: 'boolean', default: true },
                        data: { $ref: '#/components/schemas/Wallet' },
                        message: { type: 'string', default: 'Cập nhật ví thành công' }
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
          '404': {
            description: 'Không tìm thấy ví',
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
      delete: {
        tags: ['Ví'],
        summary: 'Xóa ví',
        security: [{ bearerAuth: [], machineId: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            schema: { type: 'string', format: 'uuid' },
            required: true,
            description: 'ID của ví'
          }
        ],
        responses: {
          '200': {
            description: 'Xóa ví thành công',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/StandardResponse' },
                    {
                      properties: {
                        success: { type: 'boolean', default: true },
                        data: { type: 'null' },
                        message: { type: 'string', default: 'Xóa ví thành công' }
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
          '404': {
            description: 'Không tìm thấy ví',
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
