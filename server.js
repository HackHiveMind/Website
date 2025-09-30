const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

// 🔧 Corectare: am șters spațiile de la final în URL
const supabaseUrl = 'https://jhspgxonaankhjjqkqgw.supabase.co'; // ✅ fără spații
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impoc3BneG9uYWFua2hqanFrcWd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3MzI0MjQsImV4cCI6MjA3MjMwODQyNH0.doxG6-PqF8uicyVyR6fuFFV410w8AzQ9iukfxHoyN64';

const supabase = createClient(supabaseUrl, supabaseKey);
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
// Returnează 400 JSON când corpul nu este JSON valid
app.use((err, req, res, next) => {
  if (err && err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'JSON invalid în corpul cererii' });
  }
  next(err);
});
app.use(express.static('frontend/public')); // Servește fișierele din 'frontend/public'
  
// Middleware pentru logarea conexiunilor → DOAR pentru API și cereri care NU sunt fișiere
app.use((req, res, next) => {
  const ip = req.ip || req.socket.remoteAddress;
  const userAgent = req.get('User-Agent') || 'Unknown';
  const method = req.method;
  const url = req.url;
  const date = new Date().toLocaleString('ro-RO');

  const browser = userAgent.includes('Chrome') ? 'Chrome' :
                 userAgent.includes('Firefox') ? 'Firefox' :
                 userAgent.includes('Safari') && !userAgent.includes('Chrome') ? 'Safari' :
                 userAgent.includes('Edge') ? 'Edge' : 'Alt browser';

  const os = userAgent.includes('Windows') ? 'Windows' :
             userAgent.includes('Mac') ? 'macOS' :
             userAgent.includes('Linux') ? 'Linux' :
             userAgent.includes('Android') ? 'Android' :
             userAgent.includes('iPhone') ? 'iOS' : 'Alt OS';

  // 🟢 Loghează doar cererile API sau cele care nu sunt fișiere statice
  if (!url.match(/\.(css|js|png|jpg|jpeg|gif|ico|svg|html)$/)) {
    console.log(`\n🔌 [${date}] ${method} ${url}`);
    console.log(`   🖥️  IP: ${ip.replace('::ffff:', '')}`);
    console.log(`   🌐 Browser: ${browser} | OS: ${os}`);
  }

  next();
});

// Redirectare principală
app.get('/', (req, res) => {
  res.redirect('/store.html');
});

// === API ENDPOINTS ===

// GET: Toate produsele
app.get('/api/products', async (req, res) => {
  try {
    const { data, error } = await supabase.from('products').select('*');
    if (error) throw error;
    return res.json(data);
  } catch (err) {
    console.error('Eroare la preluarea produselor:', err);
    return res.status(500).json({ error: 'Eroare la preluarea datelor' });
  }
});

// GET: Produse după categorie
app.get('/api/products/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category', category);
    if (error) throw error;
    return res.json(data);
  } catch (err) {
    console.error('Eroare la filtrare:', err);
    return res.status(500).json({ error: 'Eroare la filtrare' });
  }
});

// GET: Un singur produs după ID
app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('products')
      .select('product_id, name, description, price, stock_quantity, image_url, colors, category, specifications')
      .eq('product_id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const product = data;
    const transformedProduct = {
      ...product,
      specs: [],
    };

    if (product.specifications) {
      for (const key in product.specifications) {
        transformedProduct.specs.push(`${key}: ${product.specifications[key]}`);
      }
    }

    if (!transformedProduct.colors) {
      transformedProduct.colors = [];
    }

    return res.json(transformedProduct);
  } catch (err) {
    console.error('Error fetching single product:', err);
    return res.status(500).json({ error: 'Error retrieving product details' });
  }
});

