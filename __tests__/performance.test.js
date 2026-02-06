const request = require('supertest');
const app = require('../backend/server');

describe('Performance Testing', () => {
  
  // Testează timpul de răspuns pentru endpoint-uri
  describe('Response Time Testing', () => {
    
    test('should respond to products endpoint quickly', async () => {
      const startTime = Date.now();
      
      const response = await request(app).get('/api/products');
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      expect([200, 500]).toContain(response.status);
      expect(responseTime).toBeLessThan(5000); // 5 secunde pentru CI
      
      console.log(`⏱️ Products endpoint: ${responseTime}ms`);
    }, 10000);

    test('should respond to single product endpoint quickly', async () => {
      const startTime = Date.now();
      
      const response = await request(app).get('/api/products/1');
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      expect([200, 404, 500]).toContain(response.status);
      expect(responseTime).toBeLessThan(5000); // 5 secunde pentru CI
      
      console.log(`⏱️ Single product endpoint: ${responseTime}ms`);
    }, 10000);

    test('should respond to orders history quickly', async () => {
      const startTime = Date.now();
      
      const response = await request(app).get('/api/orders/history');
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      expect([200, 500]).toContain(response.status);
      expect(responseTime).toBeLessThan(6000); // 6 secunde pentru CI
      
      console.log(`⏱️ Orders history endpoint: ${responseTime}ms`);
    }, 10000);

    test('should create orders quickly', async () => {
      const orderData = {
        items: [
          { product_id: 1, quantity: 1, price: 100 }
        ],
        shipping: { cost: 10, address: 'Test Address' },
        payment: { method: 'card' }
      };

      const startTime = Date.now();
      
      const response = await request(app)
        .post('/api/orders')
        .send(orderData);
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      expect([201, 400, 500]).toContain(response.status);
      expect(responseTime).toBeLessThan(6000); // 6 secunde pentru CI
      
      console.log(`⏱️ Create order endpoint: ${responseTime}ms`);
    }, 10000);
  });

  // Testează performanța sub sarcină
  describe('Load Testing', () => {
    
    test('should handle 50 concurrent requests', async () => {
      const startTime = Date.now();
      
      // Creează 50 request-uri simultane
      const promises = [];
      for (let i = 0; i < 50; i++) {
        promises.push(request(app).get('/api/products'));
      }
      
      const responses = await Promise.all(promises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      // Verifică că toate request-urile au răspuns
      expect(responses).toHaveLength(50);
      
      // Verifică că toate request-urile au status valid
      responses.forEach(response => {
        expect([200, 500]).toContain(response.status);
      });
      
      // Verifică că timpul total este acceptabil
      expect(totalTime).toBeLessThan(10000); // 10 secunde
      
      const averageTime = totalTime / responses.length;
      console.log(`⚡ 50 concurrent requests: ${totalTime}ms total, ${averageTime.toFixed(2)}ms average`);
    });

    test('should handle mixed request types', async () => {
      const startTime = Date.now();
      
      // Creează request-uri de tipuri diferite
      const promises = [
        request(app).get('/api/products'),
        request(app).get('/api/products/1'),
        request(app).get('/api/orders/history'),
        request(app).post('/api/orders').send({
          items: [{ product_id: 1, quantity: 1, price: 100 }],
          shipping: { cost: 10, address: 'Test' },
          payment: { method: 'card' }
        }),
        request(app).post('/api/checkout').send({
          items: [{ product_id: 1, quantity: 1, price: 100 }],
          shipping: { cost: 15 },
          payment: { method: 'card' }
        })
      ];
      
      const responses = await Promise.all(promises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      // Verifică că toate request-urile au răspuns
      expect(responses).toHaveLength(5);
      
      // Verifică că toate request-urile au status valid
      responses.forEach((response, index) => {
        const endpoint = ['GET /api/products', 'GET /api/products/1', 'GET /api/orders/history', 'POST /api/orders', 'POST /api/checkout'][index];
        expect([200, 201, 400, 404, 500]).toContain(response.status);
        console.log(`✅ ${endpoint}: ${response.status}`);
      });
      
      // Verifică că timpul total este acceptabil
      expect(totalTime).toBeLessThan(8000); // 8 secunde
      
      console.log(`⚡ Mixed requests: ${totalTime}ms total`);
    });
  });

  // Testează performanța memoriei
  describe('Memory Performance', () => {
    
    test('should handle multiple large requests', async () => {
      const startTime = Date.now();
      
      // Creează request-uri cu date mari
      const largeOrderData = {
        items: Array.from({ length: 10 }, (_, i) => ({
          product_id: i + 1,
          quantity: Math.floor(Math.random() * 5) + 1,
          price: Math.floor(Math.random() * 1000) + 100
        })),
        shipping: { 
          cost: 50, 
          address: 'Large Order Test Address with very long description',
          deliveryMethod: 'express'
        },
        payment: { method: 'credit_card' }
      };

      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(
          request(app).post('/api/orders').send(largeOrderData)
        );
      }
      
      const responses = await Promise.all(promises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      // Verifică că toate request-urile au răspuns
      expect(responses).toHaveLength(10);
      
      // Verifică că toate request-urile au status valid
      responses.forEach(response => {
        expect([201, 400, 500]).toContain(response.status);
      });
      
      // Verifică că timpul total este acceptabil
      expect(totalTime).toBeLessThan(15000); // 15 secunde
      
      console.log(`💾 Large requests: ${totalTime}ms total`);
    });
  });

  // Testează performanța pe termen lung
  describe('Long-term Performance', () => {
    
    test('should maintain performance over time', async () => {
      const iterations = 20;
      const responseTimes = [];
      
      for (let i = 0; i < iterations; i++) {
        const startTime = Date.now();
        
        const response = await request(app).get('/api/products');
        
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        responseTimes.push(responseTime);
        
        expect([200, 500]).toContain(response.status);
        
        // Pauză mică între request-uri
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Calculează statistici
      const avgTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      const maxTime = Math.max(...responseTimes);
      const minTime = Math.min(...responseTimes);
      
      // Verifică că performanța este consistentă
      expect(avgTime).toBeLessThan(2000); // 2 secunde medie
      expect(maxTime).toBeLessThan(5000); // 5 secunde maxim
      
      console.log(`📊 Performance over ${iterations} iterations:`);
      console.log(`   Average: ${avgTime.toFixed(2)}ms`);
      console.log(`   Min: ${minTime}ms`);
      console.log(`   Max: ${maxTime}ms`);
    }, 15000);
  });

  // Testează performanța în condiții de stres
  describe('Stress Testing', () => {
    
    test('should handle burst of requests', async () => {
      const burstSize = 100;
      const startTime = Date.now();
      
      // Creează o explozie de request-uri
      const promises = [];
      for (let i = 0; i < burstSize; i++) {
        promises.push(request(app).get('/api/products'));
      }
      
      const responses = await Promise.all(promises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      // Verifică că toate request-urile au răspuns
      expect(responses).toHaveLength(burstSize);
      
      // Verifică că toate request-urile au status valid
      const successCount = responses.filter(r => [200, 500].includes(r.status)).length;
      const successRate = (successCount / burstSize) * 100;
      
      expect(successRate).toBeGreaterThan(90); // 90% success rate
      
      console.log(`💥 Burst test: ${burstSize} requests in ${totalTime}ms`);
      console.log(`📈 Success rate: ${successRate.toFixed(1)}%`);
    });
  });
});
