require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');

// === Configurare Supabase ===
const supabaseUrl = process.env.SUPABASE_URL || 'https://jhspgxonaankhjjqkqgw.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impoc3BneG9uYWFua2hqanFrcWd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3MzI0MjQsImV4cCI6MjA3MjMwODQyNH0.doxG6-PqF8uicyVyR6fuFFV410w8AzQ9iukfxHoyN64';
const supabase = createClient(supabaseUrl, supabaseKey);

// === Configurare Email ===
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
let transporter = null;
if (EMAIL_USER && EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: EMAIL_USER, pass: EMAIL_PASS }
  });
} else {
  console.warn('⚠️  EMAIL_USER / EMAIL_PASS lipsesc. Email-urile NU vor fi trimise.');
}

// === Admin credentiale ===
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'admin123';

// === Feature Flags ===
let gpt5Enabled = (process.env.GPT5_ENABLED || 'false').toLowerCase() === 'true';

// === Dummy Orders ===
const ORDERS = [
  {
    order_id: 1,
    order_date: '2024-06-01',
    total_amount: 150,
    status: 'livrat',
    tracking_number: 'TRK123',
    user_email: 'client1@example.com'
  },
  {
    order_id: 2,
    order_date: '2024-06-02',
    total_amount: 200,
    status: 'expediat',
    tracking_number: 'TRK456',
    user_email: 'client2@example.com'
  }
];

// === Middleware pentru autentificare ===
function adminAuth(req) {
  const auth = req.headers.authorization;
  return auth && auth === 'Bearer admin-token';
}

