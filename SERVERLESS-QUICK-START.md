# Ghid Migrație: Express → Vercel Serverless Functions

## ✅ Etape Completate

### 1. Structură de Foldere
```
api/
├── [...slug].js      ✅ Catch-all handler pentru /api/* routes
├── admin.js          ✅ Handler principal (backup rutare)
```

**Ce fac aceste fișiere:**
- `[...slug].js`: Preia orice request la `/api/login`, `/api/orders`, etc. și îl routează intern
- `admin.js`: Handler alternativ dacă dorești rutare specifică

### 2. Fișiere Configurație

- ✅ `vercel.json` - Configurează routing, environment vars, și memory limits
- ✅ `.vercelignore` - Exclus fișiere din deployment (backend/, tests, etc.)
- ✅ `package.json` - Scripts actualizate pentru Vercel
- ✅ `SERVERLESS-TRANSFORMATION.md` - Documentație completă

### 3. Routele Transformate

Toate rutele din `backend/routes/admin.js` sunt acum în `/api/[...slug].js`:

| Metoda | Endpoint | Auth | Handler |
|--------|----------|------|---------|
| POST | `/api/login` | ❌ | 108-132 |
| GET | `/api/feature-flags` | ❌ | 91-93 |
| PUT | `/api/feature-flags/gpt5` | ✅ | 95-105 |
| GET | `/api/email-health` | ❌ | 107-113 |
| GET | `/api/orders` | ✅ | 115-145 |
| GET | `/api/stats` | ✅ | 147-178 |
| GET | `/api/financial-data` | ✅ | 180-230 |
| PUT | `/api/orders/:id/status` | ✅ | 232-285 |
| POST | `/api/backfill-orders` | ✅ | 287-300 |

## 🚀 Pasul Următor: Deploy pe Vercel

### A. Setup Vercel Project

```bash
# 1. Instalează Vercel CLI
npm install -g vercel

# 2. Login & Link
vercel login
vercel link
```

### B. Configurează Environment Variables

În Vercel Dashboard → Project Settings → Environment Variables:

```
SUPABASE_URL = https://jhspgxonaankhjjqkqgw.supabase.co
SUPABASE_ANON_KEY = eyJhbGc...
EMAIL_USER = your-email@gmail.com
EMAIL_PASS = your-app-password
GPT5_ENABLED = false
```

### C. Test Local

```bash
npm install
npm run dev

# Ar trebui să ruleze pe http://localhost:3000
```

### D. Deploy Production

```bash
npm run deploy
# Sau
vercel deploy --prod
```

## 🔍 Verificare Funcționalitate

### Test Login
```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

**Response Așteptat:**
```json
{
  "success": true,
  "token": "admin-token",
  "user": { "email": "admin@example.com" }
}
```

### Test Endpoint Protejat
```bash
curl -H "Authorization: Bearer admin-token" \
     http://localhost:3000/api/orders
```

### Test Static Frontend
```bash
# Ar trebui să servească admin.html
curl http://localhost:3000/admin

# Ar trebui să servească CSS
curl http://localhost:3000/styles/admin.css
```

## 📊 Performance Benefits

| Metrica | Express | Vercel Serverless |
|---------|---------|------------------|
| Cold Start | - | ~100-500ms |
| Scaling | Manual | Automat (0 → ∞) |
| Inactivity Cost | Constant | $0 (pay-per-use) |
| Uptime SLA | Self-managed | 99.95% |
| Auto Rollback | Manual | Automată |

## ⚠️ Considerații Importante

### 1. Cold Starts
- Prima cerere după inactivitate poate fi mai lentă
- Supabase client + nodemailer = ~300-500ms

### 2. Timeout
- Default: 30 secunde (suficient pentru operații DB)
- Configurat în `vercel.json`: `"maxDuration": 30`

### 3. Memory
- Default: 1024MB (suficient pentru app)
- Ajustabil în `vercel.json`: `"memory": 1024`

### 4. Concurrency Limits
- Verifică planul Vercel pentru limiti concurrency
- Vercel Pro: nelimitat

### 5. Migrație Data
- Supabase query-urile rămân aceleași
- Dummy data fallback funcționează în continuare

## 🔄 Rollback Plan

Dacă ceva merge greșit:

```bash
# Revert la ultimul deployment OK
vercel rollback

# Sau redeploy o anumită versiune
vercel deploy --prebuilt-dir=<commit-hash>
```

## 📚 Referințe Rapide

| Resursă | Link |
|---------|------|
| Vercel Docs | https://vercel.com/docs |
| Serverless Functions | https://vercel.com/docs/functions/serverless-functions |
| Environment Variables | https://vercel.com/docs/projects/environment-variables |
| Troubleshooting | https://vercel.com/docs/support |

---

**Status**: 🟢 Ready for Deployment | ✨ Migration Completed
