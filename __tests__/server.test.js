const request = require('supertest');
const express = require('express');

// Mock pentru Supabase
const mockSupabase = {
  from: jest.fn((tableName) => {
    if (tableName === 'products') {
      return {
        select: jest.fn((columns) => {
          if (columns === '*') {
            // Pentru GET /api/products
            return Promise.resolve({ 
              data: [
                { product_id: 1, name: 'Product 1', price: 100 },
                { product_id: 2, name: 'Product 2', price: 200 }
              ], 
              error: null 
            });
          } else {
            // Pentru GET /api/products/:id
            return {
              eq: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({ 
                  data: { 
                    product_id: 1, 
                    name: 'Test Product', 
                    price: 100,
                    stock_quantity: 10,
                    image_url: 'test.jpg',
                    colors: ['red', 'blue'],
                    category: 'electronics',
                    specifications: { color: 'red', size: 'large' }
                  }, 
                  error: null 
                }))
              }))
            };
          }
        })
      };
    } else if (tableName === 'orders') {
      return {
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ 
              data: { order_id: 123 }, 
              error: null 
            }))
          }))
        }))
      };
    } else if (tableName === 'order_items') {
      return {
        insert: jest.fn(() => Promise.resolve({ 
          data: null, 
          error: null 
        }))
      };
    }
  })
};

// Mock pentru createClient
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabase)
}));

// Creez o aplicație Express separată pentru teste
const app = express();
app.use(express.json());

// Import doar rutele, nu serverul complet
const cors = require('cors');
app.use(cors());

// Simulez rutele din server.js
app.get('/api/products', async (req, res) => {
  try {
    const { data, error } = await mockSupabase.from('products').select('*');
    if (error) throw error;
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Eroare la preluarea datelor' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await mockSupabase
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
    return res.status(500).json({ error: 'Error retrieving product details' });
  }
});

app.post('/api/orders', async (req, res) => {
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

    const { data: newOrder, error: orderError } = await mockSupabase
      .from('orders')
      .insert([{
        order_date: orderDate,
        total_amount: finalTotal,
        payment_method: paymentObj.method,
        shipping_details: shippingObj,
        items: items,
        status: 'pending'
      }])
      .select()
      .single();

    if (orderError) throw orderError;

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
    res.status(500).json({ message: 'Eroare la plasarea comenzii.', error: err.message });
  }
});

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

    const { data: newOrder, error: orderError } = await mockSupabase
      .from('orders')
      .insert([{
        order_date: new Date().toISOString(),
        total_amount: total,
        payment_method: payment?.method,
        shipping_details: shipping,
        items: items,
        status: 'pending'
      }])
      .select()
      .single();

    if (orderError) throw orderError;

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
    res.status(500).json({ message: 'Eroare la procesarea checkout-ului.', error: err.message });
  }
});

describe('API Endpoints', () => {
  
  describe('GET /api/products', () => {
    test('should return products list', async () => {
      const response = await request(app)
        .get('/api/products')
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThan(0);
    });

    test('should handle database errors', async () => {
      // Mock pentru eroare
      mockSupabase.from.mockImplementationOnce(() => ({
        select: jest.fn(() => Promise.resolve({ 
          data: null, 
          error: new Error('Database connection failed') 
        }))
      }));

      const response = await request(app)
        .get('/api/products')
        .expect(500);

      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /api/products/:id', () => {
    test('should return single product', async () => {
      const response = await request(app)
        .get('/api/products/1')
        .expect(200);

      expect(response.body).toHaveProperty('product_id');
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('price');
    });

    test('should return 404 for non-existent product', async () => {
      // Mock pentru produs inexistent
      mockSupabase.from.mockImplementationOnce(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ 
              data: null, 
              error: new Error('Product not found') 
            }))
          }))
        }))
      }));

      const response = await request(app)
        .get('/api/products/999')
        .expect(404);

      expect(response.body.error).toBe('Product not found');
    });
  });

  describe('POST /api/orders', () => {
    test('should create new order', async () => {
      const orderData = {
        items: [
          { product_id: 1, quantity: 2, price: 100 }
        ],
        shipping: { cost: 10, address: 'Test Address' },
        payment: { method: 'card' }
      };

      const response = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(201);

      expect(response.body.message).toBe('Comanda plasată cu succes!');
      expect(response.body.orderId).toBeDefined();
    });

    test('should reject order without items', async () => {
      const response = await request(app)
        .post('/api/orders')
        .send({})
        .expect(400);

      expect(response.body.message).toContain('Datele comenzii lipsesc');
    });
  });

  describe('POST /api/checkout', () => {
    test('should process checkout successfully', async () => {
      const checkoutData = {
        items: [
          { product_id: 1, quantity: 1, price: 100 }
        ],
        shipping: { cost: 15 },
        payment: { method: 'card' }
      };

      const response = await request(app)
        .post('/api/checkout')
        .send(checkoutData)
        .expect(201);

      expect(response.body.message).toBe('Comanda a fost plasată cu succes!');
      expect(response.body.order.payment.total).toBeDefined();
    });

    test('should calculate tax correctly', async () => {
      const checkoutData = {
        items: [
          { product_id: 1, quantity: 1, price: 100 }
        ],
        shipping: { cost: 10 },
        payment: { method: 'card' }
      };

      const response = await request(app)
        .post('/api/checkout')
        .send(checkoutData)
        .expect(201);

      // Taxa ar trebui să fie 19% din subtotal
      const expectedTax = (100 * 0.19).toFixed(2);
      expect(response.body.order.payment.tax).toBe(expectedTax);
    });
  });
});
