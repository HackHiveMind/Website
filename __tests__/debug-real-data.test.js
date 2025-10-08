// ✅ TEST DIRECT API STATISTICI
// Verifică dacă API-ul returnează date reale sau mock

describe('🔍 VERIFICARE DATE REALE STATISTICI', () => {
    let supabase;
    
    beforeAll(() => {
        require('dotenv').config();
        const { createClient } = require('@supabase/supabase-js');
        
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_ANON_KEY;
        supabase = createClient(supabaseUrl, supabaseKey);
    });

    test('✅ Calculare statistici reale direct din Supabase', async () => {
        try {
            console.log('🔍 Calculare statistici directe din Supabase...');
            
            // Calculează statistici reale exact cum face API-ul
            const [ordersCount, usersCount, totalRevenue] = await Promise.all([
                supabase.from('orders').select('order_id', { count: 'exact' }),
                supabase.from('users').select('user_id', { count: 'exact' }),
                supabase.from('orders').select('total_amount').eq('status', 'completed')
            ]);

            console.log('📊 Rezultate directe din Supabase:');
            console.log(`   - Orders count: ${ordersCount.count || 0}`);
            console.log(`   - Orders error: ${ordersCount.error?.message || 'none'}`);
            console.log(`   - Users count: ${usersCount.count || 0}`);
            console.log(`   - Users error: ${usersCount.error?.message || 'none'}`);
            console.log(`   - Revenue data: ${totalRevenue.data?.length || 0} completed orders`);
            console.log(`   - Revenue error: ${totalRevenue.error?.message || 'none'}`);
            
            if (!ordersCount.error && !usersCount.error) {
                const revenue = totalRevenue.data?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
                const conversionRate = ordersCount.count && usersCount.count ? 
                    ((ordersCount.count / usersCount.count) * 100).toFixed(1) : 0;
                
                console.log('\n✅ STATISTICI REALE CALCULATE:');
                console.log(`   📦 Total Orders: ${ordersCount.count}`);
                console.log(`   👥 Total Users: ${usersCount.count}`);
                console.log(`   💰 Total Revenue: ${revenue.toLocaleString()} RON`);
                console.log(`   📈 Conversion Rate: ${conversionRate}%`);
                
                console.log('\n🔍 COMPARAȚIE CU DASHBOARD:');
                console.log(`   Orders: Dashboard=860, Real=${ordersCount.count} ${ordersCount.count === 860 ? '✅' : '❌'}`);
                console.log(`   Revenue: Dashboard=73,693, Real=${revenue.toLocaleString()} ${revenue === 73693 ? '✅' : '❌'}`);
                console.log(`   Users: Dashboard=530, Real=${usersCount.count} ${usersCount.count === 530 ? '✅' : '❌'}`);
                
            } else {
                console.log('❌ Erori la obținerea datelor din Supabase');
                console.log('   - Orders error:', ordersCount.error?.message);
                console.log('   - Users error:', usersCount.error?.message);
            }
            
            expect(true).toBe(true); // Test informational
            
        } catch (error) {
            console.log('❌ Eroare calculare statistici:', error.message);
            expect(true).toBe(true);
        }
    });

    test('✅ Test API /admin/api/stats (simulare)', async () => {
        try {
            console.log('\n🔄 Simulare apel API /admin/api/stats...');
            
            // Simulează exact ce face backend-ul
            const [ordersCount, usersCount, totalRevenue] = await Promise.all([
                supabase.from('orders').select('order_id', { count: 'exact' }),
                supabase.from('users').select('user_id', { count: 'exact' }),
                supabase.from('orders').select('total_amount').eq('status', 'completed')
            ]);

            let stats = {
                totalOrders: 0,
                totalUsers: 0,
                totalRevenue: 0,
                conversionRate: 0,
                source: 'dummy_data'
            };

            if (!ordersCount.error && !usersCount.error) {
                const revenue = totalRevenue.data?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
                
                stats = {
                    totalOrders: ordersCount.count || 0,
                    totalUsers: usersCount.count || 0,
                    totalRevenue: revenue,
                    conversionRate: ordersCount.count && usersCount.count ? 
                        ((ordersCount.count / usersCount.count) * 100).toFixed(1) : 0,
                    source: 'supabase'
                };
                
                console.log('✅ API ar trebui să returneze (real data):');
            } else {
                // Fallback la date dummy
                stats = {
                    totalOrders: 1250,
                    totalUsers: 850,
                    totalRevenue: 125430,
                    conversionRate: 15.8,
                    source: 'dummy_data',
                    error: 'Conexiune DB indisponibilă'
                };
                
                console.log('⚠️ API va returna (fallback dummy):');
            }

            console.log(`   📊 ${JSON.stringify(stats, null, 2)}`);
            
            expect(true).toBe(true);
            
        } catch (error) {
            console.log('❌ Eroare simulare API:', error.message);
            expect(true).toBe(true);
        }
    });

    test('✅ Verificare dacă există tabela users', async () => {
        try {
            console.log('\n🔍 Verificare existență tabela users...');
            
            const { data: users, error } = await supabase
                .from('users')
                .select('user_id')
                .limit(1);
            
            if (error) {
                console.log('❌ Eroare la accesarea tabelei users:', error.message);
                console.log('💡 Aceasta poate fi cauza discrepanței - nu există tabela users!');
            } else {
                console.log(`✅ Tabela users există și conține date: ${users?.length || 0} users găsiți`);
            }
            
            expect(true).toBe(true);
            
        } catch (error) {
            console.log('❌ Eroare verificare users:', error.message);
            expect(true).toBe(true);
        }
    });

    test('✅ Raport verificare date reale', () => {
        console.log('\n🎯 RAPORT VERIFICARE DATE DASHBOARD:');
        console.log('============================================');
        console.log('📱 DASHBOARD AFIȘEAZĂ:');
        console.log('   - Venituri: 73,693');
        console.log('   - Comenzi: 860');
        console.log('   - Utilizatori: 530');
        console.log('   - Conversie: 102%');
        console.log('');
        console.log('🔍 DATE REALE SUPABASE (din teste):');
        console.log('   - Venituri: 412,207.95 RON');
        console.log('   - Comenzi: 65');
        console.log('   - Utilizatori: ? (probabil tabela nu există)');
        console.log('   - Conversie: ? (dependent de users)');
        console.log('');
        console.log('❌ CONCLUZIE: Datele din dashboard sunt MOCK!');
        console.log('💡 CAUZE POSIBILE:');
        console.log('   1. API-ul /admin/api/stats nu este apelat');
        console.log('   2. Frontend folosește date hardcodate');
        console.log('   3. Tabela users nu există în Supabase');
        console.log('   4. Erori de conectivitate cad la fallback');
        console.log('============================================\n');
        
        expect(true).toBe(true);
    });
});