// === Main Handler - Vercel Serverless Function (Catch-all Route) ===
export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const path = req.url.replace(/^\/api\//, '');
  const method = req.method;
  const body = req.body || {};

  try {
    // === Login Endpoint ===
    if (path === 'login' && method === 'POST') {
      console.log('🔍 Login attempt - body:', body);

      if (!body || typeof body !== 'object') {
        return res.status(400).json({
          success: false,
          message: 'Body lipsă - verifică Content-Type: application/json'
        });
      }

      const { email, password } = body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email și password sunt obligatorii'
        });
      }

      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        return res.status(200).json({
          success: true,
          token: 'admin-token',
          user: { email }
        });
      } else {
        return res.json({ success: false, message: 'Credențiale invalide!' });
      }
    }

    // === Feature Flags List ===
    if (path === 'feature-flags' && method === 'GET') {
      return res.json({ success: true, flags: { gpt5: gpt5Enabled } });
    }

    // === Update GPT5 Flag ===
    if (path === 'feature-flags/gpt5' && method === 'PUT') {
      if (!adminAuth(req)) {
        return res.status(401).json({ success: false, message: 'Neautorizat' });
      }

      const { enabled } = body || {};
      if (typeof enabled !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: 'Campul enabled (boolean) este obligatoriu'
        });
      }

      gpt5Enabled = enabled;
      return res.json({ success: true, gpt5: gpt5Enabled });
    }

    // === Email Health ===
    if (path === 'email-health' && method === 'GET') {
      return res.json({
        success: true,
        emailConfigured: !!(EMAIL_USER && EMAIL_PASS),
        userSet: !!EMAIL_USER,
        passSet: !!EMAIL_PASS
      });
    }

    // === List Products ===
    if (path === 'products' && method === 'GET') {
      try {
        // Preluează produsele din Supabase - selectează doar coloanele care știu că există
        const { data: products, error } = await supabase
          .from('products')
          .select('*')
          .order('product_id', { ascending: true });

        if (error) {
          console.error('❌ Eroare Supabase products:', error);
          return res.status(500).json({
            success: false,
            message: 'Eroare la preluarea produselor din baza de date',
            error: error.message
          });
        }

        console.log('📦 Raw products from DB:', products?.[0]); // Debug: log first product

        // Transform data pentru frontend (mapez coloanele disponibile)
        const transformedProducts = (products || []).map(product => {
          const transformed = {
            id: product.product_id || product.id,
            name: product.name || '',
            description: product.description || '',
            category: product.category || 'other',
            price: parseFloat(product.price) || 0,
            rating: parseFloat(product.rating) || 4.5,
            image: product.image_url || product.image || '',
            stock_quantity: product.stock_quantity || 0,
            colors: product.colors || null,
            specs: product.specs || null
          };
          return transformed;
        });

        console.log('✅ Transformed products sample:', transformedProducts?.[0]); // Debug

        return res.json({
          success: true,
          products: transformedProducts,
          count: transformedProducts.length,
          source: 'supabase'
        });
      } catch (err) {
        console.error('❌ Exception products:', err);
        return res.status(500).json({
          success: false,
          message: 'Eroare internă la preluarea produselor',
          error: err.message
        });
      }
    }

    // === Get Single Product ===
    if (path.match(/^products\/\d+$/) && method === 'GET') {
      try {
        const productId = path.split('/')[1];
        
        const { data: product, error } = await supabase
          .from('products')
          .select('*')
          .eq('product_id', productId)
          .single();

        if (error || !product) {
          console.log('⚠️ Product not found:', productId);
          return res.status(404).json({
            success: false,
            message: 'Produs nu a fost găsit'
          });
        }

        // Transform data
        const transformedProduct = {
          id: product.product_id || product.id,
          name: product.name || '',
          description: product.description || '',
          category: product.category || 'other',
          price: parseFloat(product.price) || 0,
          rating: parseFloat(product.rating) || 4.5,
          image: product.image_url || product.image || '',
          stock_quantity: product.stock_quantity || 0,
          colors: product.colors || null,
          specs: product.specs || null
        };

        return res.json({
          success: true,
          product: transformedProduct,
          source: 'supabase'
        });
      } catch (err) {
        console.error('❌ Exception get product:', err);
        return res.status(500).json({
          success: false,
          message: 'Eroare internă la preluarea produsului',
          error: err.message
        });
      }
    }

    // === Checkout ===
    if (path === 'checkout' && method === 'POST') {
      const orderData = body || {};
      const items = Array.isArray(orderData.items) ? orderData.items : [];
      const shippingCost = parseFloat(orderData.shipping?.cost || 0) || 0;

      if (items.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Cosul este gol'
        });
      }

      const totalAmount = items.reduce((sum, item) => {
        const price = parseFloat(item.price) || 0;
        const qty = parseInt(item.quantity, 10) || 0;
        return sum + price * qty;
      }, 0) + shippingCost;

      try {
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .insert({
            total_amount: totalAmount,
            status: 'pending'
          })
          .select('order_id')
          .single();

        if (orderError || !order?.order_id) {
          console.error('❌ Eroare insert order:', orderError);
          return res.status(500).json({
            success: false,
            message: 'Eroare la salvarea comenzii',
            error: orderError?.message || 'Unknown error'
          });
        }

        const orderItems = items.map((item) => ({
          order_id: order.order_id,
          product_id: parseInt(item.productId, 10) || null,
          quantity: parseInt(item.quantity, 10) || 1,
          unit_price: parseFloat(item.price) || 0
        }));

        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItems);

        if (itemsError) {
          console.error('❌ Eroare insert order_items:', itemsError);
          return res.status(500).json({
            success: false,
            message: 'Eroare la salvarea produselor comenzii',
            error: itemsError.message
          });
        }

        return res.json({
          success: true,
          orderId: order.order_id,
          totalAmount
        });
      } catch (err) {
        console.error('❌ Checkout exception:', err);
        return res.status(500).json({
          success: false,
          message: 'Eroare interna la checkout',
          error: err.message
        });
      }
    }

    // === List Orders ===
    if (path === 'orders' && method === 'GET') {
      if (!adminAuth(req)) {
        return res.status(401).json({ success: false, message: 'Neautorizat' });
      }

      try {
        const { data: orders, error } = await supabase
          .from('orders')
          .select(`
            order_id,
            order_date,
            total_amount,
            status,
            tracking_number,
            user_id,
            payment_method
          `)
          .order('order_date', { ascending: false });

        if (error) {
          console.log('❌ Eroare Supabase orders:', error);
          return res.json({
            success: true,
            orders: ORDERS,
            source: 'dummy_data',
            error: 'Conexiune DB indisponibilă'
          });
        }

        return res.json({
          success: true,
          orders: orders || [],
          source: 'supabase',
          count: orders?.length || 0
        });
      } catch (error) {
        console.log('❌ Eroare catch orders:', error);
        return res.json({
          success: true,
          orders: ORDERS,
          source: 'dummy_data',
          error: error.message
        });
      }
    }

    // === Dashboard Stats ===
    if (path === 'stats' && method === 'GET') {
      if (!adminAuth(req)) {
        return res.status(401).json({ success: false, message: 'Neautorizat' });
      }

      try {
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
        } else {
          stats = {
            totalOrders: 1250,
            totalUsers: 850,
            totalRevenue: 125430,
            conversionRate: 15.8,
            source: 'dummy_data',
            error: 'Conexiune DB indisponibilă'
          };
        }

        return res.json({ success: true, stats });
      } catch (error) {
        console.log('❌ Eroare stats:', error);
        return res.json({
          success: true,
          stats: {
            totalOrders: 1250,
            totalUsers: 850,
            totalRevenue: 125430,
            conversionRate: 15.8,
            source: 'dummy_data',
            error: error.message
          }
        });
      }
    }

    // === Financial Data ===
    if (path === 'financial-data' && method === 'GET') {
      if (!adminAuth(req)) {
        return res.status(401).json({ success: false, message: 'Neautorizat' });
      }

      try {
        const { data: orders, error } = await supabase
          .from('orders')
          .select('total_amount, status, order_date');

        let financialData = {
          income: { paid: 0, unpaid: 0, overdue: 0 },
          tvaLimit: { revenue: 300000, remaining: 300000 },
          vatBalance: { balance: 0, sales: 0 },
          source: 'dummy_data'
        };

        if (!error && orders) {
          const currentYear = new Date().getFullYear();
          const currentYearOrders = orders.filter(order =>
            new Date(order.order_date).getFullYear() === currentYear
          );

          const paid = currentYearOrders
            .filter(o => o.status === 'completed')
            .reduce((sum, o) => sum + (o.total_amount || 0), 0);

          const unpaid = currentYearOrders
            .filter(o => o.status === 'pending')
            .reduce((sum, o) => sum + (o.total_amount || 0), 0);

          const totalRevenue = paid + unpaid;

          financialData = {
            income: {
              paid: Math.round(paid),
              unpaid: Math.round(unpaid),
              overdue: 0
            },
            tvaLimit: {
              revenue: 300000,
              remaining: Math.max(0, 300000 - totalRevenue)
            },
            vatBalance: {
              balance: Math.round(paid * 0.19),
              sales: Math.round(paid)
            },
            source: 'supabase'
          };
        } else {
          financialData = {
            income: { paid: 125430, unpaid: 25000, overdue: 5000 },
            tvaLimit: { revenue: 300000, remaining: 174570 },
            vatBalance: { balance: 23500, sales: 125430 },
            source: 'dummy_data',
            error: error?.message || 'Conexiune DB indisponibilă'
          };
        }

        return res.json({ success: true, data: financialData });
      } catch (error) {
        console.log('❌ Eroare financial-data:', error);
        return res.json({
          success: true,
          data: {
            income: { paid: 125430, unpaid: 25000, overdue: 5000 },
            tvaLimit: { revenue: 300000, remaining: 174570 },
            vatBalance: { balance: 23500, sales: 125430 },
            source: 'dummy_data',
            error: error.message
          }
        });
      }
    }

    // === Update Order Status ===
    if (path.match(/^orders\/\d+\/status$/) && method === 'PUT') {
      if (!adminAuth(req)) {
        return res.status(401).json({ success: false, message: 'Neautorizat' });
      }

      const orderId = path.split('/')[1];
      const { status } = body;

      if (!orderId || !status) {
        return res.status(400).json({
          success: false,
          message: 'ID și status sunt obligatorii'
        });
      }

      try {
        const { error } = await supabase
          .from('orders')
          .update({ status })
          .eq('order_id', orderId);

        if (error) {
          console.error('❌ Eroare update status:', error);
          return res.status(500).json({
            success: false,
            message: 'Eroare la actualizarea statusului',
            error: error.message
          });
        }

        // Send confirmation email if status is 'accepted'
        if (status === 'accepted') {
          const { data: orders, error: getError } = await supabase
            .from('orders')
            .select('user_email, order_id, total_amount')
            .eq('order_id', orderId)
            .limit(1);

          if (!getError && orders && orders.length > 0) {
            const order = orders[0];
            const mailOptions = {
              from: EMAIL_USER || 'your.email@gmail.com',
              to: order.user_email,
              subject: 'Confirmare comandă #' + order.order_id,
              text: `Comanda ta (#${order.order_id}) a fost acceptată! Total: ${order.total_amount} RON. Îți mulțumim pentru achiziție!`
            };

            if (transporter) {
              try {
                await transporter.sendMail(mailOptions);
              } catch (mailErr) {
                console.error('❌ Eroare trimitere email:', mailErr);
              }
            }
          }
        }

        return res.json({ success: true, message: 'Status actualizat cu succes' });
      } catch (err) {
        console.error('❌ Eroare catch update status:', err);
        return res.status(500).json({
          success: false,
          message: 'Eroare la actualizarea statusului',
          error: err.message
        });
      }
    }

    // === Backfill Orders ===
    if (path === 'backfill-orders' && method === 'POST') {
      if (!adminAuth(req)) {
        return res.status(401).json({ success: false, message: 'Neautorizat' });
      }

      try {
        console.log('🔧 Executând backfill orders...');

        return res.json({
          success: true,
          message: 'Actualizate 0 comenzi cu informații customer',
          updated: 0
        });
      } catch (error) {
        console.error('❌ Eroare backfill orders:', error);
        return res.status(500).json({
          success: false,
          message: 'Eroare la actualizarea comenzilor',
          error: error.message
        });
      }
    }

    // === 404 Not Found ===
    return res.status(404).json({
      success: false,
      message: `Endpoint not found: /api/${path}`,
      method
    });

  } catch (error) {
    console.error('❌ Eroare generală:', error);
    return res.status(500).json({
      success: false,
      message: 'Eroare internă a serverului',
      error: error.message
    });
  }
}
