// Configurare globală pentru Jest
process.env.NODE_ENV = 'test';

// Polyfills pentru testele JSDOM
if (typeof global.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

// Polyfill pentru fetch (necesar pentru jsdom)
if (typeof global.fetch !== 'function') {
  global.fetch = require('node-fetch');
  global.Headers = require('node-fetch').Headers;
  global.Request = require('node-fetch').Request;
  global.Response = require('node-fetch').Response;
}

// Polyfill pentru crypto (necesar pentru testele admin)
if (typeof global.crypto === 'undefined') {
  global.crypto = require('crypto').webcrypto || require('crypto');
}

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
