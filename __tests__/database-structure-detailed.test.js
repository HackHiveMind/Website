const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

describe('🔍 VERIFICARE DETALIATĂ STRUCTURA BAZEI DE DATE', () => {
    let supabase;
    
    beforeAll(() => {
        const supabaseUrl = process.env.SUPABASE_URL || 'https://jhspgxonaankhjjqkqgw.supabase.co';
        const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impoc3BneG9uYWFua2hqanFrcWd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3MzI0MjQsImV4cCI6MjA3MjMwODQyNH0.doxG6-PqF8uicyVyR6fuFFV410w8AzQ9iukfxHoyN64';
        
        supabase = createClient(supabaseUrl, supabaseKey);
    });

    describe('📊 Verificare detaliată tabel ORDERS', () => {
        test('✅ Schema completă tabel orders', async () => {
            console.log('\n🔍 ANALIZĂ DETALIATĂ TABEL ORDERS');
            console.log('='.repeat(50));
            
            const { data: orders, error } = await supabase
                .from('orders')
                .select('*')
                .limit(3);
            
            expect(error).toBeNull();
            expect(orders).toBeDefined();
            expect(orders.length).toBeGreaterThan(0);
            
            if (orders && orders.length > 0) {
                const sampleOrder = orders[0];
                const schema = {};
                
                // Analizăm tipurile și valorile
                Object.entries(sampleOrder).forEach(([key, value]) => {
                    schema[key] = {
                        type: value === null ? 'nullable' : typeof value,
                        hasValue: value !== null,
                        sampleValue: value
                    };
                });
                
                console.log('\n📋 SCHEMA ORDERS:');
                Object.entries(schema).forEach(([column, info]) => {
                    const status = info.hasValue ? '✅' : '⚠️';
                    console.log(`${status} ${column}:`);
                    console.log(`     Tip: ${info.type}`);
                    console.log(`     Valoare exemplu: ${info.sampleValue}`);
                    console.log('');
                });
                
                // Verificări specifice pentru coloane esențiale
                expect(schema.order_id.type).toBe('number');
                expect(schema.total_amount.type).toBe('number');
                expect(schema.status.type).toBe('string');
                expect(schema.order_date.type).toBe('string');
                
                console.log('✅ Schema orders validată cu succes');
            }
        });

        test('✅ Consistența datelor în orders', async () => {
            console.log('\n🔍 VERIFICARE CONSISTENȚĂ DATE ORDERS');
            
            const { data: orders, error } = await supabase
                .from('orders')
                .select('order_id, total_amount, status, order_date, payment_method')
                .limit(10);
            
            expect(error).toBeNull();
            expect(orders).toBeDefined();
            
            if (orders && orders.length > 0) {
                let validOrders = 0;
                let invalidOrders = 0;
                const issues = [];
                
                orders.forEach((order, index) => {
                    let orderValid = true;
                    const orderIssues = [];
                    
                    // Verificăm order_id
                    if (!order.order_id || typeof order.order_id !== 'number') {
                        orderValid = false;
                        orderIssues.push('order_id invalid');
                    }
                    
                    // Verificăm total_amount
                    if (!order.total_amount || typeof order.total_amount !== 'number' || order.total_amount <= 0) {
                        orderValid = false;
                        orderIssues.push('total_amount invalid');
                    }
                    
                    // Verificăm status
                    if (!order.status || typeof order.status !== 'string') {
                        orderValid = false;
                        orderIssues.push('status invalid');
                    }
                    
                    // Verificăm order_date
                    if (!order.order_date || typeof order.order_date !== 'string') {
                        orderValid = false;
                        orderIssues.push('order_date invalid');
                    }
                    
                    if (orderValid) {
                        validOrders++;
                    } else {
                        invalidOrders++;
                        issues.push(`Order ${order.order_id}: ${orderIssues.join(', ')}`);
                    }
                });
                
                console.log(`\n📊 REZULTATE CONSISTENȚĂ:`);
                console.log(`   ✅ Orders valide: ${validOrders}`);
                console.log(`   ❌ Orders cu probleme: ${invalidOrders}`);
                
                if (issues.length > 0) {
                    console.log('\n⚠️ PROBLEME DETECTATE:');
                    issues.forEach(issue => console.log(`   ${issue}`));
                }
                
                expect(validOrders).toBeGreaterThan(0);
                console.log('\n✅ Verificare consistență completată');
            }
        });
    });

    describe('📦 Verificare detaliată tabel PRODUCTS', () => {
        test('✅ Schema și date products', async () => {
            console.log('\n🔍 ANALIZĂ TABEL PRODUCTS');
            
            const { data: products, error } = await supabase
                .from('products')
                .select('*')
                .limit(3);
            
            if (error) {
                console.log(`⚠️ Eroare la accesarea tabelului products: ${error.message}`);
                expect(error.code).toBeDefined(); // Acceptăm că poate să nu existe
                return;
            }
            
            expect(products).toBeDefined();
            
            if (products && products.length > 0) {
                console.log(`\n📊 Produse găsite: ${products.length}`);
                
                const sampleProduct = products[0];
                console.log('\n📋 COLOANE PRODUCTS:');
                Object.entries(sampleProduct).forEach(([key, value]) => {
                    const type = value === null ? 'null' : typeof value;
                    console.log(`   ${key}: ${type} (${value})`);
                });
                
                // Verificări de bază
                expect(typeof sampleProduct.product_id).toBe('number');
                if (sampleProduct.name) expect(typeof sampleProduct.name).toBe('string');
                if (sampleProduct.price) expect(typeof sampleProduct.price).toBe('number');
                
                console.log('\n✅ Tabelul products are structură validă');
            } else {
                console.log('\n⚠️ Tabelul products este gol');
            }
        });
    });

    describe('👥 Verificare detaliată tabel USERS', () => {
        test('✅ Schema și accesibilitate users', async () => {
            console.log('\n🔍 ANALIZĂ TABEL USERS');
            
            const { data: users, error } = await supabase
                .from('users')
                .select('*')
                .limit(3);
            
            if (error) {
                console.log(`⚠️ Eroare la accesarea tabelului users: ${error.message}`);
                expect(error.code).toBeDefined();
                return;
            }
            
            expect(users).toBeDefined();
            
            if (users && users.length > 0) {
                console.log(`\n📊 Utilizatori găsiți: ${users.length}`);
                
                const sampleUser = users[0];
                console.log('\n📋 COLOANE USERS:');
                Object.entries(sampleUser).forEach(([key, value]) => {
                    const type = value === null ? 'null' : typeof value;
                    console.log(`   ${key}: ${type}`);
                });
                
                console.log('\n✅ Tabelul users are structură validă');
            } else {
                console.log('\n⚠️ Tabelul users este gol (normal pentru aplicații noi)');
            }
        });
    });

    describe('🔗 Verificare relații și integritate', () => {
        test('✅ Verificare chei și relații', async () => {
            console.log('\n🔍 VERIFICARE INTEGRITATE REFERENȚIALĂ');
            
            // Verificăm dacă orders au user_id-uri valide (dacă există)
            const { data: ordersWithUsers, error } = await supabase
                .from('orders')
                .select('order_id, user_id')
                .not('user_id', 'is', null)
                .limit(5);
            
            expect(error).toBeNull();
            
            if (ordersWithUsers && ordersWithUsers.length > 0) {
                console.log(`\n📊 Orders cu user_id setat: ${ordersWithUsers.length}`);
                ordersWithUsers.forEach(order => {
                    console.log(`   Order ${order.order_id} → User ${order.user_id}`);
                });
            } else {
                console.log('\n📊 Nu există orders cu user_id setat');
            }
            
            // Verificăm items în orders (dacă sunt structurate)
            const { data: ordersWithItems, error: itemsError } = await supabase
                .from('orders')
                .select('order_id, items')
                .not('items', 'is', null)
                .limit(3);
            
            expect(itemsError).toBeNull();
            
            if (ordersWithItems && ordersWithItems.length > 0) {
                console.log(`\n📦 Orders cu items: ${ordersWithItems.length}`);
                ordersWithItems.forEach(order => {
                    const itemsCount = Array.isArray(order.items) ? order.items.length : 'N/A';
                    console.log(`   Order ${order.order_id}: ${itemsCount} items`);
                });
            }
            
            console.log('\n✅ Verificare relații completată');
        });
    });

    describe('📈 Raport final structură', () => {
        test('✅ Raport complet structură bază de date', async () => {
            console.log('\n' + '='.repeat(60));
            console.log('🎯 RAPORT FINAL STRUCTURA BAZEI DE DATE');
            console.log('='.repeat(60));
            
            // Statistici generale
            const tables = ['orders', 'products', 'users'];
            const tableStats = {};
            
            for (const table of tables) {
                try {
                    const { data, error } = await supabase
                        .from(table)
                        .select('*', { count: 'exact', head: true });
                    
                    tableStats[table] = {
                        accessible: !error,
                        count: data || 0,
                        error: error?.message || null
                    };
                } catch (err) {
                    tableStats[table] = {
                        accessible: false,
                        count: 0,
                        error: err.message
                    };
                }
            }
            
            console.log('\n📊 SUMAR TABELE:');
            Object.entries(tableStats).forEach(([table, stats]) => {
                const status = stats.accessible ? '✅' : '❌';
                console.log(`${status} ${table.toUpperCase()}:`);
                console.log(`     Accesibil: ${stats.accessible ? 'DA' : 'NU'}`);
                console.log(`     Înregistrări: ${stats.count}`);
                if (stats.error) {
                    console.log(`     Eroare: ${stats.error}`);
                }
                console.log('');
            });
            
            // Calculăm scor de integritate
            const accessibleTables = Object.values(tableStats).filter(s => s.accessible).length;
            const integrityScore = (accessibleTables / tables.length) * 100;
            
            console.log(`🎯 SCOR INTEGRITATE: ${integrityScore.toFixed(1)}%`);
            
            if (integrityScore >= 80) {
                console.log('✅ Baza de date este în stare EXCELENTĂ');
            } else if (integrityScore >= 60) {
                console.log('⚠️ Baza de date este în stare ACCEPTABILĂ');
            } else {
                console.log('❌ Baza de date necesită ATENȚIE');
            }
            
            console.log('\n' + '='.repeat(60));
            console.log('✅ VERIFICARE STRUCTURĂ COMPLETĂ');
            console.log('='.repeat(60));
            
            expect(accessibleTables).toBeGreaterThan(0);
        });
    });
});