const request = require('supertest');
const app = require('../server');

describe('Debug Supabase Connection', () => {
  
  test('should debug what Supabase returns', async () => {
    console.log('\n=== DEBUGGING SUPABASE ===');
    
    // Test 1: Verifică conexiunea la Supabase
    const response = await request(app)
      .get('/api/products');
    
    console.log('Status Code:', response.status);
    console.log('Response Body:', JSON.stringify(response.body, null, 2));
    console.log('Response Body Type:', typeof response.body);
    console.log('Response Body Length:', response.body?.length);
    console.log('Is Array:', Array.isArray(response.body));
    
    // Test 2: Verifică dacă există produse în baza de date
    if (response.status === 200 && Array.isArray(response.body)) {
      console.log('Number of products:', response.body.length);
      if (response.body.length > 0) {
        console.log('First product:', JSON.stringify(response.body[0], null, 2));
      }
    }
    
    // Test 3: Verifică eroarea dacă există
    if (response.status === 500) {
      console.log('Error message:', response.body.error);
    }
    
    console.log('=== END DEBUG ===\n');
    
    // Testul trece indiferent de rezultat pentru debug
    expect(true).toBe(true);
  });
  
  test('should debug order creation', async () => {
    console.log('\n=== DEBUGGING ORDER CREATION ===');
    
    const orderData = {
      items: [
        { product_id: 1, quantity: 1, price: 100 }
      ],
      shipping: { 
        cost: 10, 
        address: 'Test Address'
      },
      payment: { method: 'card' }
    };

    const response = await request(app)
      .post('/api/orders')
      .send(orderData);
    
    console.log('Order Status Code:', response.status);
    console.log('Order Response Body:', JSON.stringify(response.body, null, 2));
    console.log('Order Response Body Type:', typeof response.body);
    
    if (response.status === 201) {
      console.log('Order created successfully!');
      console.log('Order ID:', response.body.orderId);
      console.log('Total:', response.body.total);
      console.log('Payment:', response.body.payment);
    } else {
      console.log('Order creation failed!');
      console.log('Error:', response.body.message || response.body.error);
    }
    
    console.log('=== END ORDER DEBUG ===\n');
    
    // Testul trece indiferent de rezultat pentru debug
    expect(true).toBe(true);
  });
});
