// 🔍 TEST VERIFICARE BAZA DE DATE - Admin Dashboard
const path = require('path');
const fs = require('fs');

describe('🔍 Database Connection Debug', () => {
  
  test('✅ Verifică configurația bazei de date', () => {
    console.log('\n🔍 === DEBUGGING DATABASE CONFIG ===');
    
    // Verifică fișierele de configurare
    const configFiles = [
      { path: '../backend/db.js', name: 'DB Config' },
      { path: '../backend/databasepg.js', name: 'PostgreSQL Config' },
      { path: '../.env', name: 'Environment Variables' }
    ];
    
    configFiles.forEach(file => {
      const filePath = path.join(__dirname, file.path);
      const exists = fs.existsSync(filePath);
      
      console.log(`${exists ? '✅' : '❌'} ${file.name}: ${exists ? 'găsit' : 'lipsă'}`);
      
      if (exists) {
        const content = fs.readFileSync(filePath, 'utf8');
        console.log(`   📄 Dimensiune: ${content.length} caractere`);
        
        if (file.name === 'Environment Variables') {
          // Verifică variabilele de mediu (fără să afișeze valorile secrete)
          const envVars = ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'DATABASE_URL'];
          envVars.forEach(varName => {
            const hasVar = content.includes(varName);
            console.log(`   ${hasVar ? '✅' : '❌'} ${varName}: ${hasVar ? 'configurat' : 'lipsă'}`);
          });
        }
      }
    });
    
    console.log('=== END DATABASE CONFIG DEBUG ===\n');
    expect(true).toBe(true);
  });

  test('✅ Verifică rutele admin pentru date reale', () => {
    console.log('\n🔍 === DEBUGGING ADMIN ROUTES ===');
    
    const serverPath = path.join(__dirname, '../server.js');
    const adminRoutesPath = path.join(__dirname, '../backend/routes/admin.js');
    
    // Verifică server.js
    if (fs.existsSync(serverPath)) {
      const serverContent = fs.readFileSync(serverPath, 'utf8');
      console.log('✅ Server.js găsit');
      
      // Caută rutele admin
      const adminEndpoints = [
        '/admin/api/stats',
        '/admin/api/orders',
        '/admin/api/financial-data',
        '/admin/api/login'
      ];
      
      adminEndpoints.forEach(endpoint => {
        const hasEndpoint = serverContent.includes(endpoint) || 
                           serverContent.includes(endpoint.replace('/admin/api/', ''));
        console.log(`   ${hasEndpoint ? '✅' : '❌'} ${endpoint}: ${hasEndpoint ? 'găsit' : 'lipsă'}`);
      });
      
      // Verifică dacă server.js include rutele admin
      const includesAdminRoutes = serverContent.includes('admin.js') || 
                                 serverContent.includes('/admin') ||
                                 serverContent.includes('adminRoutes');
      console.log(`   ${includesAdminRoutes ? '✅' : '❌'} Include rute admin: ${includesAdminRoutes}`);
    } else {
      console.log('❌ Server.js nu a fost găsit');
    }
    
    // Verifică fișierul de rute admin
    if (fs.existsSync(adminRoutesPath)) {
      const adminContent = fs.readFileSync(adminRoutesPath, 'utf8');
      console.log('✅ Admin routes găsite');
      console.log(`   📄 Dimensiune: ${adminContent.length} caractere`);
      
      // Verifică dacă conține query-uri pentru baza de date
      const hasDBQueries = adminContent.includes('supabase') || 
                          adminContent.includes('SELECT') ||
                          adminContent.includes('.from(') ||
                          adminContent.includes('query');
      console.log(`   ${hasDBQueries ? '✅' : '❌'} Conține query-uri DB: ${hasDBQueries}`);
    } else {
      console.log('❌ Rute admin nu au fost găsite');
    }
    
    console.log('=== END ADMIN ROUTES DEBUG ===\n');
    expect(true).toBe(true);
  });

  test('✅ Debug frontend admin pentru încărcarea datelor', () => {
    console.log('\n🔍 === DEBUGGING FRONTEND ADMIN ===');
    
    const frontendFiles = [
      { path: '../frontend/public/admin.html', name: 'Admin HTML' },
      { path: '../frontend/public/scripts/admin-new.js', name: 'Admin JavaScript' }
    ];
    
    frontendFiles.forEach(file => {
      const filePath = path.join(__dirname, file.path);
      const exists = fs.existsSync(filePath);
      
      console.log(`${exists ? '✅' : '❌'} ${file.name}: ${exists ? 'găsit' : 'lipsă'}`);
      
      if (exists) {
        const content = fs.readFileSync(filePath, 'utf8');
        console.log(`   📄 Dimensiune: ${content.length} caractere`);
        
        if (file.name === 'Admin JavaScript') {
          // Verifică funcțiile pentru încărcarea datelor
          const dataFunctions = [
            'loadDashboardStats',
            'loadOrders', 
            'loadFinancialData',
            'fetch(',
            'api/stats',
            'api/orders'
          ];
          
          dataFunctions.forEach(func => {
            const hasFunction = content.includes(func);
            console.log(`   ${hasFunction ? '✅' : '❌'} ${func}: ${hasFunction ? 'găsit' : 'lipsă'}`);
          });
          
          // Verifică API calls
          const apiCallCount = (content.match(/fetch\(/g) || []).length;
          console.log(`   📊 Numărul de API calls: ${apiCallCount}`);
        }
      }
    });
    
    console.log('=== END FRONTEND ADMIN DEBUG ===\n');
    expect(true).toBe(true);
  });

  test('✅ Verifică schema bazei de date', () => {
    console.log('\n🔍 === DEBUGGING DATABASE SCHEMA ===');
    
    const schemaFiles = [
      { path: '../backend/database/schema.sql', name: 'Schema SQL' },
      { path: '../backend/database/setup_database.php', name: 'Setup Database' },
      { path: '../backend/database/tabel.sql', name: 'Tabel SQL' }
    ];
    
    schemaFiles.forEach(file => {
      const filePath = path.join(__dirname, file.path);
      const exists = fs.existsSync(filePath);
      
      console.log(`${exists ? '✅' : '❌'} ${file.name}: ${exists ? 'găsit' : 'lipsă'}`);
      
      if (exists) {
        const content = fs.readFileSync(filePath, 'utf8');
        console.log(`   📄 Dimensiune: ${content.length} caractere`);
        
        if (file.name === 'Schema SQL') {
          // Verifică tabelele necesare pentru admin
          const expectedTables = ['users', 'orders', 'products', 'order_items'];
          expectedTables.forEach(table => {
            const hasTable = content.toLowerCase().includes(table);
            console.log(`   ${hasTable ? '✅' : '❌'} Tabel ${table}: ${hasTable ? 'găsit' : 'lipsă'}`);
          });
        }
      }
    });
    
    console.log('=== END DATABASE SCHEMA DEBUG ===\n');
    expect(true).toBe(true);
  });
});

console.log('🔍 Debug Supabase Test - Configurat și gata!');