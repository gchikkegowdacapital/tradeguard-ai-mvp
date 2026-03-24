# TradeGuard AI MVP - API Reference

## Overview

All API routes follow a standard response format and require authentication via Supabase.

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { /* actual data */ },
  "message": "Optional success message"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error description"
}
```

## Authentication

All routes require a valid Supabase session. Requests without a valid user will receive:
```json
{
  "success": false,
  "error": "Unauthorized"
}
```
Status: 401

## Endpoints

### Trading Plans

#### GET /api/plans
Fetch the user's most recent trading plan.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "plan_123",
    "user_id": "user_456",
    "title": "Conservative Daily Trader",
    "description": "My daily trading strategy",
    "max_risk_per_trade": 1.0,
    "max_daily_loss": 3.0,
    "max_daily_loss_dollars": 300,
    "max_total_drawdown": 10.0,
    "max_trades_per_day": 5,
    "max_concurrent_positions": 3,
    "min_risk_reward_ratio": "1:1.5",
    "trading_hours_start": "09:00",
    "trading_hours_end": "17:00",
    "max_position_size_lots": 1.0,
    "allowed_instruments": ["EUR/USD", "GBP/USD"],
    "cooldown_after_loss_minutes": 15,
    "max_consecutive_losses_before_pause": 3,
    "stop_loss_required": true,
    "prop_firm_mode": false,
    "created_at": "2024-03-22T10:00:00Z",
    "updated_at": "2024-03-22T10:00:00Z"
  }
}
```

#### POST /api/plans
Create or update a trading plan.

**Request Body:**
```json
{
  "title": "Conservative Daily Trader",
  "description": "My daily trading strategy",
  "maxRiskPerTrade": 1.0,
  "maxDailyLoss": 3.0,
  "maxDailyLossDollars": 300,
  "maxTotalDrawdown": 10.0,
  "maxTradesPerDay": 5,
  "maxConcurrentPositions": 3,
  "minRiskRewardRatio": "1:1.5",
  "tradingHoursStart": "09:00",
  "tradingHoursEnd": "17:00",
  "maxPositionSizeLots": 1.0,
  "allowedInstruments": ["EUR/USD", "GBP/USD"],
  "cooldownAfterLossMinutes": 15,
  "maxConsecutiveLossesBeforePause": 3,
  "stopLossRequired": true,
  "propFirmMode": false,
  "propFirmTemplate": null
}
```

**Response (201 Created):**
Same as GET response

**Errors:**
- 400: Validation error (field-specific)
- 401: Unauthorized
- 500: Database error

---

### Broker Connections

#### GET /api/brokers
List all connected brokers for the user.

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "conn_123",
      "user_id": "user_456",
      "broker_type": "metatrader4",
      "account_number": "12345678",
      "is_connected": true,
      "is_demo": false,
      "api_key": "***encrypted***",
      "last_sync": "2024-03-22T10:30:00Z",
      "created_at": "2024-03-20T08:00:00Z",
      "updated_at": "2024-03-22T10:30:00Z"
    }
  ]
}
```

#### POST /api/brokers
Add a new broker connection.

**Request Body:**
```json
{
  "brokerType": "metatrader4",
  "accountId": "12345678",
  "apiToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "conn_123",
    "user_id": "user_456",
    "broker_type": "metatrader4",
    "account_number": "12345678",
    "is_connected": true,
    "is_demo": false,
    "created_at": "2024-03-22T10:00:00Z"
  },
  "message": "Broker connection saved"
}
```

**Errors:**
- 400: Missing required fields
- 401: Unauthorized
- 500: Database error

#### DELETE /api/brokers?id={connectionId}
Remove a broker connection.

**Query Parameters:**
- `id` (required): Connection ID to delete

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Connection deleted"
}
```

**Errors:**
- 400: Missing connection ID
- 401: Unauthorized
- 500: Database error

---

### Broker Connection Testing

#### POST /api/brokers/test
Test a broker connection before saving.

**Request Body:**
```json
{
  "brokerType": "metatrader4",
  "accountId": "12345678",
  "apiToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "connected": true,
    "accountId": "12345678",
    "brokerType": "metatrader4",
    "lastCheck": "2024-03-22T10:30:00Z"
  },
  "message": "Connection test successful"
}
```

**Errors:**
- 400: Invalid account ID or API token format
- 500: Connection test failed

---

### Account Data

