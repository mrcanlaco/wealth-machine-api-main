export const fund = {
  schemas: {
    Fund: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        machine_id: { type: 'string', format: 'uuid' },
        store_id: { type: 'string', format: 'uuid' },
        name: { type: 'string' },
        icon: { type: 'string' },
        balance: { type: 'number', minimum: 0 },
        percent: { type: 'number', minimum: 0, maximum: 100 },
        config: { type: 'object', default: {} },
        meta: { type: 'object', default: {} },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' }
      }
    },
    FundCreateRequest: {
      type: 'object',
      properties: {
        store_id: { type: 'string', format: 'uuid' },
        name: { type: 'string' },
        icon: { type: 'string' },
        balance: { type: 'number', minimum: 0 },
        percent: { type: 'number', minimum: 0, maximum: 100 },
        config: { type: 'object' },
        meta: { type: 'object' }
      },
      required: ['name', 'store_id']
    },
    FundUpdateRequest: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        icon: { type: 'string' },
        percent: { type: 'number', minimum: 0, maximum: 100 },
        config: { type: 'object' },
        meta: { type: 'object' }
      }
    }
  },
  paths: {
    '/api/funds': {
      post: {
        tags: ['Quỹ'],
        summary: 'Tạo quỹ mới',
        security: [{ bearerAuth: [], machineId: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/FundCreateRequest' }
            }
          }
        },
        responses: {
          '201': {
            description: 'Tạo quỹ thành công',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/StandardResponse' },
                    {
                      properties: {
                        success: { type: 'boolean', default: true },
                        data: { $ref: '#/components/schemas/Fund' },
                        message: { type: 'string', default: 'Tạo quỹ thành công' }
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
        tags: ['Quỹ'],
        summary: 'Lấy danh sách quỹ',
        security: [{ bearerAuth: [], machineId: [] }],
        parameters: [
          {
            in: 'query',
            name: 'type',
            schema: { type: 'string', enum: ['SAVING', 'INVESTMENT', 'EMERGENCY', 'OTHER'] },
            description: 'Loại quỹ'
          },
          {
            in: 'query',
            name: 'status',
            schema: { type: 'string', enum: ['ACTIVE', 'INACTIVE'] },
            description: 'Trạng thái quỹ'
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
            description: 'Lấy danh sách quỹ thành công',
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
                          items: { $ref: '#/components/schemas/Fund' }
                        },
                        message: { type: 'string', default: 'Lấy danh sách quỹ thành công' }
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
    '/api/funds/{id}': {
      get: {
        tags: ['Quỹ'],
        summary: 'Lấy thông tin quỹ',
        security: [{ bearerAuth: [], machineId: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            schema: { type: 'string', format: 'uuid' },
            required: true,
            description: 'ID của quỹ'
          }
        ],
        responses: {
          '200': {
            description: 'Lấy thông tin quỹ thành công',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/StandardResponse' },
                    {
                      properties: {
                        success: { type: 'boolean', default: true },
                        data: { $ref: '#/components/schemas/Fund' },
                        message: { type: 'string', default: 'Lấy thông tin quỹ thành công' }
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
            description: 'Không tìm thấy quỹ',
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
        tags: ['Quỹ'],
        summary: 'Cập nhật thông tin quỹ',
        security: [{ bearerAuth: [], machineId: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            schema: { type: 'string', format: 'uuid' },
            required: true,
            description: 'ID của quỹ'
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/FundUpdateRequest' }
            }
          }
        },
        responses: {
          '200': {
            description: 'Cập nhật quỹ thành công',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/StandardResponse' },
                    {
                      properties: {
                        success: { type: 'boolean', default: true },
                        data: { $ref: '#/components/schemas/Fund' },
                        message: { type: 'string', default: 'Cập nhật quỹ thành công' }
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
            description: 'Không tìm thấy quỹ',
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
        tags: ['Quỹ'],
        summary: 'Xóa quỹ',
        security: [{ bearerAuth: [], machineId: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            schema: { type: 'string', format: 'uuid' },
            required: true,
            description: 'ID của quỹ'
          }
        ],
        responses: {
          '200': {
            description: 'Xóa quỹ thành công',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/StandardResponse' },
                    {
                      properties: {
                        success: { type: 'boolean', default: true },
                        data: { type: 'null' },
                        message: { type: 'string', default: 'Xóa quỹ thành công' }
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
            description: 'Không tìm thấy quỹ',
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
