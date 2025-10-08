const fs = require('fs');
const path = require('path');

// Testează fișierele HTML
describe('Frontend HTML Files', () => {
  
  test('should have store.html with proper structure', () => {
    const storePath = path.join(__dirname, '../frontend/store.html');
    const storeContent = fs.readFileSync(storePath, 'utf8');
    
    // Verifică că fișierul există și are conținut
    expect(storeContent).toBeDefined();
    expect(storeContent.length).toBeGreaterThan(0);
    
    // Verifică structura HTML
    expect(storeContent).toContain('<!DOCTYPE html>');
    expect(storeContent).toContain('<html');
    expect(storeContent).toContain('<head>');
    expect(storeContent).toContain('<body>');
    expect(storeContent).toContain('</html>');
    
    // Verifică că are linkuri către CSS și JS
    expect(storeContent).toContain('.css');
    expect(storeContent).toContain('.js');
  });

  test('should have checkout.html with proper structure', () => {
    const checkoutPath = path.join(__dirname, '../frontend/checkout.html');
    const checkoutContent = fs.readFileSync(checkoutPath, 'utf8');
    
    expect(checkoutContent).toBeDefined();
    expect(checkoutContent.length).toBeGreaterThan(0);
    
    // Verifică elementele specifice checkout-ului
    expect(checkoutContent).toContain('checkout');
    expect(checkoutContent).toContain('form');
    expect(checkoutContent).toContain('input');
  });

  test('should have product.html with proper structure', () => {
    const productPath = path.join(__dirname, '../frontend/product.html');
    const productContent = fs.readFileSync(productPath, 'utf8');
    
    expect(productContent).toBeDefined();
    expect(productContent.length).toBeGreaterThan(0);
    
    // Verifică elementele specifice produsului
    expect(productContent).toContain('product');
  });
});

// Testează fișierele CSS
describe('Frontend CSS Files', () => {
  
  test('should have main.css with proper styles', () => {
    const mainCssPath = path.join(__dirname, '../frontend/styles/main.css');
    const mainCssContent = fs.readFileSync(mainCssPath, 'utf8');
    
    expect(mainCssContent).toBeDefined();
    expect(mainCssContent.length).toBeGreaterThan(0);
    
    // Verifică că are reguli CSS
    expect(mainCssContent).toContain('{');
    expect(mainCssContent).toContain('}');
  });

  test('should have checkout.css with proper styles', () => {
    const checkoutCssPath = path.join(__dirname, '../frontend/styles/checkout.css');
    const checkoutCssContent = fs.readFileSync(checkoutCssPath, 'utf8');
    
    expect(checkoutCssContent).toBeDefined();
    expect(checkoutCssContent.length).toBeGreaterThan(0);
    
    // Verifică că are reguli CSS
    expect(checkoutCssContent).toContain('{');
    expect(checkoutCssContent).toContain('}');
  });
});

// Testează fișierele JavaScript
describe('Frontend JavaScript Files', () => {
  
  test('should have storeScript.js with proper functions', () => {
    const storeScriptPath = path.join(__dirname, '../frontend/scripts/storeScript.js');
    const storeScriptContent = fs.readFileSync(storeScriptPath, 'utf8');
    
    expect(storeScriptContent).toBeDefined();
    expect(storeScriptContent.length).toBeGreaterThan(0);
    
    // Verifică că are funcții JavaScript
    expect(storeScriptContent).toContain('function');
    expect(storeScriptContent).toContain('(');
    expect(storeScriptContent).toContain(')');
  });

  test('should have checkout.js with proper functions', () => {
    const checkoutScriptPath = path.join(__dirname, '../frontend/scripts/checkout.js');
    const checkoutScriptContent = fs.readFileSync(checkoutScriptPath, 'utf8');
    
    expect(checkoutScriptContent).toBeDefined();
    expect(checkoutScriptContent.length).toBeGreaterThan(0);
    
    // Verifică că are funcții JavaScript
    expect(checkoutScriptContent).toContain('function');
  });

  test('should have main.js with proper functions', () => {
    const mainScriptPath = path.join(__dirname, '../frontend/scripts/main.js');
    const mainScriptContent = fs.readFileSync(mainScriptPath, 'utf8');
    
    expect(mainScriptContent).toBeDefined();
    expect(mainScriptContent.length).toBeGreaterThan(0);
    
    // Verifică că are funcții JavaScript
    expect(mainScriptContent).toContain('function');
  });
});

// Testează structura proiectului
describe('Project Structure', () => {
  
  test('should have required directories', () => {
    const frontendDir = path.join(__dirname, '../frontend');
    const backendDir = path.join(__dirname, '../backend');
    const testsDir = path.join(__dirname, '../__tests__');
    
    expect(fs.existsSync(frontendDir)).toBe(true);
    expect(fs.existsSync(backendDir)).toBe(true);
    expect(fs.existsSync(testsDir)).toBe(true);
  });

  test('should have required files', () => {
    const packageJsonPath = path.join(__dirname, '../package.json');
    const serverJsPath = path.join(__dirname, '../backend/server.js');
    const jestConfigPath = path.join(__dirname, '../jest.config.js');
    
    expect(fs.existsSync(packageJsonPath)).toBe(true);
    expect(fs.existsSync(serverJsPath)).toBe(true);
    expect(fs.existsSync(jestConfigPath)).toBe(true);
  });
});
