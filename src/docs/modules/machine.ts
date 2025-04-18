export const machine = {
  schemas: {
    Machine: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        name: { type: 'string' },
        icon: { type: 'string' },
        currency: { type: 'string', default: 'VND' },
        config: { type: 'object' },
        meta: { type: 'object' },
        un_allocated: { type: 'number', format: 'decimal' },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' }
      },
      required: ['name']
    },
    MachineUpdate: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        icon: { type: 'string' },
        currency: { type: 'string' },
        config: { type: 'object' },
        meta: { type: 'object' }
      }
    },
    MachineMinimal: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        un_allocated: { type: 'number' },
        stores: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' }
            }
          }
        },
        funds: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              balance: { type: 'number' }
            }
          }
        },
        wallets: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              balance: { type: 'number' }
            }
          }
        }
      },
      required: ['id', 'un_allocated', 'stores', 'funds', 'wallets']
    },
    Tag: {
      type: 'object',
      required: ['label', 'color'],
      properties: {
        label: { type: 'string' },
        color: { type: 'string' },
        icon: { type: 'string' }
      }
    },
    StoresFundsRequest: {
      type: 'object',
      required: ['stores'],
      properties: {
        stores: {
          type: 'array',
          items: {
            type: 'object',
            required: ['name', 'type', 'action', 'funds'],
            properties: {
              id: { type: 'string', format: 'uuid' },
              name: { type: 'string' },
              icon: { type: 'string' },
              type: { type: 'string', enum: ['income', 'expense', 'reserve', 'expansion', 'business'] },
              action: { type: 'string', enum: ['create', 'update', 'delete'] },
              meta: {
                type: 'object',
                properties: {
                  tags: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Tag' }
                  }
                }
              },
              funds: {
                type: 'array',
                items: {
                  type: 'object',
                  required: ['name', 'percent', 'action'],
                  properties: {
                    id: { type: 'string', format: 'uuid' },
                    name: { type: 'string' },
                    icon: { type: 'string' },
                    percent: { type: 'number', minimum: 0, maximum: 100 },
                    action: { type: 'string', enum: ['create', 'update', 'delete'] }
                  }
                }
              }
            }
          }
        }
      },
      description: 'Tổng phần trăm các quỹ trong tất cả các kho (ngoại trừ income) không được vượt quá 100%'
    },
    StoresFundsResponse: {
      type: 'object',
      properties: {
        stores: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              action: { type: 'string', enum: ['created', 'updated', 'deleted'] }
            }
          }
        },
        funds: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              action: { type: 'string', enum: ['created', 'updated', 'deleted'] }
            }
          }
        }
      }
    }
  },
  paths: {
    '/api/machine/list': {
      get: {
        tags: ['Cỗ máy'],
        summary: 'Lấy danh sách máy',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Danh sách máy',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Machine' }
                }
              }
            }
          }
        }
      }
    },
    '/api/machine/create': {
      post: {
        tags: ['Cỗ máy'],
        summary: 'Tạo máy mới',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Machine' }
            }
          }
        },
        responses: {
          '201': {
            description: 'Tạo máy thành công',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Machine' }
              }
            }
          }
        }
      }
    },
    '/api/machine': {
      get: {
        tags: ['Cỗ máy'],
        summary: 'Lấy thông tin máy',
        security: [{ bearerAuth: [], machineHeader: [] }],
        responses: {
          '200': {
            description: 'Thông tin máy',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Machine' }
              }
            }
          }
        }
      },
      delete: {
        tags: ['Cỗ máy'],
        summary: 'Xoá máy',
        security: [{ bearerAuth: [], machineHeader: [] }],
        responses: {
          '200': {
            description: 'Xoá máy thành công'
          }
        }
      }
    },
    '/api/machine/minimal': {
      get: {
        tags: ['Cỗ máy'],
        summary: 'Lấy thông tin tối thiểu của máy',
        security: [{ bearerAuth: [], machineHeader: [] }],
        responses: {
          '200': {
            description: 'Thông tin tối thiểu của máy',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/MachineMinimal' }
              }
            }
          }
        }
      }
    },
    '/api/machine/basic-info': {
      put: {
        tags: ['Cỗ máy'],
        summary: 'Cập nhật thông tin cơ bản của máy',
        security: [{ bearerAuth: [], machineHeader: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/MachineUpdate' }
            }
          }
        },
        responses: {
          '200': {
            description: 'Cập nhật thành công',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Machine' }
              }
            }
          }
        }
      }
    },
    '/api/machine/stores-funds': {
      put: {
        tags: ['Cỗ máy'],
        summary: 'Quản lý kho và quỹ',
        security: [{ bearerAuth: [], machineHeader: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/StoresFundsRequest' }
            }
          }
        },
        responses: {
          '200': {
            description: 'Cập nhật kho và quỹ thành công',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/StoresFundsResponse' }
              }
            }
          },
          '400': {
            description: 'Dữ liệu không hợp lệ'
          },
          '401': {
            description: 'Chưa đăng nhập'
          },
          '403': {
            description: 'Không có quyền truy cập cỗ máy này'
          }
        }
      }
    }
  }
};
