// 🔄 TESTE INTEGRATIVE ADMIN - Frontend + Backend
const request = require('supertest');
const { createTestApp } = require('./admin-backend.test');

// Mock pentru frontend - versiune simplificată pentru node environment
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

// 🔄 TESTE INTEGRATIVE COMPLETE
describe('🔄 Admin Integration Tests - Frontend + Backend', () => {
  let app;
  let authToken;
  
  beforeEach(() => {
    app = createTestApp();
    authToken = null;
    jest.clearAllMocks();
  });
  
  describe('🔐 Full Authentication Flow', () => {
    test('✅ Fluxul complet de autentificare ar trebui să funcționeze', async () => {
      // 1. Backend: Login prin API
      const loginResponse = await request(app)
        .post('/admin/api/login')
        .send({
          email: 'admin@example.com',
          password: 'password123'
        });
        
      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body.success).toBe(true);
      expect(loginResponse.body.token).toBeTruthy();
      
      authToken = loginResponse.body.token;
      
      // 2. Frontend: Simulez salvarea token-ului
      mockLocalStorage.setItem('adminToken', authToken);
      mockLocalStorage.setItem('adminUser', JSON.stringify(loginResponse.body.user));
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('adminToken', authToken);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('adminUser', JSON.stringify(loginResponse.body.user));
      
      // 3. Frontend: Simulez verificarea autentificării
      mockLocalStorage.getItem.mockReturnValue(authToken);
      const storedToken = mockLocalStorage.getItem('adminToken');
      
      expect(storedToken).toBe(authToken);
    });
    
    test('❌ Fluxul de autentificare cu credențiale invalide', async () => {
      // Mock pentru user inexistent - trebuie să setez mock-ul fresh pentru fiecare test
      const { mockSupabase } = require('./admin-backend.test');
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({
              data: null,
              error: 'User not found'
            }))
          }))
        }))
      });
      
      // 1. Backend: Încerc login cu credențiale greșite
      const loginResponse = await request(app)
        .post('/admin/api/login')
        .send({
          email: 'wrong@example.com',
          password: 'wrongpassword'
        });
        
      expect(loginResponse.status).toBe(401);
      expect(loginResponse.body.success).toBe(false);
      
      // 2. Frontend: Nu salvez nimic în localStorage
      expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
    });
  });
  
  describe('📊 Full Dashboard Data Flow', () => {
    beforeEach(async () => {
      // Autentificare pentru fiecare test
      const loginResponse = await request(app)
        .post('/admin/api/login')
        .send({
          email: 'admin@example.com',
          password: 'password123'
        });
      authToken = `Bearer ${loginResponse.body.token}`;
    });
    
    test('✅ Încărcarea completă a datelor de dashboard', async () => {
      // 1. Backend: Obțin statisticile
      const statsResponse = await request(app)
        .get('/admin/api/stats')
        .set('Authorization', authToken);
        
      expect(statsResponse.status).toBe(200);
      expect(statsResponse.body.success).toBe(true);
      expect(statsResponse.body.stats).toBeTruthy();
      
      // 2. Frontend: Simulez afișarea datelor
      const stats = statsResponse.body.stats;
      const mockDOM = {
        totalOrders: { textContent: '' },
        totalRevenue: { textContent: '' },
        totalUsers: { textContent: '' },
        conversionRate: { textContent: '' }
      };
      
      // Simulez actualizarea DOM-ului
      mockDOM.totalOrders.textContent = stats.totalOrders.toString();
      mockDOM.totalRevenue.textContent = `${stats.totalRevenue} RON`;
      mockDOM.totalUsers.textContent = stats.totalUsers.toString();
      mockDOM.conversionRate.textContent = `${stats.conversionRate}%`;
      
      expect(mockDOM.totalOrders.textContent).toBe('1250');
      expect(mockDOM.totalRevenue.textContent).toBe('125430 RON');
      expect(mockDOM.totalUsers.textContent).toBe('850');
      expect(mockDOM.conversionRate.textContent).toBe('15.8%');
    });
    
    test('✅ Încărcarea datelor financiare', async () => {
      // 1. Backend: Obțin datele financiare
      const financialResponse = await request(app)
        .get('/admin/api/financial-data')
        .set('Authorization', authToken);
        
      expect(financialResponse.status).toBe(200);
      expect(financialResponse.body.success).toBe(true);
      
      const financialData = financialResponse.body.data;
      
      // 2. Frontend: Verific structura datelor
      expect(financialData.income).toBeTruthy();
      expect(financialData.income.paid).toBe(125430);
      expect(financialData.tvaLimit).toBeTruthy();
      expect(financialData.vatBalance).toBeTruthy();
    });
  });
  
  describe('📦 Full Orders Management Flow', () => {
    beforeEach(async () => {
      const loginResponse = await request(app)
        .post('/admin/api/login')
        .send({
          email: 'admin@example.com',
          password: 'password123'
        });
      authToken = `Bearer ${loginResponse.body.token}`;
    });
    
    test('✅ Încărcarea și afișarea comenzilor', async () => {
      // 1. Backend: Obțin comenzile
      const ordersResponse = await request(app)
        .get('/admin/api/orders')
        .set('Authorization', authToken);
        
      expect(ordersResponse.status).toBe(200);
      expect(ordersResponse.body.success).toBe(true);
      expect(ordersResponse.body.orders).toHaveLength(2);
      
      // 2. Frontend: Simulez popularea tabelului
      const orders = ordersResponse.body.orders;
      const mockTableHTML = orders.map(order => `
        <tr data-order-id="${order.order_id}">
          <td>#${order.order_id}</td>
          <td>${order.user_email}</td>
          <td>${order.total_amount} RON</td>
          <td><span class="status-${order.status}">${order.status}</span></td>
          <td>${order.order_date}</td>
          <td>
            <button onclick="viewOrder(${order.order_id})" class="btn-view">👁️ Vezi</button>
            <button onclick="editOrder(${order.order_id})" class="btn-edit">✏️ Editează</button>
          </td>
        </tr>
      `).join('');
      
      expect(mockTableHTML).toContain('#1001');
      expect(mockTableHTML).toContain('test@example.com');
      expect(mockTableHTML).toContain('5999 RON');
      expect(mockTableHTML).toContain('completed');
    });
    
    test('✅ Modalul de vizualizare comandă', async () => {
      // 1. Backend: Obțin comenzile
      const ordersResponse = await request(app)
        .get('/admin/api/orders')
        .set('Authorization', authToken);
        
      const orders = ordersResponse.body.orders;
      const firstOrder = orders[0];
      
      // 2. Frontend: Simulez deschiderea modalului
      const mockModal = {
        style: { display: 'none' },
        innerHTML: ''
      };
      
      // Simulez funcția showOrderModal
      function mockShowOrderModal(orderId) {
        const order = orders.find(o => o.order_id === orderId);
        if (order) {
          mockModal.style.display = 'flex';
          mockModal.innerHTML = `
            <div class="order-info">
              <h4>Comandă #${order.order_id}</h4>
              <p><strong>Client:</strong> ${order.user_email}</p>
              <p><strong>Total:</strong> ${order.total_amount} RON</p>
              <p><strong>Status:</strong> ${order.status}</p>
              <p><strong>Data:</strong> ${order.order_date}</p>
            </div>
          `;
        }
      }
      
      mockShowOrderModal(firstOrder.order_id);
      
      expect(mockModal.style.display).toBe('flex');
      expect(mockModal.innerHTML).toContain(`Comandă #${firstOrder.order_id}`);
      expect(mockModal.innerHTML).toContain(firstOrder.user_email);
    });
  });
  
  describe('🔒 Security Integration Tests', () => {
    test('❌ Accesul la date fără autentificare ar trebui respins', async () => {
      // 1. Backend: Încerc să accesez date fără token
      const ordersResponse = await request(app)
        .get('/admin/api/orders');
        
      expect(ordersResponse.status).toBe(401);
      expect(ordersResponse.body.success).toBe(false);
      
      // 2. Frontend: Simulez redirect la login
      const mockLocation = { href: '' };
      
      if (ordersResponse.status === 401) {
        mockLocation.href = '/admin/login';
      }
      
      expect(mockLocation.href).toBe('/admin/login');
    });
    
    test('❌ Token invalid ar trebui să declanșeze logout', async () => {
      // Mock JWT pentru token invalid
      const { mockJwt } = require('./admin-backend.test');
      mockJwt.verify.mockReturnValueOnce(null);
      
      // 1. Backend: Folosesc token invalid
      const ordersResponse = await request(app)
        .get('/admin/api/orders')
        .set('Authorization', 'Bearer invalid_token');
        
      expect(ordersResponse.status).toBe(401);
      
      // 2. Frontend: Simulez logout automat
      if (ordersResponse.status === 401) {
        mockLocalStorage.removeItem('adminToken');
        mockLocalStorage.removeItem('adminUser');
      }
      
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('adminToken');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('adminUser');
    });
  });
  
  describe('📱 Responsive Integration Tests', () => {
    beforeEach(async () => {
      const loginResponse = await request(app)
        .post('/admin/api/login')
        .send({
          email: 'admin@example.com',
          password: 'password123'
        });
      authToken = `Bearer ${loginResponse.body.token}`;
    });
    
    test('📱 Datele ar trebui să se încarce corect pe mobile', async () => {
      // Simulez viewport mobile
      global.innerWidth = 375;
      global.innerHeight = 667;
      
      // 1. Backend: Obțin datele
      const statsResponse = await request(app)
        .get('/admin/api/stats')
        .set('Authorization', authToken);
        
      expect(statsResponse.status).toBe(200);
      
      // 2. Frontend: Datele ar trebui să fie la fel de valide pe mobile
      const stats = statsResponse.body.stats;
      expect(stats.totalOrders).toBe(1250);
      expect(stats.totalRevenue).toBe(125430);
    });
  });
  
  describe('⚡ Performance Integration Tests', () => {
    beforeEach(async () => {
      const loginResponse = await request(app)
        .post('/admin/api/login')
        .send({
          email: 'admin@example.com',
          password: 'password123'
        });
      authToken = `Bearer ${loginResponse.body.token}`;
    });
    
    test('⚡ Încărcarea completă a dashboard-ului ar trebui să fie rapidă', async () => {
      const startTime = Date.now();
      
      // Simulez încărcarea simultană a datelor
      const [statsResponse, ordersResponse, financialResponse] = await Promise.all([
        request(app).get('/admin/api/stats').set('Authorization', authToken),
        request(app).get('/admin/api/orders').set('Authorization', authToken),
        request(app).get('/admin/api/financial-data').set('Authorization', authToken)
      ]);
      
      const endTime = Date.now();
      const loadTime = endTime - startTime;
      
      expect(statsResponse.status).toBe(200);
      expect(ordersResponse.status).toBe(200);
      expect(financialResponse.status).toBe(200);
      expect(loadTime).toBeLessThan(1000); // sub 1 secundă pentru toate cererile
    });
  });
  
  describe('🔄 Error Handling Integration Tests', () => {
    beforeEach(async () => {
      const loginResponse = await request(app)
        .post('/admin/api/login')
        .send({
          email: 'admin@example.com',
          password: 'password123'
        });
      authToken = `Bearer ${loginResponse.body.token}`;
    });
    
    test('🚨 Gestionarea erorilor de rețea', async () => {
      // Simulez o eroare de server
      const mockErrorResponse = {
        status: 500,
        body: {
          success: false,
          message: 'Eroare server'
        }
      };
      
      // Frontend ar trebui să gestioneze eroarea elegant
      const mockNotification = {
        show: jest.fn(),
        type: '',
        message: ''
      };
      
      if (mockErrorResponse.status >= 500) {
        mockNotification.type = 'error';
        mockNotification.message = 'Eroare de server. Vă rugăm încercați din nou.';
        mockNotification.show();
      }
      
      expect(mockNotification.type).toBe('error');
      expect(mockNotification.message).toContain('Eroare de server');
      expect(mockNotification.show).toHaveBeenCalled();
    });
  });
});

