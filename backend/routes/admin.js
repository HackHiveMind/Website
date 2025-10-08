require('dotenv').config();
const express = require('express');
const path = require('path');
const router = express.Router();

// === Email transporter (env based) ===
const nodemailer = require('nodemailer');
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
let transporter = null;
if (EMAIL_USER && EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: EMAIL_USER, pass: EMAIL_PASS }
  });
} else {
  console.warn('⚠️  EMAIL_USER / EMAIL_PASS lipsesc. Email-urile NU vor fi trimise.');
}

// Import pentru conexiunea la baza de date
const { createClient } = require('@supabase/supabase-js');

// Configurare Supabase din env (fallback dev)
const supabaseUrl = process.env.SUPABASE_URL || 'https://jhspgxonaankhjjqkqgw.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impoc3BneG9uYWFua2hqanFrcWd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3MzI0MjQsImV4cCI6MjA3MjMwODQyNH0.doxG6-PqF8uicyVyR6fuFFV410w8AzQ9iukfxHoyN64';
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  console.warn('⚠️  Folosesti fallback Supabase URL/KEY în admin.js. Seteaza SUPABASE_URL și SUPABASE_ANON_KEY în .env.');
}
const supabase = createClient(supabaseUrl, supabaseKey);
// (transporter deja definit mai sus)

// Dummy admin user pentru fallback
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'admin123';

// Dummy orders
const ORDERS = [
  {
    order_id: 1,
    order_date: '2024-06-01',
    total_amount: 150,
    status: 'livrat',
    tracking_number: 'TRK123',
    user_email: 'client1@example.com'
  },
  {
    order_id: 2,
    order_date: '2024-06-02',
    total_amount: 200,
    status: 'expediat',
    tracking_number: 'TRK456',
    user_email: 'client2@example.com'
  }
];

// === Feature Flags (in-memory) ===
let gpt5Enabled = (process.env.GPT5_ENABLED || 'false').toLowerCase() === 'true';

// Endpoint: list feature flags
router.get('/api/feature-flags', (req, res) => {
  res.json({ success: true, flags: { gpt5: gpt5Enabled } });
});

// Update specific flag (requires admin auth)
router.put('/api/feature-flags/gpt5', adminAuth, (req, res) => {
  const { enabled } = req.body || {};
  if (typeof enabled !== 'boolean') {
    return res.status(400).json({ success: false, message: 'Campul enabled (boolean) este obligatoriu' });
  }
  gpt5Enabled = enabled;
  res.json({ success: true, gpt5: gpt5Enabled });
});

// Email health endpoint
router.get('/api/email-health', (req, res) => {
  res.json({
    success: true,
    emailConfigured: !!(EMAIL_USER && EMAIL_PASS),
    userSet: !!EMAIL_USER,
    passSet: !!EMAIL_PASS
  });
});

// Servire resurse statice pentru admin (CSS și JS)
router.get('/styles/admin.css', (req, res) => {
  res.setHeader('Content-Type', 'text/css');
  res.sendFile(path.join(__dirname, '../../frontend/styles/admin.css'));
});

router.get('/scripts/admin.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile(path.join(__dirname, '../../frontend/scripts/admin.js'));
});

// Servire pagina de login admin
router.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/admin.html'));
});

// Servire dashboard admin  
router.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/admin.html'));
});

// Login admin
router.post('/api/login', (req, res) => {
  console.log('🔍 Login attempt - req.body:', req.body);
  console.log('🔍 Content-Type:', req.get('Content-Type'));
  
  if (!req.body) {
    return res.status(400).json({ 
      success: false, 
      message: 'Body lipsă - verifică Content-Type: application/json' 
    });
  }
  
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ 
      success: false, 
      message: 'Email și password sunt obligatorii' 
    });
  }
  
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    res.json({
      success: true,
      token: 'admin-token',
      user: { email }
    });
  } else {
    res.json({ success: false, message: 'Credențiale invalide!' });
  }
});