#### GET /api/accounts
Fetch account health metrics.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "balance": 10000.00,
    "equity": 10250.50,
    "openPnL": 250.50,
    "marginLevel": 85.5,
    "dailyPnL": 250.50,
    "dailyPnLPercent": 2.5,
    "drawdownPercent": 0.0
  }
}
```

**No Broker Connected (200 OK):**
```json
{
  "success": true,
  "data": null,
  "message": "No connected broker"
}
```

---

### Open Positions

#### GET /api/positions
Fetch currently open positions.

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "pos_123",
      "user_id": "user_456",
      "account_id": "acc_789",
      "symbol": "EUR/USD",
      "direction": "long",
      "entry_price": 1.0850,
      "current_price": 1.0900,
      "volume": 1.0,
      "pnl": 50.00,
      "pnl_percent": 0.46,
      "risk_reward_ratio": 1.5,
      "opened_at": "2024-03-22T09:30:00Z",
      "created_at": "2024-03-22T09:30:00Z"
    }
  ]
}
```

**No Positions (200 OK):**
```json
{
  "success": true,
  "data": []
}
```

---

### Alerts

#### GET /api/alerts
Fetch unresolved alerts (max 10).

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "alert_123",
      "user_id": "user_456",
      "level": "warning",
      "title": "Daily Loss Limit Warning",
      "message": "You have used 80% of your daily loss limit",
      "action_required": true,
      "resolved": false,
      "created_at": "2024-03-22T10:30:00Z",
      "resolved_at": null
    }
  ]
}
```

#### POST /api/alerts
Create a new alert.

**Request Body:**
```json
{
  "level": "warning",
  "title": "Daily Loss Limit Warning",
  "message": "You have used 80% of your daily loss limit",
  "actionRequired": true
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "alert_123",
    "user_id": "user_456",
    "level": "warning",
    "title": "Daily Loss Limit Warning",
    "message": "You have used 80% of your daily loss limit",
    "action_required": true,
    "resolved": false,
    "created_at": "2024-03-22T10:30:00Z"
  },
  "message": "Alert created"
}
```

**Alert Levels:**
- `info` - Informational
- `warning` - Warning
- `critical` - Critical issue
- `emergency` - Emergency (stop trading)

**Errors:**
- 400: Missing required fields
- 401: Unauthorized
- 500: Database error

---

## Error Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Resource created |
| 400 | Bad request (validation error) |
| 401 | Unauthorized (auth required) |
| 404 | Not found |
| 500 | Server error |

## Rate Limiting

Currently no rate limiting is implemented. In production, implement:
- 100 requests per minute per user
- 1000 requests per hour per user

## Authentication Headers

The API uses Supabase authentication. Include the session token in cookies automatically.

For manual requests:
```bash
curl -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
     https://your-domain.com/api/plans
```

## Validation Rules

### Trading Plan
- Title: Required, min 1 char
- Max Risk Per Trade: 0.1 - 5%
- Max Daily Loss: 1 - 10%
- Max Total Drawdown: 5 - 30%
- Max Trades Per Day: 1 - 50
- Max Concurrent Positions: 1 - 20
- Trading Hours: Valid time format (HH:MM)
- Instruments: At least 1 selected
- All other fields: Optional with sensible defaults

### Broker Connection
- Broker Type: `metatrader4` or `metatrader5`
- Account ID: Required, non-empty
- API Token: Required, min 10 characters

## Examples

### cURL: Create Trading Plan
```bash
curl -X POST https://your-domain.com/api/plans \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Conservative Daily Trader",
    "maxRiskPerTrade": 1.0,
    "maxDailyLoss": 3.0,
    "maxTotalDrawdown": 10.0,
    "maxTradesPerDay": 5,
    "maxConcurrentPositions": 3,
    "minRiskRewardRatio": "1:1.5",
    "tradingHoursStart": "09:00",
    "tradingHoursEnd": "17:00",
    "allowedInstruments": ["EUR/USD", "GBP/USD"],
    "stopLossRequired": true
  }'
```

### JavaScript: Fetch Account Data
```javascript
const response = await fetch('/api/accounts')
const { success, data } = await response.json()

if (success && data) {
  console.log(`Balance: $${data.balance}`)
  console.log(`Equity: $${data.equity}`)
  console.log(`Daily P&L: $${data.dailyPnL}`)
}
```

### JavaScript: Add Broker
```javascript
const response = await fetch('/api/brokers', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    brokerType: 'metatrader4',
    accountId: '12345678',
    apiToken: 'your-metaapi-token'
  })
})

const { success, data, error } = await response.json()

if (success) {
  console.log('Broker connected:', data.account_number)
} else {
  console.error('Error:', error)
}
```
