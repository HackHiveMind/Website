# 🚀 ADMIN API ENDPOINTS - POSTMAN COLLECTION

**Base URL:** `http://localhost:3001`

---

## 🔐 **1. LOGIN ADMIN**

### Request Details:
- **Method:** `POST`
- **URL:** `http://localhost:3001/admin/api/login`
- **Headers:**
  ```
  Content-Type: application/json
  ```

### Body (raw JSON):
```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

### Expected Response:
```json
{
  "success": true,
  "token": "admin-token",
  "user": {
    "email": "admin@example.com"
  }
}
```

**⚠️ IMPORTANT:** Salvează `token`-ul din răspuns pentru următoarele cereri!

---

## 📊 **2. GET DASHBOARD STATISTICS**

### Request Details:
- **Method:** `GET`
- **URL:** `http://localhost:3001/admin/api/stats`
- **Headers:**
  ```
  Authorization: Bearer admin-token
  ```

### Expected Response:
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

## 💰 **3. GET FINANCIAL DATA**

### Request Details:
- **Method:** `GET`
- **URL:** `http://localhost:3001/admin/api/financial-data`
- **Headers:**
  ```
  Authorization: Bearer admin-token
  ```

### Expected Response:
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

## 🛒 **4. GET ALL ORDERS**

### Request Details:
- **Method:** `GET`
- **URL:** `http://localhost:3001/admin/api/orders`
- **Headers:**
  ```
  Authorization: Bearer admin-token
  ```

### Expected Response:
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

---

## 🔧 **5. BACKFILL ORDERS (Data Migration)**

### Request Details:
- **Method:** `POST`
- **URL:** `http://localhost:3001/admin/api/backfill-orders`
- **Headers:**
  ```
  Authorization: Bearer admin-token
  ```

### Expected Response:
```json
{
  "success": true,
  "message": "Actualizate X comenzi cu informații customer"
}
```

---

## 🌐 **6. ADMIN LOGIN PAGE (HTML)**

### Request Details:
- **Method:** `GET`
- **URL:** `http://localhost:3001/admin/login`

### Expected Response:
HTML page cu formularul de login.

---

## 📊 **7. ADMIN DASHBOARD (HTML)**

### Request Details:
- **Method:** `GET`
- **URL:** `http://localhost:3001/admin/dashboard`

### Expected Response:
HTML page cu dashboard-ul admin.

---

## 🔥 **QUICK TEST SEQUENCE pentru POSTMAN:**

### Step 1: Login și obține token
```
POST http://localhost:3001/admin/api/login
Body: {"email": "admin@example.com", "password": "admin123"}
```

### Step 2: Testează toate endpoint-urile cu token-ul obținut
```
GET http://localhost:3001/admin/api/stats
Header: Authorization: Bearer admin-token

GET http://localhost:3001/admin/api/orders  
Header: Authorization: Bearer admin-token

GET http://localhost:3001/admin/api/financial-data
Header: Authorization: Bearer admin-token

POST http://localhost:3001/admin/api/backfill-orders
Header: Authorization: Bearer admin-token
```

---

## ⚡ **POSTMAN COLLECTION JSON:**

Poți importa această configurație în Postman:

```json
{
  "info": {
    "name": "Admin API Collection",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3001"
    },
    {
      "key": "adminToken",
      "value": "admin-token"
    }
  ],
  "item": [
    {
      "name": "1. Login Admin",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"email\": \"admin@example.com\",\n  \"password\": \"admin123\"\n}"
        },
        "url": "{{baseUrl}}/admin/api/login"
      }
    },
    {
      "name": "2. Get Stats",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{adminToken}}"
          }
        ],
        "url": "{{baseUrl}}/admin/api/stats"
      }
    },
    {
      "name": "3. Get Orders",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{adminToken}}"
          }
        ],
        "url": "{{baseUrl}}/admin/api/orders"
      }
    },
    {
      "name": "4. Get Financial Data",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{adminToken}}"
          }
        ],
        "url": "{{baseUrl}}/admin/api/financial-data"
      }
    },
    {
      "name": "5. Backfill Orders",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{adminToken}}"
          }
        ],
        "url": "{{baseUrl}}/admin/api/backfill-orders"
      }
    }
  ]
}
```

---

## 🛠️ **TROUBLESHOOTING:**

### Dacă primești 404:
- Verifică că serverul rulează: `http://localhost:3001`
- Verifică că endpoint-ul este corect (ex: `/orders` nu `/order`)

### Dacă primești 401 Unauthorized:
- Verifică că ai header-ul `Authorization: Bearer admin-token`
- Fă mai întâi login pentru a obține token-ul

### Dacă primești 500 Internal Server Error:
- Verifică consola serverului pentru erori
- Poate fi o problemă cu Supabase connection

---

## ✅ **STATUS SERVER:**
- **✅ Server Running:** http://localhost:3001
- **✅ Database:** Supabase Connected
- **✅ Orders:** 157 orders with 1,318,279.95 RON
- **✅ Authentication:** admin@example.com / admin123