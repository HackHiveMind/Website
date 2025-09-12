// Main JavaScript file for the website

// Navigation Scroll Effect
document.addEventListener('DOMContentLoaded', () => {
    try {
        const nav = document.getElementById('main-nav');
        if (!nav) {
            console.warn('Main navigation element not found');
            return;
        }

        let lastScrollY = window.scrollY;
        let ticking = false;

        const updateNavigation = () => {
            const currentScrollY = window.scrollY;
            const isScrolledDown = currentScrollY > lastScrollY;
            
            // Update navigation position
            nav.style.transform = isScrolledDown ? 'translateY(-100%)' : 'translateY(0)';
            
            // Update background opacity
            const scrollPercent = Math.min(currentScrollY / 100, 0.9);
            nav.style.backgroundColor = `rgba(255, 255, 255, ${scrollPercent + 0.5})`;
            
            lastScrollY = currentScrollY;
            ticking = false;
        };

        // Throttle scroll events
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    updateNavigation();
                    ticking = false;
                });
                ticking = true;
            }
        });

        // Initialize navigation state
        updateNavigation();
    } catch (error) {
        console.error('Error initializing navigation:', error);
    }
});

// Smooth Scroll for Navigation
document.addEventListener('DOMContentLoaded', () => {
    try {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                
                const href = this.getAttribute('href');
                if (href === '#') return;
                
                const target = document.querySelector(href);
                if (!target) {
                    console.warn(`Target element ${href} not found`);
                    return;
                }
                
                const navHeight = document.querySelector('.nav-wrapper')?.offsetHeight || 0;
                const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Update URL without page reload
                history.pushState(null, '', href);
            });
        });
    } catch (error) {
        console.error('Error initializing smooth scroll:', error);
    }
});

// Cart Class - Singleton Pattern
class Cart {
    constructor() {
        if (Cart.instance) {
            return Cart.instance;
        }
        
        // Initialize cart
        this.items = this.loadCartFromStorage();
        this.cartCount = document.querySelector('.cart-count');
        this.initializeCartUI();
        this.updateCartUI();
        
        // Subscribe to events
        this.setupEventListeners();
        
        Cart.instance = this;
        return Cart.instance;
    }
    
    loadCartFromStorage() {
        try {
            const storedCart = localStorage.getItem('cart');
            return storedCart ? JSON.parse(storedCart) : [];
        } catch (error) {
            console.error('Error loading cart from storage:', error);
            this.showErrorMessage('Failed to load cart. Please refresh the page.');
            return [];
        }
    }
    
    saveToStorage() {
        try {
            localStorage.setItem('cart', JSON.stringify(this.items));
            this.updateCartUI();
            // Dispatch custom event for cart updates
            window.dispatchEvent(new CustomEvent('cartUpdate', { detail: this.items }));
        } catch (error) {
            console.error('Error saving cart to storage:', error);
            this.showErrorMessage('Failed to save cart. Please try again.');
        }
    }
    
