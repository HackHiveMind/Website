# 📋 API DOCUMENTATION - ADMIN ROUTES

## 🔐 **AUTHENTICATION**
Base URL: `http://localhost:3001/admin/api`

⚠️ **IMPORTANT:** Pentru a accesa API-ul, trebuie să folosești endpoint-uri specifice, nu doar `/admin/api`.

Endpoint-uri disponibile:
- `POST /admin/api/login` - Autentificare admin
- `GET /admin/api/stats` - Statistici dashboard  
- `GET /admin/api/orders` - Lista comenzilor
- `GET /admin/api/financial-data` - Date financiare
- `GET /admin/login` - Pagina de login (HTML)
- `GET /admin/dashboard` - Dashboard admin (HTML)

### 🔑 Login Admin
**POST** `/admin/api/login`

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

**Response Success:**
```json
{
  "success": true,
  "token": "admin-token",
  "user": {
    "email": "admin@example.com"
  }
}
```

**Response Error:**
```json
{
  "success": false,
  "message": "Credențiale invalide"
}
```

---

## 📊 **DASHBOARD STATISTICS**

### 📈 Get Dashboard Stats
**GET** `/admin/api/stats`

**Headers:**
```
Authorization: Bearer admin-token
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalOrders": 157,
    "totalUsers": 0,
    "totalRevenue": 1318279.95,
    "conversionRate": "0.0",
    "source": "supabase"
  }
}
```

---

## 💰 **FINANCIAL DATA**

### 💳 Get Financial Information
**GET** `/admin/api/financial-data`

**Headers:**
```
Authorization: Bearer admin-token
```

**Response:**
```json
{
  "success": true,
  "data": {
    "income": {
      "paid": 0,
      "unpaid": 1318279,
      "overdue": 0
    },
    "tvaLimit": {
      "revenue": 300000,
      "remaining": -1018279
    },
    "vatBalance": {
      "balance": 0,
      "sales": 0
    },
    "source": "supabase"
  }
}
```

---

## 🛒 **ORDERS MANAGEMENT**

### 📋 Get All Orders
**GET** `/admin/api/orders`

**Headers:**
```
Authorization: Bearer admin-token
```

**Response:**
```json
{
  "success": true,
  "orders": [
    {
      "order_id": 157,
      "first_name": "",
      "last_name": "",
      "email": "",
      "amount_paid": 258.0,
      "card_last4": "",
      "status": "pending"
    },
    {
      "order_id": 156,
      "first_name": "",
      "last_name": "",
      "email": "",
      "amount_paid": 22405.0,
      "card_last4": "",
      "status": "pending"
    }
  ]
}
```

### 🔧 Backfill Orders (Data Migration)
**POST** `/admin/api/backfill-orders`

**Headers:**
```
Authorization: Bearer admin-token
```

**Description:** Migrates old order data structure to new format with customer information.

**Response:**
```json
{
  "success": true,
  "message": "Actualizate X comenzi cu informații customer"
}
```

---

## 🌐 **WEB PAGES**

### 📄 Admin Login Page
**GET** `/admin/login`

Returns the admin login HTML page.

### 📊 Admin Dashboard
**GET** `/admin/dashboard`

Returns the admin dashboard HTML page.

---

## 🔍 **EXAMPLE USAGE**

### JavaScript/Fetch Example:

```javascript
// Login
const loginResponse = await fetch('/admin/api/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'admin@example.com',
    password: 'admin123'
  })
});

const loginData = await loginResponse.json();
const token = loginData.token;

// Get Orders
const ordersResponse = await fetch('/admin/api/orders', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const ordersData = await ordersResponse.json();
console.log(ordersData.orders);

// Get Statistics
const statsResponse = await fetch('/admin/api/stats', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const statsData = await statsResponse.json();
console.log(statsData.stats);

// Get Financial Data
const financialResponse = await fetch('/admin/api/financial-data', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const financialData = await financialResponse.json();
console.log(financialData.data);
```

### cURL Examples:

```bash
# Login
curl -X POST http://localhost:3001/admin/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'

# Get Orders
curl -X GET http://localhost:3001/admin/api/orders \
  -H "Authorization: Bearer admin-token"

# Get Stats
curl -X GET http://localhost:3001/admin/api/stats \
  -H "Authorization: Bearer admin-token"

# Get Financial Data
curl -X GET http://localhost:3001/admin/api/financial-data \
  -H "Authorization: Bearer admin-token"
```

---

## ⚠️ **AUTHENTICATION NOTES**

1. **Token:** All protected routes require `Authorization: Bearer admin-token` header
2. **Credentials:** Default admin credentials are `admin@example.com` / `admin123`
3. **Token Validation:** Simple bearer token validation (dummy implementation)
4. **Session:** Token doesn't expire in current implementation

---

## 📊 **DATA SOURCES**

- **Primary:** Supabase database (real-time data)
- **Fallback:** Dummy data when Supabase is unavailable
- **Response Field:** `source` field indicates data origin (`"supabase"` or `"dummy_data"`)

---

## 🚀 **STATUS**

✅ All admin API endpoints are **FUNCTIONAL** and connected to Supabase database
✅ Fallback system implemented for reliability
✅ Real-time data from 157 orders worth 1,318,279.95 RON