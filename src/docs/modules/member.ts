export const member = {
  schemas: {
    MachineUser: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        machine_id: { type: 'string', format: 'uuid' },
        user_id: { type: 'string', format: 'uuid' },
        role: { type: 'string', enum: ['owner', 'member'] },
        joined_at: { type: 'string', format: 'date-time' },
        invited_by: { type: 'string', format: 'uuid' },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' }
      }
    },
    MachineInvitation: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        machine_id: { type: 'string', format: 'uuid' },
        invited_email: { type: 'string', format: 'email' },
        invited_by: { type: 'string', format: 'uuid' },
        status: { type: 'string', enum: ['pending', 'accepted', 'rejected'] },
        expires_at: { type: 'string', format: 'date-time' },
        created_at: { type: 'string', format: 'date-time' }
      }
    },
    CreateInvitation: {
      type: 'object',
      properties: {
        invited_email: { type: 'string', format: 'email' },
        expires_at: { type: 'string', format: 'date-time' }
      },
      required: ['invited_email', 'expires_at']
    }
  },
  paths: {
    '/api/machine-users': {
      get: {
        tags: ['Thành viên'],
        summary: 'Danh sách thành viên',
        security: [{ bearerAuth: [], machineId: [] }],
        responses: {
          '200': {
            description: 'Thành công',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/MachineUser' }
                    }
                  }
                }
              }
            }
          },
          '401': { description: 'Không có quyền truy cập' },
          '400': { description: 'Lỗi yêu cầu' }
        }
      }
    },
    '/api/machine-users/{id}': {
      delete: {
        tags: ['Thành viên'],
        summary: 'Xóa thành viên',
        security: [{ bearerAuth: [], machineId: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' }
          }
        ],
        responses: {
          '200': { description: 'Xóa thành công' },
          '401': { description: 'Không có quyền truy cập' },
          '404': { description: 'Không tìm thấy thành viên' }
        }
      }
    },
    '/api/machine-invitations': {
      post: {
        tags: ['Thành viên'],
        summary: 'Tạo lời mời',
        security: [{ bearerAuth: [], machineId: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateInvitation' }
            }
          }
        },
        responses: {
          '201': {
            description: 'Tạo lời mời thành công',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/MachineInvitation' }
              }
            }
          },
          '401': { description: 'Không có quyền truy cập' },
          '400': { description: 'Lỗi yêu cầu' }
        }
      },
      get: {
        tags: ['Thành viên'],
        summary: 'Danh sách lời mời',
        security: [{ bearerAuth: [], machineId: [] }],
        responses: {
          '200': {
            description: 'Thành công',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/MachineInvitation' }
                    }
                  }
                }
              }
            }
          },
          '401': { description: 'Không có quyền truy cập' },
          '400': { description: 'Lỗi yêu cầu' }
        }
      }
    }
  }
};
