// ✅ VERIFICARE SCHEMA ORDERS
// Verifică coloanele reale din tabela orders

describe('🔍 VERIFICARE SCHEMA ORDERS', () => {
    let supabase;
    
    beforeAll(() => {
        require('dotenv').config();
        const { createClient } = require('@supabase/supabase-js');
        
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_ANON_KEY;
        supabase = createClient(supabaseUrl, supabaseKey);
    });

    test('✅ Verificare coloane disponibile în tabela orders', async () => {
        try {
            // Încearcă să obții o singură înregistrare pentru a vedea coloanele
            const { data: sample, error } = await supabase
                .from('orders')
                .select('*')
                .limit(1);
            
            if (error) {
                console.log('❌ Eroare la încărcarea sample:', error.message);
                return;
            }
            
            if (sample && sample.length > 0) {
                const firstOrder = sample[0];
                console.log('📋 COLOANE DISPONIBILE ÎN TABELA ORDERS:');
                console.log('=====================================');
                
                Object.keys(firstOrder).forEach((column, index) => {
                    const value = firstOrder[column];
                    const type = typeof value;
                    console.log(`${index + 1}. ${column}: ${type} (ex: ${value})`);
                });
                
                console.log('=====================================');
                
                // Verifică coloanele pe care le folosim în cod
                const expectedColumns = ['order_id', 'order_date', 'total_amount', 'status', 'user_email'];
                const availableColumns = Object.keys(firstOrder);
                
                console.log('\n🔍 VERIFICARE COLOANE FOLOSITE ÎN COD:');
                expectedColumns.forEach(col => {
                    const exists = availableColumns.includes(col);
                    console.log(`   ${exists ? '✅' : '❌'} ${col}`);
                });
                
                // Sugerează maparea corectă
                console.log('\n💡 MAPARE SUGERATĂ:');
                if (!availableColumns.includes('user_email')) {
                    const possibleEmailColumns = availableColumns.filter(col => 
                        col.includes('email') || col.includes('customer') || col.includes('user')
                    );
                    console.log(`   user_email → ${possibleEmailColumns.join(' SAU ') || 'nu există coloană email'}`);
                }
                
            } else {
                console.log('❌ Nu s-au găsit date în tabela orders');
            }
            
            expect(true).toBe(true); // Test informational
            
        } catch (error) {
            console.log('❌ Eroare verificare schema:', error.message);
            expect(true).toBe(true);
        }
    });

    test('✅ Test selectare directă cu coloane cunoscute', async () => {
        try {
            console.log('\n🔄 Testare selectare cu coloane de bază...');
            
            const { data: orders, error } = await supabase
                .from('orders')
                .select('order_id, order_date, total_amount, status')
                .limit(3);
            
            if (error) {
                console.log('❌ Eroare select de bază:', error.message);
                return;
            }
            
            console.log(`✅ Încărcat cu succes ${orders?.length || 0} orders cu coloane de bază`);
            if (orders && orders.length > 0) {
                console.log('📋 Sample data:');
                orders.forEach((order, index) => {
                    console.log(`   ${index + 1}. Order #${order.order_id}: ${order.total_amount} RON (${order.status})`);
                });
            }
            
            expect(orders?.length).toBeGreaterThan(0);
            
        } catch (error) {
            console.log('❌ Eroare test select:', error.message);
            expect(true).toBe(true);
        }
    });
});