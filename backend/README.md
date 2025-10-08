## Backend Configuration

### 1. Environment Variables
Copiezi `.env.example` in `.env` si completezi valorile reale:

```
EMAIL_USER=alexa@example.com
EMAIL_PASS=app-password-16chars
GPT5_ENABLED=false
```

`EMAIL_USER` si `EMAIL_PASS` sunt folosite pentru trimiterea emailurilor de confirmare comanda. Foloseste un Gmail App Password.

### 2. Feature Flags
Endpoint-uri disponibile:

GET `/admin/api/feature-flags` -> Lista flaguri.

PUT `/admin/api/feature-flags/gpt5` body: `{ "enabled": true }` (necesita token admin) -> Activeaza/dezactiveaza GPT-5.

Valoarea initiala este citita din `GPT5_ENABLED` din `.env` (true/false).

### 3. Email Confirmare Comenzi
La acceptarea unei comenzi se trimite email catre `user_email` daca `EMAIL_USER` si `EMAIL_PASS` sunt definite. Daca lipsesc, se afiseaza un avertisment si emailul nu este trimis.

Health check: `GET /admin/api/email-health` -> `{ emailConfigured: true|false }`.

### 4. Securitate
- NU comite parole reale in Git.
- Daca o parola a fost expusa, regenereaz-o imediat.
- Poti muta si Supabase key in `.env` pentru extra siguranta.

### 4.1 Supabase Config
Mută cheile în `.env`:

```
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_ANON_KEY=anon-key
```

După mutare, elimină fallback-ul hardcodated dacă dorești strictețe. Dacă cheia a fost expusă, generează una nouă din Dashboard > API.

### 5. Rotatia parolelor expuse (App Password Gmail)
Daca ai pus din greseala un App Password in cod / repo:
1. Intra la https://myaccount.google.com/security
2. Sectionea "App passwords" / "Parole pentru aplicatii".
3. Sterge (Revoke) parola veche.
4. Genereaza alta noua.
5. Actualizeaza `.env` local: `EMAIL_PASS=new-app-password`.
6. Restarteaza serverul.
7. Verifica in logs ca NU mai apare avertismentul.

### 6. Testare Email Local
- Pune temporar `console.log('Sending email to', destinatar)` inainte de `transporter.sendMail` pentru debug.
- Foloseste o adresa alternativa pe post de destinatar pentru a nu trimite accidental catre clienti reali.

### 7. Extindere ulterioara
Poti adauga:
- Queue (Bull / Redis) pentru trimitere email asincrona.
- Template-uri HTML (ex: Handlebars / MJML).
- Logging structurat (ex: pino) pentru audit.

