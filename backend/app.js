// Încărcare configurație din .env
require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');
const express = require('express');
const app = express();
const adminRoutes = require('./routes/admin');
const path = require('path');

// Inițializare client Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Verificare conexiune Supabase
if (supabaseUrl && supabaseKey) {
    console.log("Supabase client initialized successfully");
} else {
    console.log("Supabase configuration missing in .env");
}

// Exportare supabase client pentru folosire în rute
app.locals.supabase = supabase;

app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // pentru body JSON

// Servire fișiere statice pentru admin (CSS, JS, etc)
app.use('/admin/static', express.static(path.join(__dirname, 'admin/views')));

app.use('/admin', adminRoutes);

// Pornire server
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Serverul admin rulează pe http://localhost:${PORT}/admin/login`);
});
