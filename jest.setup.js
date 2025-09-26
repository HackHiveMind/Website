// Configurare globală pentru Jest
process.env.NODE_ENV = 'test';

// Mock pentru Supabase (pentru testele care nu necesită conexiune reală)
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null }))
        }))
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: { order_id: 1 }, error: null }))
        }))
      }))
    }))
  }))
}));
