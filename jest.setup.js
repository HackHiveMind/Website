// Configurare globală pentru Jest
process.env.NODE_ENV = 'test';

// Încarcă .env sau .env.example dacă variabilele lipsesc
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  const fs = require('fs');
  const path = require('path');
  const dotenv = require('dotenv');

  const envPath = path.join(__dirname, '.env');
  const examplePath = path.join(__dirname, '.env.example');
  const targetPath = fs.existsSync(envPath) ? envPath : examplePath;

  if (fs.existsSync(targetPath)) {
    dotenv.config({ path: targetPath });
  }
}

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

// Mock pentru Supabase (doar când este cerut explicit)
if (process.env.SUPABASE_MOCK === 'true') {
  jest.doMock('@supabase/supabase-js', () => ({
    createClient: jest.fn(() => ({
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ data: null, error: null }))
          })),
          limit: jest.fn(() => Promise.resolve({ data: [], error: null })),
          not: jest.fn(() => ({
            limit: jest.fn(() => Promise.resolve({ data: [], error: null }))
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
}
