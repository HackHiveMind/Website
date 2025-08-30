# Sistem de Login și Vizualizare Comenzi - Epic Gadget Store

## Descriere
Acest sistem permite utilizatorilor să se autentifice și să vizualizeze toate comenzile lor într-o interfață modernă și responsivă.

## Funcționalități

### 1. Pagină de Login (`login.html`)
- Formular de autentificare cu email și parolă
- Validare în timp real
- Design modern și responsiv
- Gestionare erori și stări de încărcare
- Redirecționare automată dacă utilizatorul este deja autentificat

### 2. Pagină de Comenzi (`orders.html`)
- Dashboard cu statistici (total comenzi, în așteptare, expediate, livrate)
- Lista comenzilor cu filtrare după status și dată
- Modal pentru vizualizarea detaliilor complete ale comenzilor
- Design responsive pentru toate dispozitivele
- Funcție de deconectare

## Structura Fișierelor

```
code epic gajet - Copy3 - Copy4/
├── login.html                    # Pagina de login
├── orders.html                   # Pagina de comenzi
├── src/
│   ├── styles/
│   │   ├── login.css            # Stiluri pentru login
│   │   └── orders.css           # Stiluri pentru comenzi
│   └── scripts/
│       ├── login.js             # Funcționalitate login
│       └── orders.js            # Funcționalitate comenzi
└── api/
    ├── login.php                # API pentru autentificare
    ├── orders.php               # API pentru listarea comenzilor
    ├── order-details.php        # API pentru detalii comandă
    └── create-test-user.php     # Script pentru crearea utilizatorului de test
```

## Configurare

### 1. Baza de Date
Asigură-te că ai PostgreSQL instalat și că baza de date `website` este creată cu schema din `database/schema.sql`.

### 2. Configurare PHP
În toate fișierele PHP din directorul `api/`, modifică configurația bazei de date:

```php
$host = 'localhost';
$dbname = 'website';
$username = 'postgres';
$password = 'your_actual_password'; // Înlocuiește cu parola ta
```

### 3. Crearea Utilizatorului de Test
Rulează scriptul pentru a crea un utilizator de test:

```bash
php api/create-test-user.php
```

Acest script va crea:
- Un utilizator cu email: `test@example.com` și parolă: `test123`
- O adresă de livrare
- 3 produse de test
- 3 comenzi de test cu statusuri diferite

## Utilizare

### 1. Accesare Pagină de Login
Deschide `login.html` în browser. Vei vedea un formular elegant de autentificare.

### 2. Autentificare
- Email: `test@example.com`
- Parolă: `test123`

### 3. Vizualizare Comenzi
După autentificare, vei fi redirecționat automat la `orders.html` unde poți:
- Vedea statisticile comenzilor
- Filtra comenzile după status și dată
- Clic pe o comandă pentru a vedea detaliile complete
- Deconecta-te din sistem

## Caracteristici Tehnice

### Frontend
- **HTML5** cu structură semantică
- **CSS3** cu Flexbox și Grid pentru layout
- **JavaScript ES6+** pentru funcționalitate
- **Font Awesome** pentru iconuri
- **Google Fonts** (Inter) pentru tipografie
- Design responsive pentru mobile, tablet și desktop

### Backend
- **PHP 7.4+** pentru API-uri
- **PostgreSQL** pentru baza de date
- **JWT** pentru autentificare (implementare simplă)
- **PDO** pentru conexiunea la baza de date
- **CORS** configurat pentru cross-origin requests

### Securitate
- Parole hash-uite cu `password_hash()`
- Validare input pe server
- Token JWT pentru autentificare
- Verificare autorizare pentru fiecare request
- Sanitizare date din baza de date

## API Endpoints

### POST /api/login.php
Autentificare utilizator
```json
{
  "email": "test@example.com",
  "password": "test123"
}
```

### GET /api/orders.php
Listare comenzi (necesită Authorization header)
```
Authorization: Bearer <token>
```

### GET /api/order-details.php?order_id=<id>
Detalii comandă (necesită Authorization header)
```
Authorization: Bearer <token>
```

## Personalizare

### Culori
Modifică variabilele CSS din fișierele de stil pentru a schimba schema de culori:

```css
/* Culori principale */
--primary-color: #667eea;
--secondary-color: #764ba2;
--success-color: #43e97b;
--warning-color: #f093fb;
--danger-color: #f56565;
```

### Fonturi
Schimbă fontul principal modificând în CSS:
```css
font-family: 'Inter', sans-serif;
```

## Depanare

### Probleme Comune

1. **Eroare de conexiune la baza de date**
   - Verifică configurația PostgreSQL
   - Asigură-te că parola este corectă
   - Verifică că baza de date `website` există

2. **Token invalid**
   - Șterge localStorage și reconectează-te
   - Verifică că secret key-ul este același în toate fișierele PHP

3. **Comenzi nu se încarcă**
   - Verifică că utilizatorul de test a fost creat
   - Verifică că există comenzi în baza de date
   - Verifică console-ul browser-ului pentru erori

### Logs
Verifică log-urile PHP pentru erori:
```bash
tail -f /var/log/apache2/error.log
```

## Extensii Viitoare

- Sistem de înregistrare utilizatori
- Resetare parolă
- Notificări email pentru status comenzi
- Export comenzi în PDF
- Sistem de review-uri pentru produse
- Wishlist pentru utilizatori

## Suport

Pentru probleme sau întrebări, verifică:
1. Console-ul browser-ului (F12)
2. Log-urile PHP
3. Configurația bazei de date
4. Că toate fișierele sunt în locațiile corecte 