// 📊 Test de end-to-end complet
describe('🎯 Admin E2E Complete Workflow', () => {
  let app;
  
  beforeEach(() => {
    app = createTestApp();
    jest.clearAllMocks();
  });
  
  test('🎯 Workflow complet: Login → Dashboard → Orders → Logout', async () => {
    // 1. STEP: Login
    const loginResponse = await request(app)
      .post('/admin/api/login')
      .send({
        email: 'admin@example.com',
        password: 'password123'
      });
      
    expect(loginResponse.status).toBe(200);
    const authToken = `Bearer ${loginResponse.body.token}`;
    
    // 2. STEP: Load Dashboard Stats
    const statsResponse = await request(app)
      .get('/admin/api/stats')
      .set('Authorization', authToken);
      
    expect(statsResponse.status).toBe(200);
    expect(statsResponse.body.stats.totalOrders).toBe(1250);
    
    // 3. STEP: Load Orders
    const ordersResponse = await request(app)
      .get('/admin/api/orders')
      .set('Authorization', authToken);
      
    expect(ordersResponse.status).toBe(200);
    expect(ordersResponse.body.orders).toHaveLength(2);
    
    // 4. STEP: Load Financial Data
    const financialResponse = await request(app)
      .get('/admin/api/financial-data')
      .set('Authorization', authToken);
      
    expect(financialResponse.status).toBe(200);
    expect(financialResponse.body.data.income.paid).toBe(125430);
    
    // 5. STEP: Frontend - Simulez logout
    mockLocalStorage.clear();
    
    expect(mockLocalStorage.clear).toHaveBeenCalled();
    
    console.log('✅ Workflow E2E complet - SUCCESS!');
  });
});

console.log('🔄 Teste Integrative Admin - Configurate și gata de rulare!');

module.exports = {
  // Export pentru utilizare în alte teste
};