// Middleware simplu pentru autentificare (verifică tokenul corect)
function adminAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (auth && auth === 'Bearer admin-token') {
    next();
  } else {
    console.log('🔒 Auth failed - received:', auth);
    res.status(401).json({ success: false, message: 'Neautorizat' });
  }
}

// Listare comenzi (cu date reale din Supabase)
router.get('/api/orders', adminAuth, async (req, res) => {
  try {
    // Încearcă să obții date reale din Supabase - TOATE comenzile
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        order_id,
        order_date,
        total_amount,
        status,
        tracking_number,
        user_id,
        payment_method
      `)
      .order('order_date', { ascending: false });
      // ❌ ELIMINAT .limit(50) pentru a afișa TOATE comenzile

    if (error) {
      console.log('❌ Eroare Supabase orders:', error);
      // Fallback la date dummy
      res.json({ 
        success: true, 
        orders: ORDERS,
        source: 'dummy_data',
        error: 'Conexiune DB indisponibilă'
      });
    } else {
      res.json({ 
        success: true, 
        orders: orders || [],
        source: 'supabase',
        count: orders?.length || 0
      });
    }
  } catch (error) {
    console.log('❌ Eroare catch orders:', error);
    // Fallback la date dummy
    res.json({ 
      success: true, 
      orders: ORDERS,
      source: 'dummy_data',
      error: error.message
    });
  }
});

// Statistici dashboard (NOUĂ RUTĂ)
router.get('/api/stats', adminAuth, async (req, res) => {
  try {
    // Obține statistici reale din Supabase
    const [ordersCount, usersCount, totalRevenue] = await Promise.all([
      supabase.from('orders').select('order_id', { count: 'exact' }),
      supabase.from('users').select('user_id', { count: 'exact' }),
      supabase.from('orders').select('total_amount').eq('status', 'completed')
    ]);

    let stats = {
      totalOrders: 0,
      totalUsers: 0,
      totalRevenue: 0,
      conversionRate: 0,
      source: 'dummy_data'
    };

    if (!ordersCount.error && !usersCount.error) {
      const revenue = totalRevenue.data?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
      
      stats = {
        totalOrders: ordersCount.count || 0,
        totalUsers: usersCount.count || 0,
        totalRevenue: revenue,
        conversionRate: ordersCount.count && usersCount.count ? 
          ((ordersCount.count / usersCount.count) * 100).toFixed(1) : 0,
        source: 'supabase'
      };
    } else {
      // Fallback la date dummy
      stats = {
        totalOrders: 1250,
        totalUsers: 850,
        totalRevenue: 125430,
        conversionRate: 15.8,
        source: 'dummy_data',
        error: 'Conexiune DB indisponibilă'
      };
    }

    res.json({ success: true, stats });
  } catch (error) {
    console.log('❌ Eroare stats:', error);
    // Fallback la date dummy
    res.json({ 
      success: true, 
      stats: {
        totalOrders: 1250,
        totalUsers: 850,
        totalRevenue: 125430,
        conversionRate: 15.8,
        source: 'dummy_data',
        error: error.message
      }
    });
  }
});

// Date financiare (NOUĂ RUTĂ)
router.get('/api/financial-data', adminAuth, async (req, res) => {
  try {
    // Obține date financiare reale din Supabase
    const { data: orders, error } = await supabase
      .from('orders')
      .select('total_amount, status, order_date');

    let financialData = {
      income: { paid: 0, unpaid: 0, overdue: 0 },
      tvaLimit: { revenue: 300000, remaining: 300000 },
      vatBalance: { balance: 0, sales: 0 },
      source: 'dummy_data'
    };

    if (!error && orders) {
      const currentYear = new Date().getFullYear();
      const currentYearOrders = orders.filter(order => 
        new Date(order.order_date).getFullYear() === currentYear
      );
      
      const paid = currentYearOrders
        .filter(o => o.status === 'completed')
        .reduce((sum, o) => sum + (o.total_amount || 0), 0);
      
      const unpaid = currentYearOrders
        .filter(o => o.status === 'pending')
        .reduce((sum, o) => sum + (o.total_amount || 0), 0);
      
      const totalRevenue = paid + unpaid;
      
      financialData = {
        income: { 
          paid: Math.round(paid), 
          unpaid: Math.round(unpaid), 
          overdue: 0 
        },
        tvaLimit: { 
          revenue: 300000, 
          remaining: Math.max(0, 300000 - totalRevenue)
        },
        vatBalance: { 
          balance: Math.round(paid * 0.19), // 19% TVA
          sales: Math.round(paid)
        },
        source: 'supabase'
      };
    } else {
      // Fallback la date dummy
      financialData = {
        income: { paid: 125430, unpaid: 25000, overdue: 5000 },
        tvaLimit: { revenue: 300000, remaining: 174570 },
        vatBalance: { balance: 23500, sales: 125430 },
        source: 'dummy_data',
        error: error?.message || 'Conexiune DB indisponibilă'
      };
    }

    res.json({ success: true, data: financialData });
  } catch (error) {
    console.log('❌ Eroare financial-data:', error);
    // Fallback la date dummy
    res.json({ 
      success: true, 
      data: {
        income: { paid: 125430, unpaid: 25000, overdue: 5000 },
        tvaLimit: { revenue: 300000, remaining: 174570 },
        vatBalance: { balance: 23500, sales: 125430 },
        source: 'dummy_data',
        error: error.message
      }
    });
  }
});

// Backfill orders (Data Migration)
// Modificare status comandă
router.put('/api/orders/:id/status', adminAuth, async (req, res) => {
  const orderId = req.params.id;
  const { status } = req.body;
  if (!orderId || !status) {
    return res.status(400).json({ success: false, message: 'ID și status sunt obligatorii' });
  }
  try {
    // Actualizează statusul în Supabase
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('order_id', orderId);
    if (error) {
      console.error('❌ Eroare update status:', error);
      return res.status(500).json({ success: false, message: 'Eroare la actualizarea statusului', error: error.message });
    }

    // Trimite email de confirmare dacă statusul este "accepted"
    if (status === 'accepted') {
      // Preia comanda pentru email
      const { data: orders, error: getError } = await supabase
        .from('orders')
        .select('user_email, order_id, total_amount')
        .eq('order_id', orderId)
        .limit(1);
      if (!getError && orders && orders.length > 0) {
        const order = orders[0];
        const mailOptions = {
          from: 'your.email@gmail.com',
          to: order.user_email,
          subject: 'Confirmare comandă #'+order.order_id,
          text: `Comanda ta (#${order.order_id}) a fost acceptată! Total: ${order.total_amount} RON. Îți mulțumim pentru achiziție!`
        };
        try {
          await transporter.sendMail(mailOptions);
        } catch (mailErr) {
          console.error('❌ Eroare trimitere email:', mailErr);
          // Nu opresc flow-ul dacă emailul eșuează
        }
      }
    }
    res.json({ success: true, message: 'Status actualizat cu succes' });
  } catch (err) {
    console.error('❌ Eroare catch update status:', err);
    res.status(500).json({ success: false, message: 'Eroare la actualizarea statusului', error: err.message });
  }
});
router.post('/api/backfill-orders', adminAuth, async (req, res) => {
  try {
    // Simulez o migrare de date
    console.log('🔧 Executând backfill orders...');
    
    // În practică aici ai face actualizări în baza de date
    // Pentru demo, returnez că s-au actualizat 0 înregistrări
    
    res.json({
      success: true,
      message: 'Actualizate 0 comenzi cu informații customer',
      updated: 0
    });
  } catch (error) {
    console.error('❌ Eroare backfill orders:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la actualizarea comenzilor',
      error: error.message
    });
  }
});

module.exports = router; 