    initializeCartUI() {
        // Try to find nav-links first
        let nav = document.querySelector('.nav-links');
        
        // If nav-links doesn't exist, try to find main-nav
        if (!nav) {
            nav = document.querySelector('#main-nav');
            if (!nav) {
                console.error('Navigation element not found. Creating fallback navigation.');
                // Create fallback navigation
                nav = document.createElement('nav');
                nav.className = 'nav-links';
                document.body.insertBefore(nav, document.body.firstChild);
            }
        }
        
        try {
            // Remove existing cart button if it exists
            const existingCartBtn = document.querySelector('.cart-button');
            if (existingCartBtn) {
                existingCartBtn.remove();
            }
            
            const cartBtn = document.createElement('a');
            cartBtn.href = 'checkout.html';
            cartBtn.className = 'cart-button';
            cartBtn.setAttribute('aria-label', 'Shopping cart');
            cartBtn.innerHTML = `
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
                </svg>
                <span class="cart-count">0</span>
            `;
            
            // Add some basic styles if they don't exist
            if (!document.querySelector('#cart-styles')) {
                const style = document.createElement('style');
                style.id = 'cart-styles';
                style.textContent = `
                    .nav-links, #main-nav {
                        display: flex;
                        align-items: center;
                        gap: 36px;
                        padding: 18px 32px 18px 32px;
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                        font-weight: 400;
                        font-size: 18px;
                        letter-spacing: 0.01em;
                    }
                    .nav-links a, #main-nav a {
                        color: #222;
                        text-decoration: none;
                        padding: 0 8px;
                        transition: color 0.2s;
                        position: relative;
                        font-weight: 400;
                    }
                    .nav-links a:hover, #main-nav a:hover {
                        color: #0071e3;
                    }
                    .cart-button {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        width: 48px;
                        height: 48px;
                        border-radius: 50%;
                        background: transparent;
                        position: relative;
                        transition: background 0.2s, box-shadow 0.2s;
                        box-shadow: none;
                        margin-left: 12px;
                    }
                    .cart-button:hover, .cart-button:focus, .cart-button:not(.empty) {
                        background: #0071e3;
                        box-shadow: 0 2px 8px rgba(0,113,227,0.10);
                    }
                    .cart-button svg {
                        width: 28px;
                        height: 28px;
                        fill: #222;
                        transition: fill 0.2s;
                    }
                    .cart-button:hover svg, .cart-button:focus svg, .cart-button:not(.empty) svg {
                        fill: #fff;
                    }
                    .cart-count {
                        position: absolute;
                        top: 6px;
                        right: 6px;
                        background: #e30000;
                        color: #fff;
                        border-radius: 50%;
                        min-width: 20px;
                        height: 20px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 13px;
                        font-weight: 600;
                        box-shadow: 0 1px 4px rgba(0,0,0,0.10);
                        border: 2px solid #fff;
                        z-index: 2;
                        padding: 0 5px;
                        line-height: 1;
                        transition: background 0.2s;
                    }
                    .cart-count[style*='none'] { display: none !important; }
                `;
                document.head.appendChild(style);
            }
            
            nav.appendChild(cartBtn);
            
            // Update cart count reference
            this.cartCount = cartBtn.querySelector('.cart-count');
            
            // Update cart count
            this.updateCartUI();
            
            // Add click event listener
            cartBtn.addEventListener('click', (e) => {
                if (this.items.length === 0) {
                    e.preventDefault();
                    this.showErrorMessage('Your cart is empty');
                }
            });
            
            console.log('Cart button initialized successfully');
        } catch (error) {
            console.error('Error creating cart button:', error);
        }
    }
    
    updateCartUI() {
        if (!this.cartCount) {
            this.cartCount = document.querySelector('.cart-count');
            if (!this.cartCount) {
                console.warn('Cart count element not found');
                return;
            }
        }
        
        try {
            const totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
            this.cartCount.textContent = totalItems;
            this.cartCount.style.display = totalItems > 0 ? 'block' : 'none';
            
            // Update cart button state
            const cartBtn = document.querySelector('.cart-button');
            if (cartBtn) {
                cartBtn.classList.toggle('empty', totalItems === 0);
            }
        } catch (error) {
            console.error('Error updating cart UI:', error);
        }
    }
    
    addItem(product) {
        try {
            // Validate product data
            if (!product || !product.id || !product.name) {
                throw new Error('Invalid product data');
            }
            
            // Convert price to number
            const price = typeof product.price === 'string' 
                ? parseFloat(product.price) 
                : product.price;
                
            const existingItem = this.items.find(item => item.id === product.id);
            
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                this.items.push({
                    id: product.id,
                    name: product.name,
                    price: price,
                    image: product.image || '',
                    description: product.description || '',
                    quantity: 1
                });
            }
            
            this.saveToStorage();
            this.showSuccessMessage(`${product.name} added to cart!`);
        } catch (error) {
            console.error('Error adding item to cart:', error);
            this.showErrorMessage('Failed to add item to cart. Please try again.');
        }
    }
    
    removeItem(productId) {
        try {
            this.items = this.items.filter(item => item.id !== productId);
            this.saveToStorage();
        } catch (error) {
            console.error('Error removing item from cart:', error);
            this.showErrorMessage('Failed to remove item from cart. Please try again.');
        }
    }
    
    clearCart() {
        try {
            this.items = [];
            this.saveToStorage();
        } catch (error) {
            console.error('Error clearing cart:', error);
            this.showErrorMessage('Failed to clear cart. Please try again.');
        }
    }
    
    showSuccessMessage(message) {
        const existingMessage = document.querySelector('.success-message');
        if (existingMessage) existingMessage.remove();
        
        const messageElement = document.createElement('div');
        messageElement.className = 'success-message slide-up';
        messageElement.setAttribute('role', 'alert');
        messageElement.innerHTML = `
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7 19.6 5.6 9 16.2z"/>
            </svg>
            <p>${message}</p>
        `;
        
        document.body.appendChild(messageElement);
        
        setTimeout(() => {
            if (messageElement && messageElement.parentNode) {
                messageElement.classList.add('fade-out');
                setTimeout(() => messageElement.remove(), 300);
            }
        }, 3000);
    }
    
    showErrorMessage(message) {
        const existingMessage = document.querySelector('.error-message');
        if (existingMessage) existingMessage.remove();
        
        const messageElement = document.createElement('div');
        messageElement.className = 'error-message slide-up';
        messageElement.setAttribute('role', 'alert');
        messageElement.innerHTML = `
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            <p>${message}</p>
        `;
        
        document.body.appendChild(messageElement);
        
        setTimeout(() => {
            if (messageElement && messageElement.parentNode) {
                messageElement.classList.add('fade-out');
                setTimeout(() => messageElement.remove(), 300);
            }
        }, 5000);
    }
    
    setupEventListeners() {
        // Update cart counter when cart is modified
        window.addEventListener('cartUpdate', (e) => {
            this.updateCartUI();
        });
    }
}

