const express = require('express');
const path = require('path');
const router = express.Router();

// Dummy admin user
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

// Servire pagina de login admin
router.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../admin/views/login.html'));
});

// Servire dashboard admin
router.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '../admin/views/dashboard.html'));
});

// Login admin
router.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    res.json({
      success: true,
      token: 'dummy-admin-token',
      user: { email }
    });
  } else {
    res.json({ success: false, message: 'Date incorecte!' });
  }
});

// Middleware simplu pentru autentificare (verifică tokenul dummy)
function adminAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (auth && auth === 'Bearer dummy-admin-token') {
    next();
  } else {
    res.status(401).json({ success: false, message: 'Neautorizat' });
  }
}

// Listare comenzi (doar pentru admin autentificat)
router.get('/api/orders', adminAuth, (req, res) => {
  res.json({ success: true, orders: ORDERS });
});

module.exports = router; 