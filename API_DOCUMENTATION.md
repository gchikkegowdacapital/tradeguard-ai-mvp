# TradeGuard AI - API Documentation

Complete API reference for TradeGuard AI backend.

## Authentication

All endpoints require a valid Supabase session token except where noted.

### Headers
```
Authorization: Bearer <session_token>
Content-Type: application/json
```

### Getting Auth Token
Session tokens are automatically managed by Supabase SDK. For custom requests, retrieve from:
```typescript
const { data } = await supabase.auth.getSession()
const token = data.session?.access_token
```

---

## API Endpoints

### Health Check
**Public endpoint** - No auth required

#### GET /api/health
Returns API health status.

**Response (200 OK):**
```json
{
  "status": "ok",
  "timestamp": "2026-03-22T10:30:00Z",
  "version": "0.1.0"
}
```

---

### Authentication

#### POST /api/auth/logout
Signs out the current user.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "Already logged out"
}
```

**Response (500 Server Error):**
```json
{
  "success": false,
  "error": "Failed to logout"
}
```

---

### Trades

#### GET /api/trades
Fetch user's trades with pagination.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `limit` (optional): Number of trades per page (default: 50, max: 200)
- `offset` (optional): Starting position (default: 0)

**Example:**
```
GET /api/trades?limit=10&offset=0
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "trades": [
      {
        "id": "uuid",
        "user_id": "uuid",
        "account_id": "uuid",
        "symbol": "EURUSD",
        "direction": "long",
        "entry_price": 1.0950,
        "exit_price": 1.0980,
        "volume": 1.0,
        "pnl": 30.0,
        "pnl_percent": 0.28,
        "risk_reward_ratio": 2.0,
        "setup_quality": "good",
        "plan_compliance": "full",
        "emotional_state": "calm",
        "entry_time": "2026-03-22T10:00:00Z",
        "exit_time": "2026-03-22T11:30:00Z",
        "notes": "Trade notes here",
        "created_at": "2026-03-22T10:00:00Z"
      }
    ],
    "total": 45
  }
}
```

**Response (401 Unauthorized):**
```json
{
  "success": false,
  "error": "Unauthorized"
}
```

**Response (500 Server Error):**
```json
{
  "success": false,
  "error": "Failed to fetch trades"
}
```

#### POST /api/trades
Create a new trade.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "symbol": "EURUSD",
  "direction": "long",
  "entry_price": 1.0950,
  "exit_price": 1.0980,
  "volume": 1.0,
  "setup_quality": "good",
  "plan_compliance": "full",
  "emotional_state": "calm",
  "notes": "Trade notes",
  "account_id": "uuid"
}
```

**Fields:**
- `symbol` (string, required): Trading pair/instrument
- `direction` (enum, required): `"long"` or `"short"`
- `entry_price` (number, required): Entry price
- `exit_price` (number, optional): Exit price (calculated P&L if provided)
- `volume` (number, required): Trade volume
- `setup_quality` (enum, required): `"poor"`, `"fair"`, `"good"`, `"excellent"`
- `plan_compliance` (enum, required): `"full"`, `"partial"`, `"none"`
- `emotional_state` (enum, required): `"calm"`, `"neutral"`, `"anxious"`, `"frustrated"`, `"overconfident"`
- `notes` (string, optional): Trade notes/analysis
- `account_id` (string, required): Account ID for this trade

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "account_id": "uuid",
    "symbol": "EURUSD",
    "direction": "long",
    "entry_price": 1.0950,
    "exit_price": 1.0980,
    "volume": 1.0,
    "pnl": 30.0,
    "pnl_percent": 0.28,
    "risk_reward_ratio": 2.0,
    "setup_quality": "good",
    "plan_compliance": "full",
    "emotional_state": "calm",
    "entry_time": "2026-03-22T10:00:00Z",
    "exit_time": null,
    "notes": "Trade notes here",
    "created_at": "2026-03-22T10:00:00Z"
  },
  "message": "Trade created successfully"
}
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "Invalid trade data"
}
```

**Response (401 Unauthorized):**
```json
{
  "success": false,
  "error": "Unauthorized"
}
```

**Response (500 Server Error):**
```json
{
  "success": false,
  "error": "Failed to create trade"
}
```

---

### Accounts

#### GET /api/accounts
Fetch user's trading accounts with broker info.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "broker_connection_id": "uuid",
      "balance": 10000.00,
      "equity": 9950.50,
      "margin_used": 2000.00,
      "margin_free": 7950.50,
      "last_updated": "2026-03-22T10:30:00Z",
      "created_at": "2026-03-22T09:00:00Z",
      "broker_connection": {
        "id": "uuid",
        "user_id": "uuid",
        "broker_type": "metatrader5",
        "account_number": "123456",
        "is_demo": false,
        "is_connected": true,
        "last_sync": "2026-03-22T10:30:00Z"
      }
    }
  ]
}
```

**Response (401 Unauthorized):**
```json
{
  "success": false,
  "error": "Unauthorized"
}
```

**Response (500 Server Error):**
```json
{
  "success": false,
  "error": "Failed to fetch accounts"
}
```

#### POST /api/accounts
Create a new trading account.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "broker_connection_id": "uuid",
  "balance": 10000.00,
  "equity": 10000.00,
  "margin_used": 0.00,
  "margin_free": 10000.00
}
```

**Fields:**
- `broker_connection_id` (string, required): ID of broker connection
- `balance` (number, optional): Account balance (default: 0)
- `equity` (number, optional): Account equity (default: 0)
- `margin_used` (number, optional): Used margin (default: 0)
- `margin_free` (number, optional): Free margin (default: 0)

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "broker_connection_id": "uuid",
    "balance": 10000.00,
    "equity": 10000.00,
    "margin_used": 0.00,
    "margin_free": 10000.00,
    "created_at": "2026-03-22T10:00:00Z"
  },
  "message": "Account created successfully"
}
```

