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
app.use(express.static('public')); // Servește fișierele din 'public'

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
    if (!req.body || !req.body.items) {
      return res.status(400).json({
        message: 'Datele comenzii lipsesc. Asigură-te că trimiți un corp JSON valid cu "items".'
      });
    }

    const { items, shipping, payment, date } = req.body;
    const shippingObj = shipping || {};
    const paymentObj = payment || {};
    const orderDate = date || new Date().toISOString();

    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shippingCost = shippingObj.cost || 0;
    const finalTotal = totalAmount + shippingCost;

    const { data: newOrder, error: orderError } = await supabase
      .from('orders')
      .insert([
        {
          order_date: orderDate,
          total_amount: finalTotal,
          payment_method: paymentObj.method,
          shipping_details: shippingObj,
          items: items,
          status: 'pending'
        }
      ])
      .select()
      .single();

    if (orderError) throw orderError;

    console.log('Comandă salvată:', newOrder.order_id);

    for (const item of items) {
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

    const { items, shipping, payment } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Coșul de cumpărături este gol.' });
    }

    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const taxRate = 0.19;
    const tax = subtotal * taxRate;
    const shippingCost = shipping?.cost || 0;
    const total = subtotal + tax + shippingCost;

    const { data: newOrder, error: orderError } = await supabase
      .from('orders')
      .insert([
        {
          order_date: new Date().toISOString(),
          total_amount: total,
          payment_method: payment?.method,
          shipping_details: shipping,
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

// Pornim serverul pe 0.0.0.0 ca să fie accesibil în rețea
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Serverul pornește...`);
  console.log(`🌐 Accesează de pe alt dispozitiv: http://${localIp}:${PORT}`);
  console.log(`💡 Ex: http://192.168.1.100:${PORT}`);
  console.log(`ℹ️  Toate dispozitivele trebuie să fie pe aceeași rețea Wi-Fi.`);
});