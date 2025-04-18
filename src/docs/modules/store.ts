export const store = {
  schemas: {
    Store: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        machine_id: { type: 'string', format: 'uuid' },
        name: { type: 'string' },
        icon: { type: 'string' },
        type: { 
          type: 'string', 
          enum: ['income', 'expense', 'reserve', 'expansion', 'business']
        },
        config: { type: 'object', default: {} },
        meta: { type: 'object', default: {} },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' }
      }
    },
    StoreCreateRequest: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        icon: { type: 'string' },
        type: { 
          type: 'string', 
          enum: ['income', 'expense', 'reserve', 'expansion', 'business']
        },
        config: { type: 'object' },
        meta: { type: 'object' }
      },
      required: ['name', 'type']
    },
    StoreUpdateRequest: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        icon: { type: 'string' },
        config: { type: 'object' },
        meta: { type: 'object' }
      }
    }
  },
  paths: {
    '/api/stores': {
      post: {
        tags: ['Kho'],
        summary: 'Tạo kho mới',
        security: [{ bearerAuth: [], machineId: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/StoreCreateRequest' }
            }
          }
        },
        responses: {
          '201': {
            description: 'Tạo kho thành công',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/StandardResponse' },
                    {
                      properties: {
                        success: { type: 'boolean', default: true },
                        data: { $ref: '#/components/schemas/Store' },
                        message: { type: 'string', default: 'Tạo kho thành công' }
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
        tags: ['Kho'],
        summary: 'Lấy danh sách kho',
        security: [{ bearerAuth: [], machineId: [] }],
        parameters: [
          {
            in: 'query',
            name: 'type',
            schema: { type: 'string', enum: ['income', 'expense', 'reserve', 'expansion', 'business'] },
            description: 'Loại kho'
          },
          {
            in: 'query',
            name: 'status',
            schema: { type: 'string', enum: ['ACTIVE', 'INACTIVE'] },
            description: 'Trạng thái kho'
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
            description: 'Lấy danh sách kho thành công',
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
                          items: { $ref: '#/components/schemas/Store' }
                        },
                        message: { type: 'string', default: 'Lấy danh sách kho thành công' }
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
    '/api/stores/{id}': {
      get: {
        tags: ['Kho'],
        summary: 'Lấy thông tin kho',
        security: [{ bearerAuth: [], machineId: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            schema: { type: 'string', format: 'uuid' },
            required: true,
            description: 'ID của kho'
          }
        ],
        responses: {
          '200': {
            description: 'Lấy thông tin kho thành công',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/StandardResponse' },
                    {
                      properties: {
                        success: { type: 'boolean', default: true },
                        data: { $ref: '#/components/schemas/Store' },
                        message: { type: 'string', default: 'Lấy thông tin kho thành công' }
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
            description: 'Không tìm thấy kho',
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
        tags: ['Kho'],
        summary: 'Cập nhật thông tin kho',
        security: [{ bearerAuth: [], machineId: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            schema: { type: 'string', format: 'uuid' },
            required: true,
            description: 'ID của kho'
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/StoreUpdateRequest' }
            }
          }
        },
        responses: {
          '200': {
            description: 'Cập nhật kho thành công',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/StandardResponse' },
                    {
                      properties: {
                        success: { type: 'boolean', default: true },
                        data: { $ref: '#/components/schemas/Store' },
                        message: { type: 'string', default: 'Cập nhật kho thành công' }
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
            description: 'Không tìm thấy kho',
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
        tags: ['Kho'],
        summary: 'Xóa kho',
        security: [{ bearerAuth: [], machineId: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            schema: { type: 'string', format: 'uuid' },
            required: true,
            description: 'ID của kho'
          }
        ],
        responses: {
          '200': {
            description: 'Xóa kho thành công',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/StandardResponse' },
                    {
                      properties: {
                        success: { type: 'boolean', default: true },
                        data: { type: 'null' },
                        message: { type: 'string', default: 'Xóa kho thành công' }
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
            description: 'Không tìm thấy kho',
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
