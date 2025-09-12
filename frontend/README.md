# Frontend

## Prezentare
Frontend static (HTML/CSS/JS) servit din `frontend/public` de către `backend/server.js`.

- Resurse publice în `frontend/public`
- Pagini/demo suplimentare în `frontend/code epic gajet - Copy3 - Copy4/`

## Structură
```
frontend/
  public/                 # Servit la http://localhost:3001/
    index.html
    store.html
    assets/
  code epic gajet - Copy3 - Copy4/
    login.html
    orders.html
    src/
      styles/
      scripts/
```

## Dezvoltare locală
Pornește backend-ul; acesta servește directorul public.
```bash
cd backend
node server.js
```
Accesează:
- Site principal: `http://localhost:3001/`
- Exemplar magazin: `http://localhost:3001/store.html`

Dacă deschizi paginile demo direct de pe disc, apelurile API către `http://localhost:3001` trebuie să fie accesibile.

## Utilizare API
Frontend-ul consumă API-ul backend:
- GET `/api/products`
- GET `/api/products/:id`
- POST `/api/orders`
- GET `/api/orders/history`
- POST `/api/checkout`

Asigură-te că CORS este activ pe backend (este activ implicit în `server.js`).


