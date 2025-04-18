---
title: Tài liệu API
description: Tài liệu API WeGreat - Hướng dẫn tích hợp và sử dụng API của nền tảng đầu tư thông minh WeGreat
imageUrl: /images/api-docs.jpg
tags: ['API', 'documentation', 'integration']
category: technical
type: page
createdAt: '2024-12-16T02:28:17+07:00'
updatedAt: '2024-12-16T02:28:17+07:00'
---

# Tài liệu API WeGreat

## Giới thiệu

WeGreat API cho phép bạn tích hợp các tính năng đầu tư thông minh vào ứng dụng của mình. API của chúng tôi được xây dựng trên RESTful principles, sử dụng JSON cho request và response.

## Bắt đầu

### Authentication
```javascript
const response = await fetch('https://api.wegreat.vn/v1/auth', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    apiKey: 'your-api-key',
    secret: 'your-secret-key',
  }),
});
```

### Base URL
```
https://api.wegreat.vn/v1
```

## Endpoints

### Market Data

#### Get Stock Price
```http
GET /market/stock/{symbol}
```

Response:
```json
{
  "symbol": "VNM",
  "price": 80000,
  "change": 2000,
  "changePercent": 2.5,
  "volume": 1000000
}
```

#### Get Market Overview
```http
GET /market/overview
```

### Portfolio Management

#### Create Portfolio
```http
POST /portfolio
Content-Type: application/json

{
  "name": "My Portfolio",
  "description": "Long-term investment",
  "currency": "VND"
}
```

#### Add Position
```http
POST /portfolio/{id}/positions
Content-Type: application/json

{
  "symbol": "VNM",
  "quantity": 100,
  "price": 80000
}
```

## Authentication

### API Keys
- Production key
- Sandbox key
- Rate limits
- IP whitelist

### Security
- HTTPS only
- JWT tokens
- API key rotation
- Request signing

## Rate Limits

### Standard Plan
- 1000 requests/day
- 60 requests/minute
- Burst: 100 requests

### Premium Plan
- Unlimited requests
- 1000 requests/minute
- Custom limits

## Error Handling

### Error Codes
```json
{
  "error": {
    "code": "AUTH_001",
    "message": "Invalid API key",
    "details": "The provided API key is not valid"
  }
}
```

### Common Errors
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 429: Too Many Requests
- 500: Server Error

## Webhooks

### Setup
```http
POST /webhooks
Content-Type: application/json

{
  "url": "https://your-domain.com/webhook",
  "events": ["trade.executed", "price.alert"]
}
```

### Events
- trade.executed
- price.alert
- portfolio.updated
- market.update

## Best Practices

### Optimization
1. Use compression
2. Batch requests
3. Cache responses
4. Handle rate limits

### Security
1. Secure API keys
2. Validate responses
3. Use HTTPS
4. Monitor usage

## SDK & Libraries

### Official SDKs
- JavaScript/TypeScript
- Python
- Java
- C#

### Community Libraries
- PHP
- Ruby
- Go
- Rust

## Testing

### Sandbox Environment
```
https://sandbox.api.wegreat.vn/v1
```

### Test Credentials
```json
{
  "apiKey": "test_key_123",
  "secret": "test_secret_456"
}
```

## Support

### Technical Support
- Email: api-support@wegreat.vn
- Discord: discord.gg/wegreat-api
- GitHub: github.com/wegreat-api

### Resources
- API Status: status.wegreat.vn
- Change Log: changelog.wegreat.vn
- Blog: blog.wegreat.vn/api

## Versioning

### Current Version
- v1 (stable)
- v2 (beta)
- v0 (deprecated)

### Changelog
- Version history
- Breaking changes
- Migration guides
- Deprecation notices
