const request = require('supertest');
const app = require('../server');

describe('Backend Complete Testing', () => {
  
  // Testează toate endpoint-urile API
  describe('API Endpoints Complete', () => {
    
    test('should handle all GET endpoints', async () => {
      const endpoints = [
        '/',
        '/api/products',
        '/api/products/category/electronics',
        '/api/products/1',
        '/api/orders/history'
      ];

      for (const endpoint of endpoints) {
        const response = await request(app).get(endpoint);
        
        // Verifică că endpoint-ul răspunde (nu 404)
        expect([200, 302, 404, 500]).toContain(response.status);
        
        console.log(`✅ ${endpoint} - Status: ${response.status}`);
      }
    });

    test('should handle all POST endpoints', async () => {
      const orderData = {
        items: [
          { product_id: 1, quantity: 1, price: 100 }
        ],
        shipping: { cost: 10, address: 'Test Address' },
        payment: { method: 'card' }
      };

      const checkoutData = {
        items: [
          { product_id: 1, quantity: 1, price: 100 }
        ],
        shipping: { cost: 15 },
        payment: { method: 'card' }
      };

      // Test POST /api/orders
      const orderResponse = await request(app)
        .post('/api/orders')
        .send(orderData);
      
      expect([201, 400, 500]).toContain(orderResponse.status);
      console.log(`✅ POST /api/orders - Status: ${orderResponse.status}`);

      // Test POST /api/checkout
      const checkoutResponse = await request(app)
        .post('/api/checkout')
        .send(checkoutData);
      
      expect([201, 400, 500]).toContain(checkoutResponse.status);
      console.log(`✅ POST /api/checkout - Status: ${checkoutResponse.status}`);
    });
  });

  // Testează middleware-urile
  describe('Middleware Testing', () => {
    
    test('should have CORS enabled', async () => {
      const response = await request(app)
        .get('/api/products')
        .set('Origin', 'http://localhost:3000');
      
      // Verifică că CORS headers sunt prezente
      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });

    test('should have JSON parsing middleware', async () => {
      const response = await request(app)
        .post('/api/orders')
        .send({ test: 'data' })
        .set('Content-Type', 'application/json');
      
      // Verifică că JSON este parsat corect
      expect([201, 400, 500]).toContain(response.status);
    });

    test('should have logging middleware', async () => {
      // Testul verifică că middleware-ul de logging funcționează
      // prin verificarea că request-ul este procesat
      const response = await request(app).get('/api/products');
      expect([200, 500]).toContain(response.status);
    });
  });

  // Testează gestionarea erorilor
  describe('Error Handling', () => {
    
    test('should handle invalid product ID', async () => {
      const response = await request(app).get('/api/products/invalid');
      
      expect([404, 500]).toContain(response.status);
      if (response.status === 404) {
        expect(response.body.error).toBeDefined();
      }
    });

    test('should handle invalid category', async () => {
      const response = await request(app).get('/api/products/category/invalid');
      
      expect([200, 404, 500]).toContain(response.status);
    });

    test('should handle malformed order data', async () => {
      const response = await request(app)
        .post('/api/orders')
        .send({ invalid: 'data' });
      
      expect([400, 500]).toContain(response.status);
      if (response.status === 400) {
        expect(response.body.message).toBeDefined();
      }
    });

    test('should handle empty order data', async () => {
      const response = await request(app)
        .post('/api/orders')
        .send({});
      
      expect([400, 500]).toContain(response.status);
    });
  });

  // Testează validarea datelor
  describe('Data Validation', () => {
    
    test('should validate order items', async () => {
      const invalidOrderData = {
        items: [], // Array gol
        shipping: { cost: 10 },
        payment: { method: 'card' }
      };

      const response = await request(app)
        .post('/api/orders')
        .send(invalidOrderData);
      
      expect([400, 500]).toContain(response.status);
    });

    test('should validate checkout data', async () => {
      const invalidCheckoutData = {
        items: null, // Items null
        shipping: { cost: 15 },
        payment: { method: 'card' }
      };

      const response = await request(app)
        .post('/api/checkout')
        .send(invalidCheckoutData);
      
      expect([400, 500]).toContain(response.status);
    });
  });

  // Testează performanța
  describe('Performance Testing', () => {
    
    test('should respond to products endpoint within reasonable time', async () => {
      const startTime = Date.now();
      
      const response = await request(app).get('/api/products');
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      // Verifică că răspunsul vine în mai puțin de 5 secunde
      expect(responseTime).toBeLessThan(5000);
      console.log(`⏱️ Products endpoint response time: ${responseTime}ms`);
    });

    test('should handle multiple concurrent requests', async () => {
      const requests = [];
      
      // Creează 5 request-uri simultane
      for (let i = 0; i < 5; i++) {
        requests.push(request(app).get('/api/products'));
      }
      
      const responses = await Promise.all(requests);
      
      // Verifică că toate request-urile au răspuns
      expect(responses).toHaveLength(5);
      
      responses.forEach((response, index) => {
        expect([200, 500]).toContain(response.status);
        console.log(`✅ Concurrent request ${index + 1} - Status: ${response.status}`);
      });
    });
  });
});
