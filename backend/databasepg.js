const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Inițializare client Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

if (supabaseUrl && supabaseKey) {
    console.log("Database connected via Supabase");
} else {
    console.log("Database connection error: Missing Supabase configuration");
}

module.exports = supabase; 