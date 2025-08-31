// server.js
const express = require('express');
const cors = require('cors');
const pool = require('./db'); // fișierul db.js cu conexiunea la PostgreSQL

const app = express();

app.use(cors()); // PERMITE CERERI DIN FRONT-END
app.use(express.json()); // PENTRU A CITI BODY-UL JSON

// Endpoint: returnează toate produsele
app.get('/api/products', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM products');
      return res.json(result.rows);
    } catch (err) {
      console.error('Eroare la interogarea bazei de date:', err);
      return res.status(500).json({ error: 'Eroare la preluarea datelor' });
    }
  });
  

// Endpoint pentru utilizatori
app.get('/api/users', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM users');
      return res.json(result.rows);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Eroare la preluarea utilizatorilor' });
    }
  });
 
// Endpoint: returnează toate adresele
app.get('/api/addresses', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM addresses');
      return res.json(result.rows);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Eroare la preluarea adreselor' });
    }
  });

  // Endpoint: returnează toate produsele
app.get('/api/products', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM products');
      return res.json(result.rows);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Eroare la preluarea produselor' });
    }
  });
  
  // Endpoint: returnează produsele după categorie
  app.get('/api/products/category/:category', async (req, res) => {
    try {
      const { category } = req.params;
      const result = await pool.query('SELECT * FROM products WHERE category = $1', [category]);
      return res.json(result.rows);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Eroare la filtrare' });
    }
  });
  app.get('/api/products', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM products');
      return res.json(result.rows);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Eroare la preluarea produselor' });
    }
  });
  app.get('/api/products/category/:category', async (req, res) => {
    try {
      const { category } = req.params;
      const result = await pool.query(
        'SELECT * FROM products WHERE category = $1',
        [category]
      );
      return res.json(result.rows);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Eroare la filtrare' });
    }
  });

// New endpoint: return a single product by ID
app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT product_id, name, description, price, stock_quantity, image_url, colors, category, specifications FROM products WHERE product_id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const product = result.rows[0];
    const transformedProduct = {
      ...product,
      specs: [],
    };

    // Transformă obiectul JSON din coloana 'specifications' într-un array de stringuri pentru 'specs'
    if (product.specifications) {
      for (const key in product.specifications) {
        transformedProduct.specs.push(`${key}: ${product.specifications[key]}`);
      }
    }

    // Asigură-te că colors este un array, chiar dacă este null în DB
    if (!transformedProduct.colors) {
      transformedProduct.colors = [];
    }

    return res.json(transformedProduct);
  } catch (err) {
    console.error('Error fetching single product:', err);
    return res.status(500).json({ error: 'Error retrieving product details' });
  }
});

