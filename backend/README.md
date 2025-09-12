# Backend

## Prezentare
Server Express care servește fișiere statice din `frontend/public` și expune un API simplu conectat la Supabase Postgres. Modulul de admin rulează separat.

- Server principal API: `server.js` pe portul 3001
- Server admin: `app.js` pe portul 3002


## Instalare
```bash
# din rădăcina proiectului (C:\Users\abuga\Website)
cd backend
npm install
```

## Configurare
Serverul folosește Supabase. În producție, înlocuiește cheia anon cu variabile de mediu.

Creează un fișier `.env` în `backend/` (recomandat):
```env
SUPABASE_URL=https://PROIECTUL_TAU.supabase.co
SUPABASE_ANON_KEY=CHEIA_TA_ANON
PORT=3001
```
Apoi actualizează `server.js` pentru a citi valorile din `process.env`.

Baza de date (opțional, client local `pg`):
- `databasepg.js` exportă un `Client` configurat pentru instanță locală. Ajustează credențialele după nevoie.

## Rulare
Terminal 1 (server principal + static):
```bash
node server.js
```
- Servește fișierele statice din `../frontend/public`
- API disponibil la `http://localhost:3001`

Terminal 2 (admin):
```bash
node app.js
```
- Interfața admin la `http://localhost:3002/admin/login`

## Endpoint-uri API
Baza: `http://localhost:3001`

- GET `/api/products`
- GET `/api/products/category/:category`
- GET `/api/products/:id`
- POST `/api/orders`
- GET `/api/orders/history`
- POST `/api/checkout`

Răspunsurile sunt JSON. Erorile includ `{ error | message }`.

## Acces în rețea
Serverul principal se leagă pe `0.0.0.0`, vizibil în LAN, ex. `http://<ip-local>:3001`.