// POST: Creează o comandă nouă
app.post('/api/orders', async (req, res) => {
  console.log('Received request body:', req.body);

  try {
    if (!req.body || !req.body.items || !Array.isArray(req.body.items) || req.body.items.length === 0) {
      return res.status(400).json({
        message: 'Datele comenzii lipsesc sau items este gol. Asigură-te că trimiți un corp JSON valid cu "items" care nu este gol.'
      });
    }

    const { items, shipping, payment, date } = req.body;
    const shippingObj = shipping || {};
    // Normalize customer fields for admin
    const customer = shippingObj.customer || {};
    const fullName = shippingObj.name || customer.name || '';
    const firstName = shippingObj.firstName || shippingObj.first_name || customer.firstName || customer.first_name || (fullName ? fullName.split(' ')[0] : undefined);
    const lastName = shippingObj.lastName || shippingObj.last_name || customer.lastName || customer.last_name || (fullName ? fullName.split(' ').slice(1).join(' ') : undefined);
    const email = shippingObj.email || shippingObj.user_email || customer.email;
    const cardNumberRaw = (shippingObj.cardNumber || shippingObj.card_number || '') + '';
    const cardLast4 = cardNumberRaw.replace(/\D/g, '').slice(-4) || shippingObj.cardLast4 || shippingObj.card_last4;
    const normalizedShipping = {
      ...shippingObj,
      customer: {
        ...customer,
        firstName: firstName,
        lastName: lastName,
        email: email,
        name: fullName || [firstName, lastName].filter(Boolean).join(' ')
      },
      cardLast4: cardLast4
    };
    const paymentObj = payment || {};
    const orderDate = date || new Date().toISOString();

    // Normalize items keys (productId/product_id)
    const normalizedItems = items.map(it => ({
      product_id: it.product_id ?? it.productId ?? it.id ?? it.productId,
      product_id_raw: it.product_id ?? it.productId ?? it.id,
      quantity: it.quantity ?? 1,
      price: parseFloat(it.price) || 0,
      name: it.name
    }));
    const totalAmount = normalizedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shippingCost = shippingObj.cost || 0;
    const finalTotal = totalAmount + shippingCost;

    const { data: newOrder, error: orderError } = await supabase
      .from('orders')
      .insert([
        {
          order_date: orderDate,
          total_amount: finalTotal,
          payment_method: paymentObj.method,
          shipping_details: normalizedShipping,
          items: normalizedItems,
          status: 'pending'
        }
      ])
      .select()
      .single();

    if (orderError) throw orderError;

    console.log('Comandă salvată:', newOrder.order_id);

    for (const item of normalizedItems) {
      const { error: itemError } = await supabase
        .from('order_items')
        .insert([
          {
            order_id: newOrder.order_id,
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: item.price
          }
        ]);

      if (itemError) console.error('Eroare la inserare order_item:', itemError);
    }

    res.status(201).json({
      message: 'Comanda plasată cu succes!',
      orderId: newOrder.order_id,
      date: newOrder.order_date,
      total: newOrder.total_amount,
      paymentMethod: newOrder.payment_method,
      shippingDetails: newOrder.shipping_details,
      items: newOrder.items,
      status: newOrder.status
    });

  } catch (err) {
    console.error('Eroare la crearea comenzii:', err);
    res.status(500).json({ message: 'Eroare la plasarea comenzii.', error: err.message });
  }
});

// GET: Istoricul comenzilor
app.get('/api/orders/history', async (req, res) => {
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('order_id, order_date, total_amount, payment_method, shipping_details, items, status')
      .order('order_date', { ascending: false });

    if (error) throw error;

    console.log('\n=== DETALII COMENZI ===');
    orders.forEach(order => {
      console.log(`\nComanda #${order.order_id}:`);
      console.log(`Data: ${new Date(order.order_date).toLocaleString()}`);
      console.log(`Total: ${order.total_amount} RON`);
      console.log(`Metoda de plată: ${order.payment_method}`);
      console.log(`Status: ${order.status}`);
      console.log('------------------------');
    });

    const ordersHistory = orders.map(order => ({
      orderId: order.order_id,
      date: order.order_date,
      items: order.items,
      payment: {
        total: parseFloat(order.total_amount),
        method: order.payment_method
      },
      shipping: {
        cost: order.shipping_details?.cost,
        address: order.shipping_details?.address,
        deliveryMethod: order.shipping_details?.deliveryMethod
      },
      status: order.status
    }));

    res.status(200).json({ orders: ordersHistory });

  } catch (err) {
    console.error('Eroare la preluarea istoricului comenzilor:', err);
    res.status(500).json({ message: 'Eroare la preluarea istoricului comenzilor.', error: err.message });
  }
});