// Endpoint POST pentru a crea o comandă nouă
app.post('/api/orders', async (req, res) => {
  console.log('Received request body:', req.body);
  try {
    // Adaugăm validare pentru req.body și items
    if (!req.body || !req.body.items) {
      console.error('req.body sau req.body.items lipsesc pentru plasarea comenzii.');
      return res.status(400).json({ message: 'Datele comenzii lipsesc. Asigură-te că trimiți un corp JSON valid cu "items".' });
    }

    let { items, shipping, payment, date } = req.body;

    // Asigură-te că shipping, payment și date sunt definite, chiar dacă sunt obiecte/stringuri goale
    shipping = shipping || {};
    payment = payment || {};
    date = date || new Date().toISOString(); // Folosim data curentă dacă lipsește

    // Calculăm totalul comenzii pe baza produselor
    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Adăugăm costul de transport la total
    const shippingCost = shipping ? (shipping.cost || 0) : 0;
    const finalTotal = totalAmount + shippingCost;

    const result = await pool.query(
      'INSERT INTO orders (order_date, total_amount, payment_method, shipping_details, items, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING order_id, order_date, total_amount, payment_method, shipping_details, items, status',
      [date, finalTotal, payment.method, JSON.stringify(shipping), JSON.stringify(items), 'pending'] // Status implicit 'pending'
    );
    const newOrder = result.rows[0];
    console.log('Comandă salvată în baza de date:', newOrder.order_id);

    // Inserăm produsele comandate în tabela 'order_items'
    for (const item of items) {
      await pool.query(
        "INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES ($1, $2, $3, $4)",
        [newOrder.order_id, item.productId, item.quantity, item.price] // Folosim numele corecte ale coloanelor și includem prețul unitar
      );
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

// Endpoint GET pentru a returna istoricul comenzilor
app.get('/api/orders/history', async (req, res) => {
  try {
    const result = await pool.query('SELECT order_id, order_date, total_amount, payment_method, shipping_details, items, status FROM orders ORDER BY order_date DESC');
    
    console.log('\n=== DETALII COMENZI ===');
    result.rows.forEach(order => {
      console.log(`\nComanda #${order.order_id}:`);
      console.log(`Data: ${new Date(order.order_date).toLocaleString()}`);
      console.log(`Total: ${order.total_amount} RON`);
      console.log(`Metoda de plată: ${order.payment_method}`);
      console.log(`Status: ${order.status}`);
      
      console.log('\nDetalii livrare:');
      const shipping = order.shipping_details;
      console.log(`- Cost transport: ${shipping.cost} RON`);
      console.log(`- Metodă livrare: ${shipping.deliveryMethod}`);
      if (shipping.address) {
        console.log('- Adresă:');
        console.log(`  * Strada: ${shipping.address.street}`);
        console.log(`  * Oraș: ${shipping.address.city}`);
        console.log(`  * Cod poștal: ${shipping.address.postalCode}`);
        console.log(`  * Țară: ${shipping.address.country}`);
      }
      
      console.log('\nProduse comandate:');
      order.items.forEach(item => {
        console.log(`- ${item.name}`);
        console.log(`  * Preț: ${item.price} RON`);
        console.log(`  * Cantitate: ${item.quantity}`);
        console.log(`  * ID Produs: ${item.productId}`);
      });
      console.log('------------------------');
    });
    
    // Transformăm datele pentru a se potrivi cu formatul așteptat de frontend
    const ordersHistory = result.rows.map(order => ({
      orderId: order.order_id,
      date: order.order_date,
      items: order.items,
      payment: {
        total: parseFloat(order.total_amount),
        method: order.payment_method
      },
      shipping: {
        cost: order.shipping_details.cost,
        address: order.shipping_details.address,
        deliveryMethod: order.shipping_details.deliveryMethod
      },
      status: order.status
    }));

    res.status(200).json({ orders: ordersHistory });
  } catch (err) {
    console.error('Eroare la preluarea istoricului comenzilor:', err);
    res.status(500).json({ message: 'Eroare la preluarea istoricului comenzilor.', error: err.message });
  }
});

// New endpoint for checkout calculations
app.post('/api/checkout', async (req, res) => {
  try {
    // Validăm datele primite
    if (!req.body || !req.body.items) {
      console.error('Date lipsă pentru checkout.');
      return res.status(400).json({ message: 'Coșul de cumpărături lipsește.' });
    }

    const { items, shipping, payment } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Coșul de cumpărături este gol.' });
    }

    // Calculăm subtotalul
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Calculăm TVA (19%)
    const taxRate = 0.19;
    const tax = subtotal * taxRate;
    
    // Adăugăm costul de transport
    const shippingCost = shipping ? (shipping.cost || 0) : 0;
    
    // Calculăm totalul final
    const total = subtotal + tax + shippingCost;

    // Salvăm comanda în baza de date
    const result = await pool.query(
      'INSERT INTO orders (order_date, total_amount, payment_method, shipping_details, items, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING order_id, order_date, total_amount, payment_method, shipping_details, items, status',
      [
        new Date().toISOString(),
        total,
        payment.method,
        JSON.stringify(shipping),
        JSON.stringify(items),
        'pending'
      ]
    );

    const newOrder = result.rows[0];

    // Salvăm produsele în order_items
    for (const item of items) {
      await pool.query(
        "INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES ($1, $2, $3, $4)",
        [newOrder.order_id, item.productId, item.quantity, item.price]
      );
    }

    // Returnăm răspunsul cu toate detaliile
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
          method: payment.method
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
    res.status(500).json({ 
      message: 'Eroare la procesarea checkout-ului.', 
      error: err.message 
    });
  }
});

// Pornim serverul
app.listen(3001, () => {
  console.log('Serverul rulează pe http://localhost:3001');
});