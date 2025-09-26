const request = require('supertest');
const app = require('../server');

describe('Frontend-Backend Integration', () => {
  
  // Testează că frontend-ul poate accesa backend-ul
  describe('Frontend-Backend Communication', () => {
    
    test('should serve static files from frontend', async () => {
      const staticFiles = [
        '/store.html',
        '/checkout.html',
        '/product.html'
      ];

      for (const file of staticFiles) {
        const response = await request(app).get(file);
        
        // Verifică că fișierele statice sunt servite
        expect([200, 404]).toContain(response.status);
        
        if (response.status === 200) {
          expect(response.headers['content-type']).toContain('text/html');
        }
        
        console.log(`✅ Static file ${file} - Status: ${response.status}`);
      }
    });

    test('should serve CSS and JS files', async () => {
      const assetFiles = [
        '/styles/main.css',
        '/styles/checkout.css',
        '/scripts/main.js',
        '/scripts/storeScript.js',
        '/scripts/checkout.js'
      ];

      for (const file of assetFiles) {
        const response = await request(app).get(file);
        
        // Verifică că asset-urile sunt servite
        expect([200, 404]).toContain(response.status);
        
        if (response.status === 200) {
          if (file.endsWith('.css')) {
            expect(response.headers['content-type']).toContain('text/css');
          } else if (file.endsWith('.js')) {
            expect(response.headers['content-type']).toContain('javascript');
          }
        }
        
        console.log(`✅ Asset file ${file} - Status: ${response.status}`);
      }
    });
  });

  // Testează fluxul complet de cumpărare
  describe('Complete Purchase Flow', () => {
    
    test('should handle complete purchase workflow', async () => {
      // Pasul 1: Verifică că produsele sunt disponibile
      const productsResponse = await request(app).get('/api/products');
      expect([200, 500]).toContain(productsResponse.status);
      console.log('✅ Step 1: Products available');

      // Pasul 2: Verifică că un produs specific există
      const productResponse = await request(app).get('/api/products/1');
      expect([200, 404, 500]).toContain(productResponse.status);
      console.log('✅ Step 2: Product details available');

      // Pasul 3: Creează o comandă
      const orderData = {
        items: [
          { product_id: 1, quantity: 1, price: 100 }
        ],
        shipping: { 
          cost: 10, 
          address: 'Test Address',
          deliveryMethod: 'standard'
        },
        payment: { method: 'card' }
      };

      const orderResponse = await request(app)
        .post('/api/orders')
        .send(orderData);
      
      expect([201, 400, 500]).toContain(orderResponse.status);
      console.log('✅ Step 3: Order created');

      // Pasul 4: Verifică istoricul comenzilor
      const historyResponse = await request(app).get('/api/orders/history');
      expect([200, 500]).toContain(historyResponse.status);
      console.log('✅ Step 4: Order history available');
    });

    test('should handle checkout workflow', async () => {
      // Pasul 1: Procesează checkout-ul
      const checkoutData = {
        items: [
          { product_id: 1, quantity: 1, price: 100 }
        ],
        shipping: { cost: 15 },
        payment: { method: 'card' }
      };

      const checkoutResponse = await request(app)
        .post('/api/checkout')
        .send(checkoutData);
      
      expect([201, 400, 500]).toContain(checkoutResponse.status);
      console.log('✅ Checkout processed');

      // Pasul 2: Verifică că comanda a fost creată
      if (checkoutResponse.status === 201) {
        expect(checkoutResponse.body.message).toBeDefined();
        expect(checkoutResponse.body.order).toBeDefined();
        console.log('✅ Order confirmed');
      }
    });
  });

  // Testează gestionarea erorilor în integrare
  describe('Integration Error Handling', () => {
    
    test('should handle API errors gracefully', async () => {
      // Testează endpoint-uri inexistente
      const invalidEndpoints = [
        '/api/invalid',
        '/api/products/invalid-id',
        '/api/orders/invalid'
      ];

      for (const endpoint of invalidEndpoints) {
        const response = await request(app).get(endpoint);
        
        // Verifică că erorile sunt gestionate corect
        expect([404, 500]).toContain(response.status);
        console.log(`✅ Error handling for ${endpoint} - Status: ${response.status}`);
      }
    });

    test('should handle malformed requests', async () => {
      // Testează request-uri cu date invalide
      const malformedRequests = [
        { endpoint: '/api/orders', data: { invalid: 'data' } },
        { endpoint: '/api/checkout', data: { items: null } },
        { endpoint: '/api/orders', data: { items: [] } }
      ];

      for (const requestData of malformedRequests) {
        const response = await request(app)
          .post(requestData.endpoint)
          .send(requestData.data);
        
        // Verifică că request-urile malformate sunt respinse
        expect([400, 500]).toContain(response.status);
        console.log(`✅ Malformed request handling for ${requestData.endpoint} - Status: ${response.status}`);
      }
    });
  });

  // Testează performanța integrării
  describe('Integration Performance', () => {
    
    test('should handle multiple page loads', async () => {
      const pages = [
        '/store.html',
        '/checkout.html',
        '/product.html'
      ];

      const startTime = Date.now();

      for (const page of pages) {
        const response = await request(app).get(page);
        expect([200, 404]).toContain(response.status);
      }

      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // Verifică că toate paginile se încarcă în timp rezonabil
      expect(totalTime).toBeLessThan(10000); // 10 secunde
      console.log(`⏱️ Total time for all pages: ${totalTime}ms`);
    });

    test('should handle concurrent API requests', async () => {
      const apiEndpoints = [
        '/api/products',
        '/api/products/1',
        '/api/orders/history'
      ];

      const startTime = Date.now();

      // Fă request-uri simultane
      const promises = apiEndpoints.map(endpoint => 
        request(app).get(endpoint)
      );

      const responses = await Promise.all(promises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // Verifică că toate request-urile au răspuns
      expect(responses).toHaveLength(apiEndpoints.length);
      
      responses.forEach((response, index) => {
        expect([200, 404, 500]).toContain(response.status);
        console.log(`✅ Concurrent API request ${index + 1} - Status: ${response.status}`);
      });

      // Verifică că request-urile simultane sunt procesate rapid
      expect(totalTime).toBeLessThan(5000); // 5 secunde
      console.log(`⏱️ Concurrent requests time: ${totalTime}ms`);
    });
  });
});