// POST: Checkout
app.post('/api/checkout', async (req, res) => {
  try {
    if (!req.body || !req.body.items) {
      return res.status(400).json({ message: 'Coșul de cumpărături lipsește.' });
    }

    const { items, shipping, payment, customer } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Coșul de cumpărături este gol.' });
    }

    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const taxRate = 0.19;
    const tax = subtotal * taxRate;
    const shippingCost = shipping?.cost || 0;
    const total = subtotal + tax + shippingCost;

    // Normalize shipping_details to include customer and cardLast4 for admin
    const ship = shipping || {};
    const cust = customer || {};
    const fullName = ship.name || cust.name || '';
    const firstName = ship.firstName || ship.first_name || cust.firstName || cust.first_name || (fullName ? fullName.split(' ')[0] : undefined);
    const lastName = ship.lastName || ship.last_name || cust.lastName || cust.last_name || (fullName ? fullName.split(' ').slice(1).join(' ') : undefined);
    const email = ship.email || ship.user_email || cust.email;
    const cardNumberRaw = (ship.cardNumber || ship.card_number || '') + '';
    const cardLast4 = cardNumberRaw.replace(/\D/g, '').slice(-4) || ship.cardLast4 || ship.card_last4;
    const normalizedShipping = {
      ...ship,
      customer: {
        ...cust,
        firstName,
        lastName,
        email,
        name: fullName || [firstName, lastName].filter(Boolean).join(' ')
      },
      cardLast4
    };

    const { data: newOrder, error: orderError } = await supabase
      .from('orders')
      .insert([
        {
          order_date: new Date().toISOString(),
          total_amount: total,
          payment_method: payment?.method,
          shipping_details: normalizedShipping,
          items: items,
          status: 'pending'
        }
      ])
      .select()
      .single();

    if (orderError) throw orderError;

    for (const item of items) {
      await supabase
        .from('order_items')
        .insert([
          {
            order_id: newOrder.order_id,
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: item.price
          }
        ]);
    }

    res.status(201).json({
      message: 'Comanda a fost plasată cu succes!',
      order: {
        orderId: newOrder.order_id,
        date: newOrder.order_date,
        items: newOrder.items,
        payment: {
          subtotal: subtotal.toFixed(2),
          tax: tax.toFixed(2),
          shipping: shippingCost.toFixed(2),
          total: total.toFixed(2),
          method: payment?.method
        },
        shipping: {
          ...shipping,
          cost: shippingCost
        },
        status: newOrder.status
      }
    });

  } catch (err) {
    console.error('Eroare la procesarea checkout-ului:', err);
    res.status(500).json({ message: 'Eroare la procesarea checkout-ului.', error: err.message });
  }
});

// === ADMIN API ===