**Response (401 Unauthorized):**
```json
{
  "success": false,
  "error": "Unauthorized"
}
```

**Response (500 Server Error):**
```json
{
  "success": false,
  "error": "Failed to create account"
}
```

---

### Webhooks

#### POST /api/webhooks/stripe
Stripe webhook handler.

**Headers:**
```
stripe-signature: t=<timestamp>,v1=<signature>
Content-Type: application/json
```

**Accepted Events:**
- `checkout.session.completed` - Subscription purchased
- `customer.subscription.updated` - Subscription changed
- `customer.subscription.deleted` - Subscription canceled

**Response (200 OK):**
```json
{
  "received": true
}
```

**Response (400 Bad Request):**
```json
{
  "error": "Invalid signature"
}
```

**Example Event Payload:**
```json
{
  "type": "checkout.session.completed",
  "data": {
    "object": {
      "id": "cs_test_xxx",
      "customer": "cus_xxx",
      "items": {
        "data": [
          {
            "price": {
              "id": "price_sentinel"
            }
          }
        ]
      }
    }
  }
}
```

---

### Cron Jobs

#### GET /api/crons/sync-accounts
Sync broker accounts with current state.

**Headers:**
```
Authorization: Bearer <cron_secret>
```

**Authentication:** Requires `CRON_SECRET` environment variable

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Synced 5 brokers, 0 failed"
}
```

**Response (401 Unauthorized):**
```
Unauthorized
```

**Response (500 Server Error):**
```json
{
  "success": false,
  "error": "Cron job failed"
}
```

#### GET /api/crons/generate-snapshots
Generate daily trading snapshots.

**Headers:**
```
Authorization: Bearer <cron_secret>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Created 12 snapshots, 0 failed"
}
```

---

## Response Format

All API responses follow a standard format:

**Success Response:**
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Optional message"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message"
}
```

---

## Error Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Auth required |
| 403 | Forbidden - No permission |
| 404 | Not Found - Resource not found |
| 500 | Server Error - Internal error |

---

## Rate Limiting

Rate limits are applied per user:
- **Default**: 100 requests per minute
- **Trades endpoint**: 50 requests per minute
- **Webhook**: No limit for verified webhooks

---

## Pagination

For paginated endpoints, use `limit` and `offset`:

```
GET /api/trades?limit=20&offset=0
```

**Parameters:**
- `limit`: Items per page (default: 50, max: 200)
- `offset`: Starting position (default: 0)

**Response includes:**
```json
{
  "data": [ /* array of items */ ],
  "total": 150,
  "page": 1,
  "limit": 50,
  "pages": 3
}
```

---

## Filtering & Sorting

### Get trades for specific symbol
```
GET /api/trades?symbol=EURUSD
```

### Get trades by date range
```
GET /api/trades?from=2026-03-01&to=2026-03-31
```

(Note: Currently not implemented - plan for future)

---

## Webhook Verification

Verify Stripe webhooks:

```typescript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const sig = request.headers['stripe-signature']

const event = stripe.webhooks.constructEvent(
  body,
  sig,
  process.env.STRIPE_WEBHOOK_SECRET
)
```

---

## Example Requests

### Create a trade with curl
```bash
curl -X POST http://localhost:3000/api/trades \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "EURUSD",
    "direction": "long",
    "entry_price": 1.0950,
    "volume": 1.0,
    "setup_quality": "good",
    "plan_compliance": "full",
    "emotional_state": "calm",
    "account_id": "your-account-id"
  }'
```

### Fetch trades with JavaScript
```javascript
const response = await fetch('/api/trades?limit=10', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
const data = await response.json()
console.log(data.data.trades)
```

### Fetch trades with Python
```python
import requests

headers = {
    'Authorization': f'Bearer {token}'
}

response = requests.get(
    'https://your-domain.com/api/trades',
    params={'limit': 10},
    headers=headers
)

trades = response.json()['data']['trades']
```

---

## Future Endpoints (Planned)

- `GET /api/analytics` - Advanced analytics
- `GET /api/alerts` - User alerts
- `POST /api/plans` - Create trading plan
- `GET /api/revenge-score` - Revenge score data
- `POST /api/brokers` - Connect broker
- `GET /api/webhooks/logs` - Webhook logs

---

## Testing

### Using Postman

1. Create new collection
2. Set base URL: `http://localhost:3000/api`
3. Add Authorization header with Bearer token
4. Create requests for each endpoint
5. Export collection for team

### Using REST Client (VS Code)

Create `api-test.http`:
```http
### Health check
GET http://localhost:3000/api/health

### Get trades
GET http://localhost:3000/api/trades
Authorization: Bearer YOUR_TOKEN

### Create trade
POST http://localhost:3000/api/trades
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

{
  "symbol": "EURUSD",
  "direction": "long",
  "entry_price": 1.0950,
  "volume": 1.0,
  "setup_quality": "good",
  "plan_compliance": "full",
  "emotional_state": "calm",
  "account_id": "uuid"
}
```

---

## Support

For API issues, check:
1. Server logs: `vercel logs --prod`
2. Database logs: Supabase Dashboard
3. Error messages in response
4. Browser console for frontend errors

---

**API Version**: 0.1.0
**Last Updated**: 2026-03-22
