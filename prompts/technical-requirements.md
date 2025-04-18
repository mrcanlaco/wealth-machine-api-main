# Tài liệu yêu cầu kỹ thuật - Nền tảng Quản lý Tài chính Gia đình

## 1. Tổng quan hệ thống

### 1.1. Mục tiêu
Xây dựng nền tảng quản lý tài chính gia đình toàn diện với khả năng:
- Quản lý nhiều cỗ máy tài chính độc lập
- Theo dõi dòng tiền qua các kho, quỹ và ví
- Phân tích và báo cáo tài chính
- Tích hợp AI để tư vấn tài chính

### 1.2. Công nghệ sử dụng
- **Runtime**: Bun.sh
- **Framework**: Hono
- **Database & Auth**: Supabase
- **AI**: OpenAI GPT-4, Anthropic, pinecore
- **Documentation**: OpenAPI/Swagger

### 1.3. Tài liệu
- [Supabase](https://supabase.com/)
- [Hono](https://hono.dev/)
- [Bun.sh](https://bun.sh/)

## 2. Cấu trúc Project

### 2.1. Tổ chức thư mục
```
src/
├── routes/                 # Route definitions
│   ├── auth.routes.ts
│   ├── machine.routes.ts
│   ├── stores.routes.ts
│   ├── fund.routes.ts
│   ├── wallet.routes.ts
│   └── transaction.routes.ts
│   └── chat.routes.ts
│   └── report.routes.ts
├── controllers/           # Request handlers
│   ├── auth.controllers.ts
│   ├── machine.controllers.ts
│   ├── store.controllers.ts
│   ├── fund.controllers.ts
│   ├── wallet.controllers.ts
│   └── transaction.controllers.ts
│   └── chat.controllers.ts
│   └── report.controllers.ts
├── services/             # Business logic
│   ├── auth.service.ts
│   ├── machine.service.ts
│   ├── store.service.ts
│   ├── fund.service.ts
│   ├── wallet.service.ts
│   ├── transaction.service.ts
│   └── report.service.ts
│   └── chat.service.ts
├── providers/            # External integrations
│   ├── supabase.ts
│   ├── assistant.ts
│   ├── pinecore.ts
├── utils/               # Shared utilities
│   ├── validators/
│   ├── transformers/
│   ├── constants/
│   └── helpers/
├── types/              # Type definitions
├── middleware/         # Custom middleware
├── config/            # Configurations
└── tests/             # Test files
```

### 2.2. Dependency Management
- Bun.sh
- Hono
- Supabase
- Zod

### 2.3. Coding Standards
- TypeScript strict mode
- ESLint + Prettier configuration
- Conventional commits
- Documentation requirements
- Sử dụng Supabase Service Roles và API phải kiểm tra quyền cho các endpoints

## 3. Database Schema

### 3.1. Core Tables

### Mô hình dữ liệu

#### 1. Machine (Cỗ máy tài chính)
```sql
CREATE TABLE machines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  icon TEXT,
  un_allocated DECIMAL(20,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  config JSONB DEFAULT '{}',
  meta JSONB DEFAULT '{}'
);
```
#### 2. Machine Users
```sql
CREATE TABLE machine_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  machine_id UUID REFERENCES machines(id),
  user_id UUID REFERENCES auth.users(id),
  role TEXT NOT NULL CHECK (role IN ('owner', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  invited_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(machine_id, user_id)
);
```

#### 3. Machine Invitations
```sql
CREATE TABLE machine_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  machine_id UUID REFERENCES machines(id),
  invited_email TEXT NOT NULL,
  invited_by UUID REFERENCES auth.users(id),
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected')),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(machine_id, invited_email)
);
```

#### 4. Store (Kho)
```sql
CREATE TABLE stores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  machine_id UUID REFERENCES machines(id),
  name TEXT NOT NULL,
  icon TEXT,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'reserve', 'expansion', 'business')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  config JSONB DEFAULT '{}',
  meta JSONB DEFAULT '{}'
);
```

#### 5. Fund (Quỹ)
```sql
CREATE TABLE funds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  machine_id UUID REFERENCES machines(id),
  store_id UUID REFERENCES stores(id),
  name TEXT NOT NULL,
  icon TEXT,
  balance DECIMAL(20,2) DEFAULT 0,
  percent DECIMAL(5,2) DEFAULT 0,
  config JSONB DEFAULT '{}',
  meta JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 6. Wallet (Ví)
```sql
CREATE TABLE wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  machine_id UUID REFERENCES machines(id),
  name TEXT NOT NULL,
  icon TEXT,
  type TEXT CHECK (type IN ('cash', 'bank', 'crypto', 'savings')),
  balance DECIMAL(20,2) DEFAULT 0,
  currency TEXT DEFAULT 'VND',
  config JSONB DEFAULT '{}',
  meta JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 7. Transaction (Giao dịch)
```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  machine_id UUID REFERENCES machines(id),
  from_wallet_id UUID REFERENCES wallets(id),
  to_wallet_id UUID REFERENCES wallets(id),
  from_fund_id UUID REFERENCES funds(id),
  to_fund_id UUID REFERENCES funds(id),
  type TEXT CHECK (type IN (
    'income', 'expense', 'borrow', 'collect', 
    'lend', 'repay', 'transfer_refundable', 
    'transfer_non_refundable', 'money_transfer'
  )),
  status TEXT CHECK (status IN ('pending', 'completed', 'cancelled', 'failed')),
  amount DECIMAL(20,2) NOT NULL,
  currency TEXT DEFAULT 'VND',
  exchange_rate DECIMAL(20,6) DEFAULT 1,
  note TEXT,
  category TEXT,
  tags TEXT[],
  location JSONB,
  participants TEXT[],
  images TEXT[],
  event TEXT,
  reminder JSONB,
  related_transaction_id UUID REFERENCES transactions(id),
  meta JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

[... chi tiết các bảng khác ...]

### 3.2. Indexes
```sql
CREATE INDEX idx_machines_user_id ON machines(user_id);
CREATE INDEX idx_machine_users_machine ON machine_users(machine_id);
CREATE INDEX idx_machine_users_user ON machine_users(user_id);
CREATE INDEX idx_machine_invitations_machine ON machine_invitations(machine_id);
CREATE INDEX idx_machine_invitations_email ON machine_invitations(invited_email);
CREATE INDEX idx_stores_machine_id ON stores(machine_id);
CREATE INDEX idx_funds_store_id ON funds(store_id);
CREATE INDEX idx_transactions_machine_id ON transactions(machine_id);
```

### 3.3. Security Policies
Sử dụng quyền truy cập cho các bảng trên Supabase
API sử dụng Supabase Service Roles vì vậy cần phải kiểm tra quyền truy cập trên Supabase cho các endpoints

## 4. API Endpoints

### API Endpoints

#### Authentication
- `POST /auth/register` - Đăng ký tài khoản mới
- `POST /auth/login` - Đăng nhập
- `POST /auth/refresh` - Làm mới token
- `POST /auth/logout` - Đăng xuất

#### Machines của người dùng hiện tại
- `GET /machines` - Lấy danh sách machines
- `POST /machines` - Tạo machine mới
- `GET /machines/:id` - Lấy thông tin machine
- `PUT /machines/:id` - Cập nhật machine
- `DELETE /machines/:id` - Xóa machine
- `POST /machines/initialize` - Khởi tạo machine hoàn chỉnh với stores, funds và wallets
  - Input: Thông tin machine, cấu hình stores/funds, danh sách wallets
  - Tạo đồng thời machine, stores, funds và wallets trong một transaction
  - Tự động thiết lập các kho mặc định
- `POST /machines/:id/allocate-balance` - Phân bổ số dư chưa phân bổ vào các quỹ
  - Input: Số tiền chưa phân bổ và danh sách phân bổ (theo số tiền)
  - Validate tổng phân bổ phải bằng số dư chưa phân bổ
  - Thực hiện phân bổ trong một transaction, cập nhật số dư chưa phân bổ trong machine

#### Stores & Funds trong machine của người dùng hiện tại
- `GET /machines/:machineId/stores` - Lấy danh sách stores của machine
- `POST /machines/:machineId/stores` - Tạo store mới
- `GET /stores/:storeId/funds` - Lấy danh sách funds của store
- `POST /stores/:storeId/funds` - Tạo fund mới

#### Wallets trong machine của người dùng hiện tại
- `GET /machines/:machineId/wallets` - Lấy danh sách wallets
- `POST /machines/:machineId/wallets` - Tạo wallet mới
- `PUT /wallets/:id` - Cập nhật wallet
- `DELETE /wallets/:id` - Xóa wallet

#### Transactions trong machine của người dùng hiện tại
- `GET /machines/:machineId/transactions` - Lấy danh sách giao dịch
- `POST /machines/:machineId/transactions` - Tạo giao dịch mới
- `PUT /transactions/:id` - Cập nhật giao dịch
- `DELETE /transactions/:id` - Xóa giao dịch

#### Machine Users Management
- `GET /machines/:machineId/users` - Lấy danh sách người dùng trong machine
  - Accessible by: owner, member
- `DELETE /machines/:machineId/users/:userId` - Xóa người dùng khỏi machine
  - Accessible by: owner only
- `GET /machines/:machineId/invitations` - Lấy danh sách lời mời đang chờ
  - Accessible by: owner only
- `POST /machines/:machineId/invitations` - Tạo lời mời mới
  - Accessible by: owner only
  - Body: { email: string }
- `POST /invitations/:id/accept` - Chấp nhận lời mời
  - Accessible by: invited user
- `POST /invitations/:id/reject` - Từ chối lời mời
  - Accessible by: invited user

[... chi tiết các endpoints khác ...]

## 5. Business Logic

### 5.1. Machine Management
- Kiểm tra quyền truy cập
- Validation rules cho machine creation
- Logic phân bổ balance
- Xử lý concurrent updates
- Event propagation

### 5.2. Transaction Processing
- Kiểm tra quyền truy cập
- Validation rules cho transactions
- Balance calculation
- Currency conversion
- Transaction rollback

### 5.3. Reporting & Analytics
- Asset overview calculation
- Monthly analysis
- Trend detection
- Budget recommendations

### 5.4. Invitation Rules
- Chỉ owner có thể mời người dùng mới
- Lời mời hết hạn sau 7 ngày
- Không thể mời email đã là thành viên
- Mỗi email chỉ có thể có một lời mời pending tại một thời điểm
- Người được mời sẽ tự động được gán role member

### 5.5. User Management Rules
- Mỗi machine phải có ít nhất một owner
- Owner có thể xóa bất kỳ thành viên nào
- Member không thể xóa thành viên khác
- Member không thể rời machine (phải được owner xóa)

### 5.6. Data Access Rules
- Owner có quyền truy cập và chỉnh sửa tất cả dữ liệu
- Member chỉ có thể chỉnh sửa dữ liệu do họ tạo
- Member có thể xem tất cả dữ liệu trong machine

## 6. Notifications

### 6.1. Email Notifications
- Gửi email mời khi tạo invitation
- Gửi email thông báo khi bị xóa khỏi machine
- Gửi email xác nhận khi chấp nhận lời mời

### 6.2. In-App Notifications
- Thông báo khi có người chấp nhận lời mời (cho owner)
- Thông báo khi bị xóa khỏi machine
- Thông báo khi có lời mời mới

## 7. Validation Rules

### 7.1. Input Validation
- Email phải đúng định dạng
- Role chỉ được là 'owner' hoặc 'member'
- Các ID (machineId, userId) phải là UUID hợp lệ

### 7.2. Business Validation
- Kiểm tra quyền truy cập trước mỗi operation
- Validate trạng thái invitation trước khi accept/reject
- Kiểm tra điều kiện owner duy nhất trước khi xóa user

## 8. Error Handling

### 8.1. Common Errors
- 403: Unauthorized access
- 404: Resource not found
- 409: Conflict (duplicate invitation)
- 400: Invalid input
- 422: Business rule violation

### 8.2. Error Responses
```typescript
interface ErrorResponse {
  code: string;
  message: string;
  details?: Record<string, any>;
}
```

## 9. Security Requirements

### 9.1. Authentication & Authorization
- JWT-based authentication
- Role-based access control
- Resource-based permissions
- Token refresh mechanism

### 9.2. Data Protection
- End-to-end encryption
- Data sanitization
- Input validation
- Output encoding

### 9.3. API Security
- Rate limiting
- Request validation
- CORS policies
- Error handling

