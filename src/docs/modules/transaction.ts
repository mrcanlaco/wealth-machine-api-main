export const transaction = {
  schemas: {
    Transaction: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        machine_id: { type: 'string', format: 'uuid' },
        from_wallet_id: { type: 'string', format: 'uuid' },
        to_wallet_id: { type: 'string', format: 'uuid' },
        from_fund_id: { type: 'string', format: 'uuid' },
        to_fund_id: { type: 'string', format: 'uuid' },
        type: { 
          type: 'string', 
          description: `Loại giao dịch:
            - income: Thu tiền vào kho income
            - expense: Chi tiền từ kho income
            - borrow: Vay tiền vào kho income
            - collect: Thu hồi tiền cho vay vào kho income
            - lend: Cho vay từ kho income
            - repay: Trả nợ từ kho income
            - transfer_refundable: Chuyển tiền giữa các quỹ (có thể hoàn lại)
            - transfer_non_refundable: Chuyển tiền giữa các quỹ (không thể hoàn lại)
            - money_transfer: Chuyển tiền giữa các ví
            - allocation: Phân bổ từ số dư chưa phân bổ vào quỹ`,
          enum: ['income', 'expense', 'borrow', 'collect', 'lend', 'repay', 'transfer_refundable', 'transfer_non_refundable', 'money_transfer', 'allocation']
        },
        status: {
          type: 'string',
          enum: ['pending', 'completed', 'cancelled', 'failed']
        },
        amount: { type: 'number', minimum: 0 },
        currency: { type: 'string', default: 'VND' },
        exchange_rate: { type: 'number', minimum: 0, default: 1 },
        note: { type: 'string' },
        category: { type: 'string' },
        tags: { type: 'array', items: { type: 'string' } },
        location: { type: 'object' },
        participants: { type: 'array', items: { type: 'string' } },
        images: { type: 'array', items: { type: 'string' } },
        event: { type: 'string' },
        reminder: { type: 'object' },
        related_transaction_id: { type: 'string', format: 'uuid' },
        meta: { type: 'object', default: {} },
        created_by: { type: 'string', format: 'uuid' },
        updated_by: { type: 'string', format: 'uuid' },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' },
        related_transactions: { 
          type: 'array', 
          items: { $ref: '#/components/schemas/Transaction' },
          description: 'Danh sách các giao dịch liên quan (giao dịch con)'
        }
      }
    },
    TransactionCreateRequest: {
      type: 'object',
      required: ['type', 'amount'],
      properties: {
        from_wallet_id: { type: 'string', format: 'uuid' },
        to_wallet_id: { type: 'string', format: 'uuid' },
        from_fund_id: { type: 'string', format: 'uuid' },
        to_fund_id: { type: 'string', format: 'uuid' },
        type: { 
          type: 'string', 
          description: `Loại giao dịch:
            - income: Thu tiền vào kho income
            - expense: Chi tiền từ kho income
            - borrow: Vay tiền vào kho income
            - collect: Thu hồi tiền cho vay vào kho income
            - lend: Cho vay từ kho income
            - repay: Trả nợ từ kho income
            - transfer_refundable: Chuyển tiền giữa các quỹ (có thể hoàn lại)
            - transfer_non_refundable: Chuyển tiền giữa các quỹ (không thể hoàn lại)
            - money_transfer: Chuyển tiền giữa các ví
            - allocation: Phân bổ từ số dư chưa phân bổ vào quỹ`,
          enum: ['income', 'expense', 'borrow', 'collect', 'lend', 'repay', 'transfer_refundable', 'transfer_non_refundable', 'money_transfer', 'allocation']
        },
        amount: { type: 'number', minimum: 0 },
        currency: { type: 'string', default: 'VND' },
        exchange_rate: { type: 'number', minimum: 0, default: 1 },
        note: { type: 'string' },
        category: { type: 'string' },
        tags: { type: 'array', items: { type: 'string' } },
        location: { type: 'object' },
        participants: { type: 'array', items: { type: 'string' } },
        images: { type: 'array', items: { type: 'string' } },
        event: { type: 'string' },
        reminder: { type: 'object' },
        related_transaction_id: { type: 'string', format: 'uuid' },
        meta: { type: 'object' }
      },
      allOf: [
        {
          if: {
            properties: { type: { enum: ['income', 'borrow', 'collect'] } }
          },
          then: {
            required: ['to_fund_id', 'to_wallet_id']
          }
        },
        {
          if: {
            properties: { type: { enum: ['expense', 'lend', 'repay'] } }
          },
          then: {
            required: ['from_fund_id', 'from_wallet_id']
          }
        },
        {
          if: {
            properties: { type: { enum: ['transfer_refundable', 'transfer_non_refundable'] } }
          },
          then: {
            required: ['from_fund_id', 'to_fund_id']
          }
        },
        {
          if: {
            properties: { type: { enum: ['money_transfer'] } }
          },
          then: {
            required: ['from_wallet_id', 'to_wallet_id']
          }
        },
        {
          if: {
            properties: { type: { enum: ['allocation'] } }
          },
          then: {
            required: ['to_fund_id']
          }
        }
      ]
    },
    TransactionUpdateRequest: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['pending', 'completed', 'cancelled', 'failed']
        },
        note: { type: 'string' },
        category: { type: 'string' },
        tags: { type: 'array', items: { type: 'string' } },
        location: { type: 'object' },
        participants: { type: 'array', items: { type: 'string' } },
        images: { type: 'array', items: { type: 'string' } },
        event: { type: 'string' },
        reminder: { type: 'object' },
        meta: { type: 'object' }
      }
    },
    TransactionWithRelations: {
      allOf: [
        { $ref: '#/components/schemas/Transaction' },
        {
          type: 'object',
          properties: {
            from_wallet: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                name: { type: 'string' }
              }
            },
            to_wallet: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                name: { type: 'string' }
              }
            },
            from_fund: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                name: { type: 'string' }
              }
            },
            to_fund: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                name: { type: 'string' }
              }
            },
            related_transaction: { $ref: '#/components/schemas/Transaction' }
          }
        }
      ]
    },
    AllocationRequest: {
      type: 'object',
      required: ['allocations'],
      properties: {
        allocations: {
          type: 'array',
          items: {
            type: 'object',
            required: ['fund_id', 'amount'],
            properties: {
              fund_id: { type: 'string', format: 'uuid', description: 'ID quỹ cần phân bổ' },
              amount: { type: 'number', minimum: 0, description: 'Số tiền cần phân bổ' }
            }
          }
        }
      }
    }
  },
  paths: {
    '/api/transactions': {
      post: {
        tags: ['Giao dịch'],
        summary: 'Tạo giao dịch mới',
        security: [{ bearerAuth: [], machineId: [] }],
        parameters: [
          { $ref: '#/components/parameters/MachineId' }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/TransactionCreateRequest' }
            }
          }
        },
        responses: {
          '201': {
            description: 'Giao dịch đã được tạo',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Transaction' }
              }
            }
          }
        }
      },
      get: {
        tags: ['Giao dịch'],
        summary: 'Lấy danh sách giao dịch',
        security: [{ bearerAuth: [], machineId: [] }],
        parameters: [
          {
            name: 'startDate',
            in: 'query',
            description: 'Ngày bắt đầu (YYYY-MM-DD)',
            schema: { type: 'string', format: 'date' }
          },
          {
            name: 'endDate',
            in: 'query',
            description: 'Ngày kết thúc (YYYY-MM-DD)',
            schema: { type: 'string', format: 'date' }
          },
          {
            name: 'funds',
            in: 'query',
            description: 'Danh sách ID quỹ (phân cách bởi dấu phẩy)',
            schema: { type: 'string' },
            example: '258cb25b-97ea-4105-a139-06b4fbbe87eb,b4552bae-0fcc-4bc5-9241-766e95599ce9'
          },
          {
            name: 'wallets',
            in: 'query',
            description: 'Danh sách ID ví (phân cách bởi dấu phẩy)',
            schema: { type: 'string' }
          },
          {
            name: 'tags',
            in: 'query',
            description: 'Danh sách tag (phân cách bởi dấu phẩy)',
            schema: { type: 'string' }
          },
          {
            name: 'limit',
            in: 'query',
            description: 'Số lượng kết quả tối đa',
            schema: { type: 'integer', default: 100 }
          },
          {
            name: 'offset',
            in: 'query',
            description: 'Vị trí bắt đầu',
            schema: { type: 'integer', default: 0 }
          }
        ],
        responses: {
          '200': {
            description: 'Thành công',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    transactions: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Transaction' }
                    },
                    total: { type: 'number', description: 'Tổng số giao dịch' }
                  }
                }
              }
            }
          },
          '400': {
            description: 'Lỗi validation',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { 
                      type: 'string',
                      description: 'Thông báo lỗi',
                      example: 'Limit phải lớn hơn 0'
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/transactions/report': {
      get: {
        tags: ['Giao dịch'],
        summary: 'Lấy báo cáo giao dịch',
        security: [{ bearerAuth: [], machineId: [] }],
        parameters: [
          {
            name: 'startDate',
            in: 'query',
            schema: { type: 'string', format: 'date' },
            description: 'Ngày bắt đầu (định dạng YYYY-MM-DD)',
            example: '2024-11-01'
          },
          {
            name: 'endDate',
            in: 'query',
            schema: { type: 'string', format: 'date' },
            description: 'Ngày kết thúc (định dạng YYYY-MM-DD)',
            example: '2024-11-30'
          },
          {
            name: 'funds[]',
            in: 'query',
            schema: { type: 'array', items: { type: 'string', format: 'uuid' } },
            description: 'Danh sách ID quỹ (UUID)',
            example: ['ccc5bcc1-5caf-4ab4-9cda-e88a23d76701']
          },
          {
            name: 'stores[]',
            in: 'query',
            schema: { type: 'array', items: { type: 'string', format: 'uuid' } },
            description: 'Danh sách ID cửa hàng (UUID)',
            example: ['531304c2-263d-45e8-9668-ec106a73a7e5']
          },
          {
            name: 'wallets[]',
            in: 'query',
            schema: { type: 'array', items: { type: 'string', format: 'uuid' } },
            description: 'Danh sách ID ví (UUID)',
            example: ['dfc24aa2-7ca9-40e7-965b-9e59bc1ec16d']
          },
          {
            name: 'tags[]',
            in: 'query',
            schema: { type: 'array', items: { type: 'string' } },
            description: 'Danh sách tag',
            example: ['food', 'shopping']
          }
        ],
        responses: {
          '200': {
            description: 'Thành công',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    startBalance: { type: 'number', description: 'Số dư đầu kỳ' },
                    endBalance: { type: 'number', description: 'Số dư cuối kỳ' },
                    difference: { type: 'number', description: 'Chênh lệch' },
                    percentageChange: { type: 'number', description: 'Phần trăm thay đổi' }
                  }
                }
              }
            }
          },
          '400': {
            description: 'Lỗi validation',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { 
                      type: 'string',
                      description: 'Thông báo lỗi',
                      example: 'Ngày bắt đầu phải có định dạng YYYY-MM-DD'
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/transactions/{id}': {
      get: {
        tags: ['Giao dịch'],
        summary: 'Lấy thông tin giao dịch theo ID',
        security: [{ bearerAuth: [], machineId: [] }],
        parameters: [
          { $ref: '#/components/parameters/MachineId' },
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' }
          }
        ],
        responses: {
          '200': {
            description: 'Thông tin giao dịch',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Transaction' }
              }
            }
          }
        }
      },
      put: {
        tags: ['Giao dịch'],
        summary: 'Cập nhật giao dịch',
        security: [{ bearerAuth: [], machineId: [] }],
        parameters: [
          { $ref: '#/components/parameters/MachineId' },
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/TransactionUpdateRequest' }
            }
          }
        },
        responses: {
          '200': {
            description: 'Giao dịch đã được cập nhật',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Transaction' }
              }
            }
          }
        }
      },
      delete: {
        tags: ['Giao dịch'],
        summary: 'Xóa giao dịch',
        security: [{ bearerAuth: [], machineId: [] }],
        parameters: [
          { $ref: '#/components/parameters/MachineId' },
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' }
          }
        ],
        responses: {
          '200': {
            description: 'Giao dịch đã được xóa'
          }
        }
      }
    },
    '/api/transactions/allocate': {
      post: {
        tags: ['Giao dịch'],
        summary: 'Phân bổ số dư chưa phân bổ vào quỹ',
        description: 'Cho phép phân bổ một phần hoặc toàn bộ số dư chưa phân bổ vào các quỹ',
        security: [{ bearerAuth: [], machineId: [] }],
        parameters: [
          { $ref: '#/components/parameters/MachineId' }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AllocationRequest' }
            }
          }
        },
        responses: {
          '200': {
            description: 'Thành công',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'array',
                      items: {
                        type: 'object',
                        required: ['transaction_id', 'fund_id', 'amount', 'new_balance'],
                        properties: {
                          transaction_id: { 
                            type: 'string', 
                            format: 'uuid',
                            description: 'ID của giao dịch phân bổ' 
                          },
                          fund_id: { 
                            type: 'string', 
                            format: 'uuid',
                            description: 'ID của quỹ được phân bổ' 
                          },
                          amount: { 
                            type: 'number',
                            description: 'Số tiền đã phân bổ vào quỹ' 
                          },
                          new_balance: { 
                            type: 'number',
                            description: 'Số dư mới của quỹ sau khi phân bổ' 
                          }
                        }
                      }
                    },
                    message: {
                      type: 'string',
                      description: 'Thông báo kết quả',
                      example: 'Phân bổ số dư thành công'
                    }
                  }
                }
              }
            }
          },
          '400': {
            description: 'Lỗi validation',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { 
                      type: 'string',
                      description: 'Thông báo lỗi',
                      example: 'Số tiền phân bổ vượt quá số dư chưa phân bổ'
                    }
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
