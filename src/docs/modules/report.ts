export const report = {
  schemas: {
    Report: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        machine_id: { type: 'string', format: 'uuid' },
        type: { 
          type: 'string', 
          enum: ['overview', 'cashflow', 'balance', 'income', 'category', 'trend', 'prediction'] 
        },
        data: { type: 'object' },
        metadata: { type: 'object' },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' }
      }
    },
    ReportQuery: {
      type: 'object',
      properties: {
        type: { 
          type: 'string', 
          enum: ['overview', 'cashflow', 'balance', 'income', 'category', 'trend', 'prediction'] 
        },
        startDate: { type: 'string', format: 'date-time' },
        endDate: { type: 'string', format: 'date-time' },
        period: { 
          type: 'string', 
          enum: ['day', 'week', 'month', 'quarter', 'year']
        }
      }
    },
    ExportReportQuery: {
      type: 'object',
      properties: {
        type: { 
          type: 'string', 
          enum: ['overview', 'cashflow', 'balance', 'income', 'category', 'trend', 'prediction'],
          description: 'Loại báo cáo'
        },
        format: { 
          type: 'string', 
          enum: ['pdf', 'csv', 'excel'],
          default: 'pdf',
          description: 'Định dạng xuất báo cáo'
        },
        startDate: { 
          type: 'string', 
          format: 'date-time',
          description: 'Ngày bắt đầu' 
        },
        endDate: { 
          type: 'string', 
          format: 'date-time',
          description: 'Ngày kết thúc'
        },
        options: {
          type: 'object',
          properties: {
            includeCharts: { type: 'boolean' }
          }
        }
      },
      required: ['type', 'format']
    }
  },
  paths: {
    '/api/reports/overview': {
      get: {
        tags: ['Báo cáo'],
        summary: 'Lấy báo cáo tổng quan',
        security: [{ bearerAuth: [], machineId: [] }],
        responses: {
          '200': {
            description: 'Thành công',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    totalWalletBalance: { type: 'number' },
                    totalFundBalance: { type: 'number' },
                    totalBalance: { type: 'number' },
                    walletCount: { type: 'number' },
                    fundCount: { type: 'number' },
                    recentTransactions: { type: 'array' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/reports/summary': {
      get: {
        tags: ['Báo cáo'],
        summary: 'Lấy báo cáo tóm tắt',
        security: [{ bearerAuth: [], machineId: [] }],
        parameters: [
          { $ref: '#/components/parameters/ReportQuery' }
        ],
        responses: {
          '200': {
            description: 'Thành công'
          }
        }
      }
    },
    '/api/reports/cash-flow': {
      get: {
        tags: ['Báo cáo'],
        summary: 'Lấy báo cáo dòng tiền',
        security: [{ bearerAuth: [], machineId: [] }],
        parameters: [
          { $ref: '#/components/parameters/ReportQuery' }
        ],
        responses: {
          '200': {
            description: 'Thành công',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    dailyCashFlow: { type: 'object' },
                    summary: {
                      type: 'object',
                      properties: {
                        totalIncome: { type: 'number' },
                        totalExpense: { type: 'number' },
                        totalLending: { type: 'number' },
                        totalBorrowing: { type: 'number' },
                        netFlow: { type: 'number' }
                      }
                    },
                    period: {
                      type: 'object',
                      properties: {
                        startDate: { type: 'string', format: 'date-time' },
                        endDate: { type: 'string', format: 'date-time' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/reports/balance-sheet': {
      get: {
        tags: ['Báo cáo'],
        summary: 'Lấy báo cáo bảng cân đối',
        security: [{ bearerAuth: [], machineId: [] }],
        parameters: [
          { $ref: '#/components/parameters/ReportQuery' }
        ],
        responses: {
          '200': {
            description: 'Thành công',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    assets: {
                      type: 'object',
                      properties: {
                        wallets: { type: 'array' },
                        funds: { type: 'array' },
                        totalAssets: { type: 'number' }
                      }
                    },
                    liabilities: {
                      type: 'object',
                      properties: {
                        debts: { type: 'array' },
                        totalLiabilities: { type: 'number' }
                      }
                    },
                    netWorth: { type: 'number' },
                    date: { type: 'string', format: 'date-time' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/reports/income-statement': {
      get: {
        tags: ['Báo cáo'],
        summary: 'Lấy báo cáo thu nhập',
        security: [{ bearerAuth: [], machineId: [] }],
        parameters: [
          { $ref: '#/components/parameters/ReportQuery' }
        ],
        responses: {
          '200': {
            description: 'Thành công',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    income: {
                      type: 'object',
                      properties: {
                        categories: { type: 'object' },
                        total: { type: 'number' }
                      }
                    },
                    expenses: {
                      type: 'object', 
                      properties: {
                        categories: { type: 'object' },
                        total: { type: 'number' }
                      }
                    },
                    netIncome: { type: 'number' },
                    period: {
                      type: 'object',
                      properties: {
                        startDate: { type: 'string', format: 'date-time' },
                        endDate: { type: 'string', format: 'date-time' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/reports/trends': {
      get: {
        tags: ['Báo cáo'],
        summary: 'Lấy báo cáo xu hướng',
        security: [{ bearerAuth: [], machineId: [] }],
        parameters: [
          { $ref: '#/components/parameters/ReportQuery' }
        ],
        responses: {
          '200': {
            description: 'Thành công'
          }
        }
      }
    },
    '/api/reports/category-analysis': {
      get: {
        tags: ['Báo cáo'],
        summary: 'Lấy báo cáo phân tích danh mục',
        security: [{ bearerAuth: [], machineId: [] }],
        parameters: [
          { $ref: '#/components/parameters/ReportQuery' }
        ],
        responses: {
          '200': {
            description: 'Thành công'
          }
        }
      }
    },
    '/api/reports/predictions': {
      get: {
        tags: ['Báo cáo'],
        summary: 'Lấy báo cáo dự đoán',
        security: [{ bearerAuth: [], machineId: [] }],
        parameters: [
          { $ref: '#/components/parameters/ReportQuery' }
        ],
        responses: {
          '200': {
            description: 'Thành công'
          }
        }
      }
    },
    '/api/reports/export': {
      post: {
        tags: ['Báo cáo'],
        summary: 'Xuất báo cáo',
        security: [{ bearerAuth: [], machineId: [] }],
        parameters: [
          {
            in: 'query',
            name: 'exportReport',
            required: true,
            schema: {
              $ref: '#/components/schemas/ExportReportQuery'
            }
          }
        ],
        responses: {
          '200': {
            description: 'Thành công',
            content: {
              'application/pdf': {
                schema: {
                  type: 'string',
                  format: 'binary'
                }
              },
              'application/vnd.ms-excel': {
                schema: {
                  type: 'string',
                  format: 'binary'
                }
              },
              'text/csv': {
                schema: {
                  type: 'string',
                  format: 'binary'
                }
              }
            }
          }
        }
      }
    }
  }
};
