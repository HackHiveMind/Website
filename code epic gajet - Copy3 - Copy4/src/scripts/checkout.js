class CheckoutManager {
    constructor() {
        this.cart = this.getCartFromStorage();
        this.subtotal = 0;
        this.shipping = 0;
        this.tax = 0;
        this.total = 0;
        this.currentStep = 'cart';
        this.paymentMethod = 'apple-pay';
        this.formData = {};
        this.init();
    }

    getCartFromStorage() {
        try {
            const storedCart = localStorage.getItem('cart');
            return storedCart ? JSON.parse(storedCart) : [];
        } catch (error) {
            console.error('Error loading cart from storage:', error);
            this.showErrorMessage('Failed to load cart. Please refresh the page.');
            return [];
        }
    }

    init() {
        // Verificare DOM ready state
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupCheckout());
        } else {
            this.setupCheckout();
        }
    }

    setupCheckout() {
        try {
            this.renderCartItems();
            this.calculateTotals();
            this.initializeFormValidation();
            this.initializePaymentMethods();
            this.initializeEventListeners();
            
            // Setare pas inițial
            if (this.cart.length > 0) {
                this.showStep('cart');
            } else {
                this.showStep('shipping');
            }
        } catch (error) {
            console.error('Checkout initialization error:', error);
            this.showErrorMessage('Checkout initialization failed. Please try again.');
        }
    }

    renderCartItems() {
        const cartContainer = document.getElementById('cart-items');
        if (!cartContainer) return;
        
        if (this.cart.length === 0) {
            cartContainer.innerHTML = `
                <div class="empty-cart">
                    <p>Your cart is empty</p>
                    <a href="index.html" class="btn btn-primary">Continue Shopping</a>
                </div>
            `;
            return;
        }

        try {
            cartContainer.innerHTML = this.cart.map(item => `
                <div class="cart-item fade-in" data-item-id="${item.id || ''}">
                    <img src="${item.image || '#'}" alt="${item.name || 'Product image'}" class="cart-item-image" loading="lazy">
                    <div class="cart-item-details">
                        <h4 class="cart-item-name">${item.name || 'Unnamed product'}</h4>
                        <p class="cart-item-price">$${(item.price || 0).toFixed(2)}</p>
                        <p class="cart-item-quantity">Quantity: ${item.quantity || 1}</p>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error('Error rendering cart items:', error);
            cartContainer.innerHTML = `
                <div class="error-message">
                    <p>Failed to load cart items. Please try again.</p>
                </div>
            `;
        }
    }

    calculateTotals() {
        // Calcul subtotal cu validare
        this.subtotal = this.cart.reduce((sum, item) => {
            const price = parseFloat(item.price) || 0;
            const quantity = parseInt(item.quantity) || 0;
            return sum + (price * quantity);
        }, 0);

        // Calcul shipping
        this.shipping = this.subtotal > 0 ? 10 : 0;

        // Calcul taxă dinamică
        this.tax = this.subtotal * this.getTaxRate();

        // Calcul total
        this.total = this.subtotal + this.shipping + this.tax;
        
        this.updateTotalsDisplay();
    }

    getTaxRate() {
        // Poate fi extins pentru taxe regionale
        return 0.08; // 8% implicit
    }

    updateTotalsDisplay() {
        const updateElement = (id, value) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = `$${parseFloat(value).toFixed(2)}`;
            }
        };

        updateElement('subtotal', this.subtotal);
        updateElement('shipping', this.shipping);
        updateElement('tax', this.tax);
        updateElement('total', this.total);
    }

    initializeFormValidation() {
        const inputs = document.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('input', () => this.validateInput(input));
            input.addEventListener('blur', () => this.validateInput(input));
            input.addEventListener('invalid', (e) => {
                e.preventDefault();
                this.validateInput(input);
            });
        });
    }

    validateInput(input) {
        if (!input) return true;
        
        // Sări peste validarea câmpurilor dezactivate
        if (input.disabled) return true;

        const isValid = input.checkValidity();
        input.classList.toggle('invalid', !isValid);
        
        // Formatare specială pentru câmpuri specifice
        switch (input.id) {
            case 'cardNumber':
                input.value = this.formatCardNumber(input.value);
                break;
            case 'expiryDate':
                input.value = this.formatExpiryDate(input.value);
                break;
            case 'cvv':
                input.value = this.formatCVV(input.value);
                break;
            case 'zipCode':
                input.value = input.value.replace(/\D/g, '').substr(0, 5);
                break;
        }

        // Stocare valori valide
        if (isValid) {
            this.formData[input.id] = input.value;
        }

        // Actualizare mesaj de eroare
        this.updateErrorMessage(input, isValid);
        
        return isValid;
    }

    updateErrorMessage(input, isValid) {
        const errorContainer = input.closest('.form-group');
        if (!errorContainer) return;
        
        const errorMessage = errorContainer.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.style.display = isValid ? 'none' : 'block';
        }
    }

    validateStep(step) {
        const stepElement = document.querySelector(`[data-step="${step}"]`);
        if (!stepElement) return true;
        
        let isValid = true;
        const inputs = stepElement.querySelectorAll('input:not([disabled]), select:not([disabled])');
        
        inputs.forEach(input => {
            if (!this.validateInput(input)) {
                isValid = false;
                input.classList.add('shake');
                setTimeout(() => input.classList.remove('shake'), 600);
            }
        });
        
        return isValid;
    }

    formatCardNumber(value) {
        const cleaned = value.replace(/\D/g, '');
        const matches = cleaned.match(/(\d{4})/g);
        return matches ? matches.join(' ') : cleaned;
    }

    formatExpiryDate(value) {
        const cleaned = value.replace(/\D/g, '');
        if (cleaned.length >= 2) {
            return cleaned.substr(0, 2) + (cleaned.length > 2 ? '/' + cleaned.substr(2, 2) : '');
        }
        return cleaned;
    }

    formatCVV(value) {
        return value.replace(/\D/g, '').substr(0, 3);
    }

    initializePaymentMethods() {
        const methods = document.querySelectorAll('.payment-method');
        methods.forEach(method => {
            method.addEventListener('click', () => {
                methods.forEach(m => m.classList.remove('active'));
                method.classList.add('active');
                this.paymentMethod = method.dataset.method;
                this.toggleCreditCardForm();
            });
        });
        this.toggleCreditCardForm();
    }

    toggleCreditCardForm() {
        const creditCardForm = document.querySelector('.credit-card-form');
        if (!creditCardForm) return;
        
        creditCardForm.style.display = 
            this.paymentMethod === 'credit-card' ? 'block' : 'none';
            
        const cardFields = creditCardForm.querySelectorAll('input');
        cardFields.forEach(field => {
            field.disabled = this.paymentMethod !== 'credit-card';
            if (this.paymentMethod !== 'credit-card') {
                field.value = '';
                field.classList.remove('invalid');
            }
        });
    }

    initializeEventListeners() {
        const placeOrderButton = document.getElementById('place-order');
        if (placeOrderButton) {
            placeOrderButton.addEventListener('click', () => this.handlePlaceOrder());
        }
        
        document.querySelectorAll('.step').forEach(step => {
            step.addEventListener('click', (e) => {
                e.preventDefault();
                const targetStep = step.dataset.step;
                if (this.validateStep(this.currentStep)) {
                    this.navigateToStep(targetStep);
                }
            });
        });
    }

    showStep(step) {
        const sections = document.querySelectorAll('.form-section');
        sections.forEach(section => {
            if (section.dataset.step === step) {
                section.style.display = 'block';
                section.classList.add('fade-in');
            } else {
                section.style.display = 'none';
                section.classList.remove('fade-in');
            }
        });
        
        this.currentStep = step;
        this.updateStepIndicator();
    }

    navigateToStep(step) {
        const steps = ['cart', 'shipping', 'payment'];
        const currentIndex = steps.indexOf(this.currentStep);
        const targetIndex = steps.indexOf(step);
        
        if (targetIndex > currentIndex && !this.validateStep(this.currentStep)) {
            return;
        }
        
        this.showStep(step);
        steps.forEach((s, index) => {
            const stepElement = document.querySelector(`[data-step="${s}"]`);
            if (stepElement) {
                stepElement.classList.toggle('completed', index < targetIndex);
            }
        });
    }

    updateStepIndicator() {
        document.querySelectorAll('.step').forEach(step => {
            step.classList.toggle('active', step.dataset.step === this.currentStep);
        });
    }

    async handlePlaceOrder() {
        if (!this.validateStep('payment')) return;
        
        const placeOrderButton = document.getElementById('place-order');
        if (!placeOrderButton) return;
        
        placeOrderButton.disabled = true;
        placeOrderButton.innerHTML = `
            <span class="loading-spinner"></span>
            Processing...
        `;
        
        try {
            if (this.cart.length === 0) {
                throw new Error('Your cart is empty');
            }
            
            await this.processPayment();
            
            const orderData = {
                items: this.cart,
                shipping: this.formData,
                payment: {
                    method: this.paymentMethod,
                    total: this.total
                },
                date: new Date().toISOString()
            };
            
            await this.createOrder(orderData);
            
            this.showSuccessMessage();
            
            // Curățare stocare locală
            try {
                localStorage.removeItem('cart');
                localStorage.setItem('lastOrder', JSON.stringify(orderData));
            } catch (storageError) {
                console.error('Error updating storage:', storageError);
            }
            
            setTimeout(() => {
                window.location.href = 'order-confirmation.html';
            }, 2000);
        } catch (error) {
            console.error('Order placement error:', error);
            this.showErrorMessage(error.message);
            placeOrderButton.disabled = false;
            placeOrderButton.textContent = 'Place Order';
        }
    }

    async processPayment() {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                Math.random() > 0.1 
                    ? resolve() 
                    : reject(new Error('Payment declined. Please try another method.'));
            }, 1500);
        });
    }

    async createOrder(orderData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    orderId: Math.floor(Math.random() * 1000000),
                    ...orderData
                });
            }, 500);
        });
    }

    showSuccessMessage() {
        const message = document.createElement('div');
        message.className = 'success-message slide-up';
        message.setAttribute('role', 'alert');
        message.innerHTML = `
            <svg aria-hidden="true" viewBox="0 0 24 24">
                <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7 19.6 5.6 9 16.2z"/>
            </svg>
            <p>Order placed successfully!</p>
        `;
        
        // Adăugare mesaj în DOM
        document.body.appendChild(message);
        
        // Curățare după 5 secunde
        setTimeout(() => {
            if (message && message.parentNode) {
                message.parentNode.removeChild(message);
            }
        }, 5000);
    }

    showErrorMessage(error) {
        const message = document.createElement('div');
        message.className = 'error-message slide-up';
        message.setAttribute('role', 'alert');
        message.innerHTML = `
            <svg aria-hidden="true" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            <p>${error}</p>
        `;
        
        // Adăugare mesaj în DOM
        document.body.appendChild(message);
        
        // Curățare după 5 secunde
        setTimeout(() => {
            if (message && message.parentNode) {
                message.parentNode.removeChild(message);
            }
        }, 5000);
    }

    // Metodă extensibilă pentru taxe regionale
    getTaxRate() {
        // Poate fi extinsă pentru calculul taxelor bazat pe locație
        return 0.08; // 8% implicit
    }

    // Metodă extensibilă pentru integrare API
    async sendToServer(endpoint, data) {
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) throw new Error('Network response was not ok');
            
            return await response.json();
        } catch (error) {
            console.error('Server error:', error);
            throw error;
        }
    }

    async initializeApplePay() {
        if (!window.ApplePaySession || !ApplePaySession.canMakePayments()) {
            document.getElementById('apple-pay-button').style.display = 'none';
            return;
        }

        const paymentRequest = {
            countryCode: 'US',
            currencyCode: 'USD',
            supportedNetworks: ['visa', 'masterCard', 'amex'],
            merchantCapabilities: ['supports3DS'],
            total: {
                label: 'Your Store Name',
                amount: this.total.toString()
            }
        };

        const session = new ApplePaySession(3, paymentRequest);

        session.onpaymentauthorized = (event) => {
            // Procesează plata
            session.completePayment(ApplePaySession.STATUS_SUCCESS);
        };

        session.onpaymentmethodselected = (event) => {
            session.completePaymentMethodSelection(paymentRequest);
        };

        session.onmerchantvalidation = (event) => {
            // Validează comerciantul
            session.completeMerchantValidation({
                merchantSessionIdentifier: 'merchant.com.yourstore',
                nonce: 'nonce',
                merchantIdentifier: 'merchant.com.yourstore',
                domainName: 'yourstore.com',
                displayName: 'Your Store Name'
            });
        };

        document.getElementById('apple-pay-button').addEventListener('click', () => {
            session.begin();
        });
    }
}

// Inițializare sigură
try {
    window.checkoutManager = new CheckoutManager();
} catch (error) {
    console.error('Critical checkout error:', error);
    const checkoutContainer = document.querySelector('.checkout-container');
    if (checkoutContainer) {
        checkoutContainer.innerHTML = `
            <div class="error-message">
                <p>Checkout cannot be initialized. Please try again later.</p>
            </div>
        `;
    }
}