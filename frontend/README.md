# Website

## Ce am construit

Am creat un site web pentru un magazin online.

### Cum functioneaza:

**Frontend 
- Am facut pagini simple cu HTML si CSS
- Oamenii pot vedea produse
- Pot sa faca comenzi


**Backend 
- Am folosit Node.js cu Express
- Toate datele le tin in Supabase 
- Am facut API-uri pentru a lua si salva informatii

## Ce am folosit 

- **Node.js** - pentru server
- **Express** - pentru rutele web
- **Supabase** - pentru baza de date
- **HTML/CSS/JavaScript** - pentru interfata

## Cum sa pornesti proiectul

### 1. Cloneaza codul 
\`\`\`bash
git clone https://github.com/HackHiveMind/Website.git
cd Website
\`\`\`

### 2. Instaleaza pachetele json
\`\`\`bash
npm install
\`\`\`

### 3. Configureaza baza de date
- Mergi pe supabase.com si faci cont
- Creezi un proiect nou
- Copiezi URL-ul si cheia API



### 4. Pornesti serverul
\`\`\`node.js
node server.js
\`\`\`

Mergi la http://localhost:3001 si ar trebui sa vezi site-ul!

## Structura proiectului

\`\`\`
Website/
├── server.js          # Serverul principal
├── app.js            # Configurari Express
├── routes/           # Rutele pentru pagini
├── public/           # Fisiere CSS, JS, imagini
├── admin/            # Panoul de admin
└── package.json      # Dependentele
\`\`\`

## Cum functioneaza fiecare parte

**server.js** - Aici pornesc serverul si conectez totul
**routes/** - Aici am pus toate paginile (home, produse, comenzi)
**public/** - Fisierele statice (CSS, imagini, JavaScript)