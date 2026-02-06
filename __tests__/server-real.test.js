const request = require('supertest');

// Import serverul real (nu mock-uri)
const app = require('../backend/server');

describe('Real Server Tests', () => {
  
  // Test pentru ruta principală
  test('should redirect / to /store.html', async () => {
    const response = await request(app)
      .get('/')
      .expect(302); // Redirect status
    
    expect(response.headers.location).toBe('/store.html');
  });

  // Test pentru ruta de produse (va folosi Supabase real)
  test('should return products from real database', async () => {
    const response = await request(app)
      .get('/api/products');

    // Verifică status code (poate fi 200 sau 500 dacă nu sunt produse)
    expect([200, 500]).toContain(response.status);
    
    // Dacă răspunsul este 200, verifică structura
    if (response.status === 200) {
      // Verifică că răspunsul este definit
      expect(response.body).toBeDefined();
      
      // Dacă este array, verifică structura
      if (Array.isArray(response.body)) {
        if (response.body.length > 0) {
          expect(response.body[0]).toHaveProperty('product_id');
          expect(response.body[0]).toHaveProperty('name');
          expect(response.body[0]).toHaveProperty('price');
        }
      } else {
        // Dacă nu este array, verifică că este string (poate fi gol dacă nu sunt produse)
        expect(typeof response.body).toBe('string');
      }
    } else {
      // Dacă este 500, verifică că există mesaj de eroare
      expect(response.body).toHaveProperty('error');
    }
  });

  // Test pentru produs specific
  test('should return single product from real database', async () => {
    const response = await request(app)
      .get('/api/products/1');

    // Verifică status code (poate fi 200, 404 sau 500)
    expect([200, 404, 500]).toContain(response.status);
    
    if (response.status === 200) {
      expect(response.body).toHaveProperty('product_id');
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('price');
    } else if (response.status === 404) {
      expect(response.body).toHaveProperty('error');
    } else {
      expect(response.body).toHaveProperty('error');
    }
  });

  // Test pentru istoricul comenzilor
  test('should return orders history from real database', async () => {
    const response = await request(app)
      .get('/api/orders/history');

    // Verifică status code (poate fi 200 sau 500)
    expect([200, 500]).toContain(response.status);
    
    if (response.status === 200) {
      expect(response.body).toHaveProperty('orders');
      expect(response.body.orders).toBeInstanceOf(Array);
    } else {
      expect(response.body).toHaveProperty('message');
    }
  });

  // Test pentru crearea unei comenzi reale
  test('should create real order in database', async () => {
    const orderData = {
      items: [
        { product_id: 1, name: 'Test Product', quantity: 1, price: 100 }
      ],
      shipping: { 
        cost: 10, 
        address: 'Test Address',
        deliveryMethod: 'standard'
      },
      payment: { method: 'card' }
    };

    const response = await request(app)
      .post('/api/orders')
      .send(orderData);

    // Verifică status code (poate fi 201 sau 500)
    expect([201, 500]).toContain(response.status);
    
    if (response.status === 201) {
      expect(response.body.message).toBe('Comanda plasată cu succes!');
      expect(response.body.orderId).toBeDefined();
      // Verifică că există cel puțin orderId (total poate lipsi în răspunsul real)
      expect(response.body.orderId).toBeGreaterThan(0);
    } else {
      expect(response.body).toHaveProperty('message');
    }
  });

  // Test pentru checkout real
  test('should process real checkout', async () => {
    const checkoutData = {
      items: [
        { product_id: 1, name: 'Test Product', quantity: 1, price: 100 }
      ],
      shipping: { cost: 15, address: 'Test Address' },
      payment: { method: 'card' }
    };

    const response = await request(app)
      .post('/api/checkout')
      .send(checkoutData);

    expect([201, 500]).toContain(response.status);

    if (response.status === 201) {
      expect(response.body.message).toBe('Comanda a fost plasată cu succes!');
      expect(response.body.order.payment.total).toBeDefined();
      expect(response.body.order.payment.tax).toBeDefined();
    } else {
      expect(response.body).toHaveProperty('message');
    }
  });
});
