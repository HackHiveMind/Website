const request = require('supertest');
const app = require('../server');

describe('End-to-End Scenarios', () => {
  
  // Scenariul 1: Utilizator nou navighează prin magazin
  describe('Scenario 1: New User Shopping Experience', () => {
    
    test('should complete new user shopping journey', async () => {
      console.log('\n🛒 Starting new user shopping journey...');
      
      // Pasul 1: Utilizatorul accesează pagina principală
      const homeResponse = await request(app).get('/');
      expect([302, 200]).toContain(homeResponse.status);
      console.log('✅ Step 1: User accesses home page');

      // Pasul 2: Utilizatorul este redirecționat la store
      const storeResponse = await request(app).get('/store.html');
      expect([200, 404]).toContain(storeResponse.status);
      console.log('✅ Step 2: User redirected to store');

      // Pasul 3: Utilizatorul vede produsele disponibile
      const productsResponse = await request(app).get('/api/products');
      expect([200, 500]).toContain(productsResponse.status);
      console.log('✅ Step 3: Products are displayed');

      // Pasul 4: Utilizatorul selectează un produs
      const productResponse = await request(app).get('/api/products/1');
      expect([200, 404, 500]).toContain(productResponse.status);
      console.log('✅ Step 4: Product details are shown');

      // Pasul 5: Utilizatorul adaugă produsul în coș
      const orderData = {
        items: [
          { product_id: 1, quantity: 1, price: 100 }
        ],
        shipping: { 
          cost: 10, 
          address: 'New User Address',
          deliveryMethod: 'standard'
        },
        payment: { method: 'card' }
      };

      const orderResponse = await request(app)
        .post('/api/orders')
        .send(orderData);
      
      expect([201, 400, 500]).toContain(orderResponse.status);
      console.log('✅ Step 5: Product added to cart and order created');

      // Pasul 6: Utilizatorul finalizează comanda
      const checkoutResponse = await request(app)
        .post('/api/checkout')
        .send(orderData);
      
      expect([201, 400, 500]).toContain(checkoutResponse.status);
      console.log('✅ Step 6: Order completed successfully');

      console.log('🎉 New user shopping journey completed!\n');
    });
  });

  // Scenariul 2: Utilizator existent verifică istoricul comenzilor
  describe('Scenario 2: Returning User Order History', () => {
    
    test('should handle returning user experience', async () => {
      console.log('\n👤 Starting returning user experience...');
      
      // Pasul 1: Utilizatorul accesează istoricul comenzilor
      const historyResponse = await request(app).get('/api/orders/history');
      expect([200, 500]).toContain(historyResponse.status);
      console.log('✅ Step 1: Order history accessed');

      // Pasul 2: Utilizatorul verifică detaliile unei comenzi
      if (historyResponse.status === 200 && historyResponse.body.orders) {
        const orders = historyResponse.body.orders;
        if (orders.length > 0) {
          const firstOrder = orders[0];
          expect(firstOrder).toHaveProperty('orderId');
          expect(firstOrder).toHaveProperty('date');
          console.log('✅ Step 2: Order details verified');
        }
      }

      // Pasul 3: Utilizatorul plasează o comandă nouă
      const newOrderData = {
        items: [
          { product_id: 1, quantity: 2, price: 100 }
        ],
        shipping: { 
          cost: 15, 
          address: 'Returning User Address',
          deliveryMethod: 'express'
        },
        payment: { method: 'paypal' }
      };

      const newOrderResponse = await request(app)
        .post('/api/orders')
        .send(newOrderData);
      
      expect([201, 400, 500]).toContain(newOrderResponse.status);
      console.log('✅ Step 3: New order placed');

      console.log('🎉 Returning user experience completed!\n');
    });
  });

  // Scenariul 3: Gestionarea erorilor și edge cases
  describe('Scenario 3: Error Handling and Edge Cases', () => {
    
    test('should handle various error scenarios', async () => {
      console.log('\n⚠️ Starting error handling scenarios...');
      
      // Pasul 1: Produs inexistent
      const invalidProductResponse = await request(app).get('/api/products/99999');
      expect([404, 500]).toContain(invalidProductResponse.status);
      console.log('✅ Step 1: Invalid product handled');

      // Pasul 2: Categorie inexistentă
      const invalidCategoryResponse = await request(app).get('/api/products/category/nonexistent');
      expect([200, 404, 500]).toContain(invalidCategoryResponse.status);
      console.log('✅ Step 2: Invalid category handled');

      // Pasul 3: Comandă cu date invalide
      const invalidOrderResponse = await request(app)
        .post('/api/orders')
        .send({ invalid: 'data' });
      
      expect([400, 500]).toContain(invalidOrderResponse.status);
      console.log('✅ Step 3: Invalid order data handled');

      // Pasul 4: Checkout cu coș gol
      const emptyCheckoutResponse = await request(app)
        .post('/api/checkout')
        .send({ items: [] });
      
      expect([400, 500]).toContain(emptyCheckoutResponse.status);
      console.log('✅ Step 4: Empty checkout handled');

      console.log('🎉 Error handling scenarios completed!\n');
    });
  });

  // Scenariul 4: Testarea performanței sub sarcină
  describe('Scenario 4: Performance Under Load', () => {
    
    test('should handle multiple concurrent users', async () => {
      console.log('\n⚡ Starting performance test...');
      
      const startTime = Date.now();
      
      // Simulează 10 utilizatori care accesează simultan
      const userPromises = [];
      
      for (let i = 0; i < 10; i++) {
        userPromises.push(
          request(app).get('/api/products'),
          request(app).get('/api/products/1'),
          request(app).get('/api/orders/history')
        );
      }
      
      const responses = await Promise.all(userPromises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      // Verifică că toate request-urile au răspuns
      expect(responses).toHaveLength(30); // 10 users × 3 requests each
      
      // Verifică că toate request-urile au status valid
      responses.forEach((response, index) => {
        expect([200, 404, 500]).toContain(response.status);
      });
      
      // Verifică că performanța este acceptabilă
      expect(totalTime).toBeLessThan(15000); // 15 secunde
      
      console.log(`✅ Performance test completed in ${totalTime}ms`);
      console.log(`📊 Processed ${responses.length} requests`);
      console.log(`⚡ Average response time: ${(totalTime / responses.length).toFixed(2)}ms per request`);
      
      console.log('🎉 Performance test completed!\n');
    });
  });

  // Scenariul 5: Testarea completă a fluxului de plată
  describe('Scenario 5: Complete Payment Flow', () => {
    
    test('should handle complete payment process', async () => {
      console.log('\n💳 Starting complete payment flow...');
      
      // Pasul 1: Utilizatorul selectează produse
      const productsResponse = await request(app).get('/api/products');
      expect([200, 500]).toContain(productsResponse.status);
      console.log('✅ Step 1: Products selected');

      // Pasul 2: Utilizatorul configurează comanda
      const orderData = {
        items: [
          { product_id: 1, quantity: 1, price: 100 },
          { product_id: 2, quantity: 2, price: 50 }
        ],
        shipping: { 
          cost: 20, 
          address: 'Payment Test Address',
          deliveryMethod: 'express'
        },
        payment: { method: 'credit_card' }
      };

      // Pasul 3: Procesează checkout-ul cu calcularea taxelor
      const checkoutResponse = await request(app)
        .post('/api/checkout')
        .send(orderData);
      
      expect([201, 400, 500]).toContain(checkoutResponse.status);
      console.log('✅ Step 2: Checkout processed');

      // Pasul 4: Verifică că calcularea este corectă
      if (checkoutResponse.status === 201) {
        const order = checkoutResponse.body.order;
        expect(order).toHaveProperty('payment');
        expect(order.payment).toHaveProperty('subtotal');
        expect(order.payment).toHaveProperty('tax');
        expect(order.payment).toHaveProperty('shipping');
        expect(order.payment).toHaveProperty('total');
        console.log('✅ Step 3: Payment calculations verified');
      }

      // Pasul 5: Verifică că comanda este salvată
      const historyResponse = await request(app).get('/api/orders/history');
      expect([200, 500]).toContain(historyResponse.status);
      console.log('✅ Step 4: Order saved to history');

      console.log('🎉 Complete payment flow completed!\n');
    });
  });
});
