import {auth} from './modules/auth';
import { machine } from './modules/machine';
import { wallet } from './modules/wallet';
import { transaction } from './modules/transaction';
import { chat } from './modules/chat';
import { report } from './modules/report';
import { member } from './modules/member';
import { fund } from './modules/fund';
import { store } from './modules/store';
import { post } from './modules/post';

export const swaggerConfig = {
  openapi: '3.0.0',
  info: {
    title: 'Wealth Machine API',
    version: '1.0.0',
    description: 'Tài liệu API cho ứng dụng Wealth Machine',
  },
  servers: [
    {
      url: 'http://localhost:3003',
      description: 'Máy chủ phát triển cục bộ',
    },
  ],
  tags: [
    { name: 'Xác thực', description: 'Các endpoint xác thực' },
    { name: 'Cỗ máy', description: 'Các endpoint quản lý cỗ máy' },
    { name: 'Kho', description: 'Các endpoint quản lý kho của cỗ máy' },
    { name: 'Quỹ', description: 'Các endpoint quản lý quỹ của cỗ máy' },
    { name: 'Ví', description: 'Các endpoint quản lý ví của cỗ máy' },
    { name: 'Giao dịch', description: 'Các endpoint quản lý giao dịch của cỗ máy' },
    { name: 'Báo cáo', description: 'Các endpoint tạo báo cáo của cỗ máy' },
    { name: 'Thành viên', description: 'Các endpoint quản lý thành viên của cỗ máy' },
    { name: 'Lời mời', description: 'Các endpoint quản lý lời mời của người dùng' },
    { name: 'Trò chuyện', description: 'Các endpoint chức năng trò chuyện' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      machineId: {
        type: 'apiKey',
        name: 'x-machine-id',
        in: 'header',
        description: 'Machine ID cho tất cả các thao tác',
      },
    },
    parameters: {
      machineId: {
        in: 'header',
        name: 'x-machine-id',
        schema: {
          type: 'string'
        },
        required: true,
        description: 'Machine ID cho yêu cầu hiện tại'
      }
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          code: { type: 'string' },
          message: { type: 'string' }
        }
      },
      StandardResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: { type: 'object' },
          message: { type: 'string' }
        }
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', default: false },
          error: { $ref: '#/components/schemas/Error' }
        }
      },
      ...auth.schemas,
      ...machine.schemas,
      ...wallet.schemas,
      ...transaction.schemas,
      ...chat.schemas,
      ...report.schemas,
      ...member.schemas,
      ...fund.schemas,
      ...store.schemas,
      ...post.schemas
    }
  },
  security: [
    {
      bearerAuth: [],
      machineId: [],
    },
  ],
  paths: {
    ...auth.paths,
    ...machine.paths,
    ...wallet.paths,
    ...transaction.paths,
    ...chat.paths,
    ...report.paths,
    ...member.paths,
    ...fund.paths,
    ...store.paths,
    ...post.paths
  }
};
