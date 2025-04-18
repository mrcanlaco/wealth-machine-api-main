export const auth = {
  schemas: {
    RegisterRequest: {
      type: 'object',
      properties: {
        email: { type: 'string', format: 'email' },
        password: { type: 'string', minLength: 8 },
        full_name: { type: 'string', minLength: 2 }
      },
      required: ['email', 'password', 'full_name']
    },
    LoginRequest: {
      type: 'object',
      properties: {
        email: { type: 'string', format: 'email' },
        password: { type: 'string', minLength: 1 }
      },
      required: ['email', 'password']
    },
    RefreshTokenRequest: {
      type: 'object',
      properties: {
        refreshToken: { type: 'string', minLength: 1 }
      },
      required: ['refreshToken']
    },
    AuthUser: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        email: { type: 'string', format: 'email' },
        full_name: { type: 'string' },
        role: { type: 'string' }
      }
    },
    AuthTokens: {
      type: 'object',
      properties: {
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' }
      }
    },
    AuthResponse: {
      type: 'object',
      properties: {
        user: { $ref: '#/components/schemas/AuthUser' },
        tokens: { $ref: '#/components/schemas/AuthTokens' }
      }
    }
  },
  paths: {
    '/api/auth/register': {
      post: {
        tags: ['Xác thực'],
        summary: 'Đăng ký người dùng mới',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterRequest' }
            }
          }
        },
        responses: {
          '201': {
            description: 'Đăng ký người dùng thành công',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/StandardResponse' },
                    {
                      properties: {
                        success: { type: 'boolean', default: true },
                        data: { $ref: '#/components/schemas/AuthResponse' },
                        message: { type: 'string', default: 'Đăng ký tài khoản thành công' }
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
    '/api/auth/login': {
      post: {
        tags: ['Xác thực'],
        summary: 'Đăng nhập vào hệ thống',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' }
            }
          }
        },
        responses: {
          '200': {
            description: 'Đăng nhập thành công',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/StandardResponse' },
                    {
                      properties: {
                        success: { type: 'boolean', default: true },
                        data: { $ref: '#/components/schemas/AuthResponse' },
                        message: { type: 'string', default: 'Đăng nhập thành công' }
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
            description: 'Thông tin đăng nhập không chính xác',
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
    '/api/auth/refresh': {
      post: {
        tags: ['Xác thực'],
        summary: 'Làm mới token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RefreshTokenRequest' }
            }
          }
        },
        responses: {
          '200': {
            description: 'Làm mới token thành công',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/StandardResponse' },
                    {
                      properties: {
                        success: { type: 'boolean', default: true },
                        data: { $ref: '#/components/schemas/AuthTokens' },
                        message: { type: 'string', default: 'Làm mới token thành công' }
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
            description: 'Token không hợp lệ hoặc hết hạn',
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
    '/api/auth/profile': {
      get: {
        tags: ['Xác thực'],
        summary: 'Lấy thông tin người dùng',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Thành công',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'boolean', default: true },
                    message: { type: 'string' },
                    data: { $ref: '#/components/schemas/AuthUser' }
                  }
                }
              }
            }
          },
          '401': {
            description: 'Không có quyền truy cập',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'boolean', default: false },
                    message: { type: 'string' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/auth/logout': {
      post: {
        tags: ['Xác thực'],
        summary: 'Đăng xuất khỏi hệ thống',
        security: [
          {
            bearerAuth: []
          }
        ],
        responses: {
          '200': {
            description: 'Đăng xuất thành công',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/StandardResponse' },
                    {
                      properties: {
                        success: { type: 'boolean', default: true },
                        data: { type: 'null' },
                        message: { type: 'string', default: 'Đăng xuất thành công' }
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
