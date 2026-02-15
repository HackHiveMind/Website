# Serverless Functions - Migrație de la Express

## 📋 Structură Noua

```
Website/
├── api/
│   ├── [...slug].js      # Catch-all handler pentru toate rutele /api/*
│   └── admin.js          # Handler pentru /api/admin (backup)
├── frontend/             # HTML/CSS/JS static
│   ├── admin.html
│   ├── checkout.html
│   ├── store.html
│   ├── styles/
│   ├── scripts/
│   └── pages/
├── vercel.json          # Configurație Vercel cu routing rules
├── .vercelignore        # Fișiere de exclus din deployment
└── package.json         # Scripts actualizate
```

## 🎯 Ce s-a schimbat

### 1. **Backend Express → Vercel Functions**
- Rutele Express din `backend/routes/admin.js` sunt transformate în funcții serverless
- Fiecare handler primește `request` și `response` objects similar cu Express
- Handler-urile vor scala automat pe baza cererii

### 2. **Endpoint-uri disponibile**

Toate endpoint-urile sunt accesibile la `/api/*`:

#### Publice (fără autentificare)
- `GET /api/login` - Pagina de login
- `POST /api/login` - Autentificare admin
- `GET /api/email-health` - Status email service
- `GET /api/feature-flags` - Lista feature flags

#### Protejate (necesită Bearer token)
- `GET /api/orders` - Listare comenzi
- `GET /api/stats` - Statistici dashboard
- `GET /api/financial-data` - Date financiare
- `PUT /api/orders/:id/status` - Actualizare status comandă
- `PUT /api/feature-flags/gpt5` - Actualizare GPT5 flag
- `POST /api/backfill-orders` - Migrare date comenzi

### 3. **Autentificare**

```javascript
// Bei login, obții token:
POST /api/login
{
  "email": "admin@example.com",
  "password": "admin123"
}

// Response
{
  "success": true,
  "token": "admin-token",
  "user": { "email": "admin@example.com" }
}

// Apoi, trimite token în header Authorization:
Authorization: Bearer admin-token
```

### 4. **Static Files Serving**

Frontend-ul este servit static pe bază de:
- `.html` files din `/frontend`
- CSS din `/frontend/styles`
- JavaScript din `/frontend/scripts`
- Assets din `/frontend/pages`

`vercel.json` configurează rewrite rules pentru a dirija cereri către frontend folder.

## 🚀 Deployment pe Vercel

### 1. **Conectează repo**
```bash
# Instalează Vercel CLI
npm i -g vercel

# Login și connect
vercel login
vercel link
```

### 2. **Configurează variabile de mediu**

Adaugă în Vercel Project Settings → Environment Variables:

```
SUPABASE_URL = https://jhspgxonaankhjjqkqgw.supabase.co
SUPABASE_ANON_KEY = eyJhbGc... (key-ul tău)
EMAIL_USER = your.email@gmail.com
EMAIL_PASS = your-app-password
GPT5_ENABLED = false
```

### 3. **Deploy**
```bash
vercel deploy --prod
```

## 🔧 Development Local

### Cu Vercel CLI
```bash
npm install
vercel dev
```
Server rulează pe `http://localhost:3000`

### Teste API

```bash
# Testează endpoint public
curl http://localhost:3000/api/email-health

# Testează endpoint protejat
curl -H "Authorization: Bearer admin-token" \
     http://localhost:3000/api/orders
```

## 📝 Fișiere Cheie

### `/api/[...slug].js`
- Handler principal pentru toate rutele /api/*
- Primește request object cu proprietăți: `url`, `method`, `body`, `headers`
- Returnează response cu `status()` și `json()` methods

### `/vercel.json`
- Configurează routing rules pentru frontend static
- Mapează extensii de fișiere către frontend folder
- Definește maxDuration și memory pentru funcții

### `/package.json`
- `npm start` / `npm run dev` → `vercel dev` (inițiază serverless local dev)
- `npm run deploy` → publică pe Vercel

## ⚙️ Diferențe Express vs Serverless

| Express | Vercel Functions |
|---------|-----------------|
| `router.get()` / `router.post()` | Citire `req.method` |
| URL pattern matching automat | Manual path matching în handler |
| `res.json()` | `res.status().json()` / `res.end()` |
| Middleware cu `next()` | Direct logic în handler |
| Status codes din router | `res.status(200/400/500)` |

## 🐛 Troubleshooting

### 404 - Endpoint Not Found
- Verifică că path-ul exact se potrivește în handler
- Log `console.log(req.url, req.method)` pentru debug

### CORS Errors
- Handler setează headers CORS pentru toate request-urile
- Verifycare că frontend trimite `Content-Type: application/json`

### Supabase Connection Failed
- Verifică variabilele de mediu în Vercel Settings
- Handler-urile au fallback la dummy data dacă DB e down

### Email Not Sending
- Verifică EMAIL_USER și EMAIL_PASS în .env / Vercel vars
- Verifică că address-ul destinație e valid în request

## 📚 Resurse

- [Vercel Functions Docs](https://vercel.com/docs/functions/serverless-functions)
- [Vercel Routing & Rewrites](https://vercel.com/docs/edge-middleware/routing)
- [Supabase JS Client](https://supabase.com/docs/reference/javascript)

---

**Status**: ✅ Serverless migration completă | 🚀 Ready for Vercel deployment
