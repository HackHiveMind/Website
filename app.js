const{Client}=require('pg')
const { host, user, port, password, database } = require('pg/lib/defaults.js')
const express = require('express');
const app = express();
const adminRoutes = require('./routes/admin');
const path = require('path');

app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // pentru body JSON

// Servire fișiere statice pentru admin (CSS, JS, etc)
app.use('/admin/static', express.static(path.join(__dirname, 'admin/views')));

const con=new Client({
    host: "localhost",
    user: "supabase",
    port: 5432,
    password: "soimilor9",
    database:"databases"  
})   

con.connect().then(()=> console.log("connected"))
app.use('/admin', adminRoutes);

// Pornire server
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Serverul admin rulează pe http://localhost:${PORT}/admin/login`);
});