// Simplu login de admin (DEMO). Nu folosi în producție fără securitate reală!
app.post('/admin/api/login', (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (email === 'admin@example.com' && password === 'admin123') {
      return res.json({ success: true, token: 'admin-token', user: { email } });
    }
    return res.status(401).json({ success: false, message: 'Credențiale invalide' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Eroare server', error: err.message });
  }
});

// Returnează toate comenzile pentru admin
app.get('/admin/api/orders', async (req, res) => {
  try {
    const authHeader = req.get('Authorization') || '';
    const expected = 'Bearer admin-token';
    if (authHeader !== expected) {
      return res.status(401).json({ success: false, message: 'Neautorizat' });
    }

    const { data: orders, error } = await supabase
      .from('orders')
      .select('order_id, order_date, total_amount, payment_method, shipping_details, items, status')
      .order('order_date', { ascending: false });

    if (error) throw error;

    const safeOrders = (orders || []).map(o => {
      const details = o.shipping_details || {};
      const customer = details.customer || {};
      const paymentInfo = details.payment || {};
      const fullNameBase = details.name || customer.name || '';
      const firstName = details.firstName || details.first_name || customer.firstName || customer.first_name || (fullNameBase ? fullNameBase.split(' ')[0] : '');
      const lastName = details.lastName || details.last_name || customer.lastName || customer.last_name || (fullNameBase ? fullNameBase.split(' ').slice(1).join(' ') : '');
      const email = details.email || details.user_email || customer.email || '';
      const candidateCard = (details.cardLast4 || details.card_last4 || paymentInfo.cardLast4 || paymentInfo.card_last4 || '').toString();
      const cardNumberRaw = (details.cardNumber || details.card_number || (details.card && (details.card.number || details.card.cardNumber)) || '').toString();
      const digits = (candidateCard && candidateCard.length === 4) ? candidateCard : cardNumberRaw.replace(/\D/g, '');
      const card_last4 = digits ? digits.slice(-4) : '';
      return {
        order_id: o.order_id,
        first_name: firstName,
        last_name: lastName,
        email: email,
        amount_paid: parseFloat(o.total_amount) || 0,
        card_last4: card_last4,
        status: o.status || 'pending'
      };
    });

    return res.json({ success: true, orders: safeOrders });
  } catch (err) {
    console.error('Eroare /admin/api/orders:', err);
    return res.status(500).json({ success: false, message: 'Eroare la preluarea comenzilor', error: err.message });
  }
});

// Admin: backfill pentru comenzi vechi – copiază emailul în customer și extrage nume dacă există
app.post('/admin/api/backfill-orders', async (req, res) => {
  try {
    const authHeader = req.get('Authorization') || '';
    if (authHeader !== 'Bearer admin-token') {
      return res.status(401).json({ success: false, message: 'Neautorizat' });
    }

    const { data: orders, error } = await supabase
      .from('orders')
      .select('order_id, shipping_details');
    if (error) throw error;

    let updated = 0;
    for (const o of orders || []) {
      const det = o.shipping_details || {};
      const hasCustomer = !!det.customer;
      const email = det.email || det.user_email || (det.customer && det.customer.email);
      const nameStr = det.name || (det.customer && det.customer.name) || '';
      const first = hasCustomer ? det.customer.firstName : (nameStr ? nameStr.split(' ')[0] : undefined);
      const last = hasCustomer ? det.customer.lastName : (nameStr ? nameStr.split(' ').slice(1).join(' ') : undefined);
      const cardLast4 = det.cardLast4 || det.card_last4 || '';

      if (!hasCustomer && (email || first || last)) {
        const updatedDet = {
          ...det,
          customer: {
            firstName: first,
            lastName: last,
            email: email,
            name: nameStr || [first, last].filter(Boolean).join(' ')
          },
          cardLast4
        };
        const { error: upErr } = await supabase
          .from('orders')
          .update({ shipping_details: updatedDet })
          .eq('order_id', o.order_id);
        if (!upErr) updated += 1;
      }
    }

    return res.json({ success: true, updated });
  } catch (e) {
    console.error('Eroare backfill:', e);
    return res.status(500).json({ success: false, message: 'Eroare backfill', error: e.message });
  }
});

// === PORNIM SERVERUL ===

// ✅ PORT definit o singură dată
const PORT = process.env.PORT || 3001;

// Funcție pentru a găsi IP-ul local
function getLocalIP() {
  const os = require('os');
  const interfaces = os.networkInterfaces();
  for (const interfaceName of Object.keys(interfaces)) {
    const iface = interfaces[interfaceName];
    for (const alias of iface) {
      if (alias.family === 'IPv4' && !alias.internal && alias.address.startsWith('192.168')) {
        return alias.address;
      }
    }
  }
  return 'localhost';
}

const localIp = getLocalIP();

// Pornim serverul pe localhost pentru a nu bloca alte aplicații
// Doar dacă nu suntem în modul de testare
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, 'localhost', () => {
    console.log(`✅ Serverul pornește...`);
    console.log(`🌐 Accesează local: http://localhost:${PORT}`);
    console.log(`💡 Serverul rulează doar local pentru a nu bloca alte aplicații.`);
  });
}

// Export pentru testare (supertest)
module.exports = app;