// Dynamic Product Loader
class ProductLoader {
    constructor() {
        this.products = [];
        this.loading = false;
        this.page = 1;
        this.hasLoadedAll = false;
        this.container = document.getElementById('products-container');
        this.currentSort = 'default';
        
        if (!this.container) {
            console.warn('Products container not found');
            return;
        }
        
        this.init();
    }
    
    init() {
        this.loadProducts();
        this.setupInfiniteScroll();
        this.setupSortFunctionality();
    }
    
    async loadProducts() {
        try {
            if (this.loading || this.hasLoadedAll) return;
            this.loading = true;
            
            // Show loading state
            if (this.products.length === 0) {
                this.showLoadingState();
            }
            
            const response = await this.fetchProducts(this.page);
            
            if (!response || response.length === 0) {
                this.hasLoadedAll = true;
                this.showEndOfContent();
                return;
            }
            
            this.products = [...this.products, ...response];
            this.renderProducts(this.products);
            this.page++;
        } catch (error) {
            console.error('Error loading products:', error);
            this.showErrorState();
        } finally {
            this.loading = false;
        }
    }
    
    async fetchProducts(page) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve([
                    {
                        id: `product-${page}-1`,
                        name: 'iPhone 15 Pro Max',
                        price: 1199,
                        image: 'https://placehold.co/600x400/f5f5f7/1d1d1f?text=iPhone+15+Pro+Max ',
                        description: 'Titanium. Strong. Light. Pro.'
                    },
                    {
                        id: `product-${page}-2`,
                        name: 'AirPods Pro (4th generation)',
                        price: 249,
                        image: 'https://placehold.co/600x400/f5f5f7/1d1d1f?text=AirPods+Pro ',
                        description: 'Adaptive Audio. Now playing.'
                    },
                    {
                        id: `product-${page}-3`,
                        name: 'iPad Pro',
                        price: 799,
                        image: 'https://placehold.co/600x400/f5f5f7/1d1d1f?text=iPad+Pro ',
                        description: 'Supercharged by M2 chip.'
                    }
                ]);
            }, 1000);
        });
    }
    
    showLoadingState() {
        if (!this.container) return;
        
        this.container.innerHTML = `
            <div class="loading-message">
                <svg class="spinner" viewBox="0 0 50 50">
                    <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
                </svg>
                <p>Loading products...</p>
            </div>
        `;
    }
    
    showErrorState() {
        if (!this.container) return;
        
        this.container.innerHTML = `
            <div class="error-message" role="alert">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
                <p>Failed to load products. Please refresh the page.</p>
            </div>
        `;
    }
    
    showEndOfContent() {
        if (!this.container) return;
        
        const endMessage = document.createElement('div');
        endMessage.className = 'loading-message';
        endMessage.innerHTML = `
            <p>You've reached the end of the product list</p>
        `;
        
        this.container.appendChild(endMessage);
    }
    
    renderProducts(products) {
        if (!this.container) return;
        
        // Clear loading message on first page
        if (this.page === 1) {
            this.container.innerHTML = '';
        }
        
        // Sort products if needed
        let sortedProducts = [...products];
        switch (this.currentSort) {
            case 'price-low':
                sortedProducts.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                sortedProducts.sort((a, b) => b.price - a.price);
                break;
            case 'name':
                sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
                break;
            default:
                // Keep default order
                break;
        }
        
        // Render products
        sortedProducts.forEach(product => {
            const productElement = this.createProductElement(product);
            this.container.appendChild(productElement);
        });
    }
    
    createProductElement(product) {
        const element = document.createElement('div');
        element.className = 'grid-item';
        element.setAttribute('data-product-id', product.id);
        element.innerHTML = `
            <div class="product-card" role="article" aria-labelledby="product-title-${product.id}">
                <div class="product-card-inner">
                    <img src="${product.image}" alt="${product.description || product.name}" 
                         class="product-image" loading="lazy" decoding="async">
                    <div class="product-info">
                        <h3 id="product-title-${product.id}" class="product-item-name">${product.name}</h3>
                        <p class="product-description">${product.description}</p>
                        <p class="product-price" aria-label="Price">${this.formatPrice(product.price)}</p>
                        <button class="add-to-cart" data-product-id="${product.id}" aria-label="Add ${product.name} to cart">
                            Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Add click event for add to cart
        const addToCartBtn = element.querySelector('.add-to-cart');
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // Get the cart instance
                const cart = window.cart || new Cart();
                
                // Add the product to cart
                cart.addItem({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.image,
                    description: product.description
                });
                
                // Add visual feedback
                addToCartBtn.classList.add('added');
                setTimeout(() => {
                    addToCartBtn.classList.remove('added');
                }, 1000);
            });
        }
        
        return element;
    }
    
    setupSortFunctionality() {
        const sortSelect = document.getElementById('sort-products');
        if (!sortSelect) return;
        
        sortSelect.addEventListener('change', (e) => {
            this.currentSort = e.target.value;
            this.container.innerHTML = '';
            this.renderProducts(this.products);
            
            // Reset page counter
            this.page = 1;
            this.hasLoadedAll = false;
        });
    }
    
    formatPrice(price) {
        return `$${parseFloat(price).toFixed(2)}`;
    }
    
    setupInfiniteScroll() {
        const infiniteScroll = () => {
            if (!this.container || this.hasLoadedAll) return;
            
            const { bottom } = this.container.getBoundingClientRect();
            if (bottom < window.innerHeight + 100) {
                this.loadProducts();
            }
        };
        
        // Initial check
        infiniteScroll();
        
        // Scroll listener
        window.addEventListener('scroll', () => {
            if (!this.container || this.hasLoadedAll) return;
            
            const { bottom } = this.container.getBoundingClientRect();
            if (bottom < window.innerHeight + 100) {
                this.loadProducts();
            }
        });
    }
}

// Product Sorting Functionality
function initializeProductSorting() {
    const sortSelect = document.getElementById('sort-products');
    if (!sortSelect) return;
    
    sortSelect.addEventListener('change', (e) => {
        const loader = new ProductLoader();
        const sortValue = e.target.value;
        
        // Sort products based on selected value
        switch (sortValue) {
            case 'price-low':
                loader.products.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                loader.products.sort((a, b) => b.price - a.price);
                break;
            case 'name':
                loader.products.sort((a, b) => a.name.localeCompare(b.name));
                break;
            default:
                // Keep default order
                break;
        }
        
        // Re-render products
        const container = document.getElementById('products-container');
        if (container) {
            container.innerHTML = '';
            loader.products.forEach(product => {
                const productElement = loader.createProductElement(product);
                container.appendChild(productElement);
            });
        }
    });
}

// Initialize Cart
const initializeCart = () => {
    try {
        const cart = new Cart();
        window.cart = cart; // Make cart globally accessible
        return cart;
    } catch (error) {
        console.error('Critical error initializing cart:', error);
        const container = document.querySelector('.products-container');
        if (container) {
            container.innerHTML = `
                <div class="error-message">
                    <p>Cart cannot be initialized. Please try again later.</p>
                </div>
            `;
        }
        return null;
    }
};

// Initialize Product Loader
const initializeProductLoader = () => {
    try {
        const productLoader = new ProductLoader();
        window.productLoader = productLoader;
        initializeProductSorting();
        return productLoader;
    } catch (error) {
        console.error('Critical error initializing product loader:', error);
        const container = document.querySelector('.products-container');
        if (container) {
            container.innerHTML = `
                <div class="error-message">
                    <p>Products cannot be loaded. Please refresh the page.</p>
                </div>
            `;
        }
        return null;
    }
};

// Intersection Observer for Animations
document.addEventListener('DOMContentLoaded', () => {
    try {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target); // Animație o singură dată
                }
            });
        }, observerOptions);

        // Observe all animated elements
        const animatedElements = document.querySelectorAll(
            '.product-card, .feature, .scroll-reveal, .fade-in, .slide-up'
        );
        
        if (animatedElements.length === 0) {
            console.warn('No animated elements found');
        }
        
        animatedElements.forEach(el => observer.observe(el));
    } catch (error) {
        console.error('Error initializing intersection observer:', error);
    }
});

// Initialize everything
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Initialize cart first
        const cart = initializeCart();
        window.cart = cart; // Make cart globally accessible
        
        // Initialize product loader after cart
        const productLoader = initializeProductLoader();
        window.productLoader = productLoader;
        
        // Initialize animations
        initializeProductSorting();
        
        // Debug
        console.log('Main script loaded successfully');
        console.log('Cart initialized:', !!cart);
        console.log('Product loader initialized:', !!productLoader);
    } catch (error) {
        console.error('Critical error in DOMContentLoaded:', error);
    }
});