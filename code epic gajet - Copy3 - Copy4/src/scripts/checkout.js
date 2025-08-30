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
        this.orderHistory = [];
        this.init();
    }

    getCartFromStorage() {
        try {
            const storedCart = localStorage.getItem('cart');
            return storedCart ? JSON.parse(storedCart) : [];
        } catch (error) {
            console.error('Eroare la încărcarea coșului:', error);
            this.showErrorMessage('Nu s-a putut încărca coșul. Vă rugăm să reîncărcați pagina.');
            return [];
        }
    }

    init() {
        // Verificare DOM ready state
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupCheckout();
                this.fetchOrderHistory(); // Fetch order history on init
            });
        } else {
            this.setupCheckout();
            this.fetchOrderHistory(); // Fetch order history on init
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
                    <p>Coșul dumneavoastră este gol</p>
                    <a href="index.html" class="btn btn-primary">Continuă cumpărăturile</a>
                </div>
            `;
            return;
        }

        try {
            cartContainer.innerHTML = this.cart.map(item => `
                <div class="cart-item fade-in" data-item-id="${item.id || ''}">
                    <img src="${item.image || '#'}" alt="${item.name || 'Imagine produs'}" class="cart-item-image" loading="lazy">
                    <div class="cart-item-details">
                        <h4 class="cart-item-name">${item.name || 'Produs fără nume'}</h4>
                        <p class="cart-item-price">${(item.price || 0).toFixed(2)} RON</p>
                        <p class="cart-item-quantity">Cantitate: ${item.quantity || 1}</p>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error('Eroare la afișarea produselor din coș:', error);
            cartContainer.innerHTML = `
                <div class="error-message">
                    <p>Nu s-au putut încărca produsele din coș. Vă rugăm să încercați din nou.</p>
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
        console.log(`Se validează pasul: ${step}`);
        const stepElement = document.querySelector(`[data-step="${step}"]`);
        if (!stepElement) {
            console.log(`Elementul pentru pasul "${step}" nu a fost găsit.`);
            return true;
        }
        
        let isValid = true;
        const inputs = stepElement.querySelectorAll('input:not([disabled]), select:not([disabled])');
        
        inputs.forEach(input => {
            const inputIsValid = this.validateInput(input);
            console.log(`Câmpul ${input.id} este valid: ${inputIsValid}`);
            if (!inputIsValid) {
                isValid = false;
                input.classList.add('shake');
                setTimeout(() => input.classList.remove('shake'), 600);
            }
        });
        
        console.log(`Rezultatul final al validării pentru pasul ${step}: ${isValid}`);
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

        document.getElementById('checkout-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            // ... validări ...
            const paymentMethod = document.querySelector('input[name="payment"]:checked').value;

            if (paymentMethod === 'card') {
                // ... logica pentru card ...
            } else if (paymentMethod === 'apple') {
                simulateApplePay();
                return;
            }
            // ... restul codului ...
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
        console.log('handlePlaceOrder a fost apelată.');
        if (!this.validateStep('payment')) {
            console.log('Validarea pasului "Plată" a eșuat. Nu se trimite comanda.');
            return;
        }
        console.log('Validarea pasului "Plată" a trecut. Se procesează comanda.');

        const placeOrderButton = document.getElementById('place-order');
        if (!placeOrderButton) return;
        
        placeOrderButton.disabled = true;
        placeOrderButton.innerHTML = `
            <span class="loading-spinner"></span>
            Se procesează...
        `;
        
        try {
            if (this.cart.length === 0) {
                throw new Error('Coșul dumneavoastră este gol');
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
            
            try {
                localStorage.removeItem('cart');
                localStorage.setItem('lastOrder', JSON.stringify(orderData));
            } catch (storageError) {
                console.error('Eroare la actualizarea stocării:', storageError);
            }
            
            setTimeout(() => {
                window.location.href = 'confirmare-comanda.html';
            }, 2000);
        } catch (error) {
            console.error('Eroare la plasarea comenzii:', error);
            this.showErrorMessage(error.message);
            placeOrderButton.disabled = false;
            placeOrderButton.textContent = 'Plasează comanda';
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
        try {
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(orderData)
            });

            if (!response.ok) {
                throw new Error('Nu s-a putut crea comanda');
            }

            const result = await response.json();
            
            // Actualizăm istoricul după crearea unei comenzi noi
            await this.fetchOrderHistory();
            
            return result;
        } catch (error) {
            console.error('Eroare la crearea comenzii:', error);
            throw error;
        }
    }

    showSuccessMessage() {
        const message = document.createElement('div');
        message.className = 'success-message slide-up';
        message.setAttribute('role', 'alert');
        message.innerHTML = `
            <svg aria-hidden="true" viewBox="0 0 24 24">
                <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7 19.6 5.6 9 16.2z"/>
            </svg>
            <p>Comanda a fost plasată cu succes!</p>
        `;
        
        document.body.appendChild(message);
        
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
        
        document.body.appendChild(message);
        
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

    async fetchOrderHistory() {
        try {
            const response = await fetch('/api/orders/history', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Nu s-a putut încărca istoricul comenzilor');
            }

            const data = await response.json();
            this.orderHistory = data.orders;
            this.displayOrderHistory();
        } catch (error) {
            console.error('Eroare la încărcarea istoricului:', error);
            this.showErrorMessage('Nu s-a putut încărca istoricul comenzilor. Vă rugăm să încercați din nou.');
        }
    }

    displayOrderHistory() {
        const historyContainer = document.getElementById('order-history');
        if (!historyContainer) return;

        if (this.orderHistory.length === 0) {
            historyContainer.innerHTML = `
                <div class="empty-history">
                    <p>Nu există comenzi în baza de date</p>
                </div>
            `;
            return;
        }

        historyContainer.innerHTML = this.orderHistory.map(order => `
            <div class="order-item fade-in">
                <div class="order-header">
                    <h4>Comanda #${order.orderId}</h4>
                    <span class="order-date">${new Date(order.date).toLocaleDateString('ro-RO')}</span>
                </div>
                <div class="order-details">
                    <div class="order-items">
                        ${order.items.map(item => `
                            <div class="order-product">
                                <img src="${item.image}" alt="${item.name}" class="order-product-image">
                                <div class="order-product-info">
                                    <p class="product-name">${item.name}</p>
                                    <p class="product-quantity">Cantitate: ${item.quantity}</p>
                                    <p class="product-price">${(item.price * item.quantity).toFixed(2)} RON</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <div class="order-summary">
                        <p>Subtotal: ${order.payment.total.toFixed(2)} RON</p>
                        <p>Transport: ${order.shipping.cost || 0} RON</p>
                        <p class="total">Total: ${(order.payment.total + (order.shipping.cost || 0)).toFixed(2)} RON</p>
                    </div>
                    <div class="order-status">
                        <p>Status: <span class="status-${order.status.toLowerCase()}">${this.getStatusInRomanian(order.status)}</span></p>
                    </div>
                </div>
            </div>
        `).join('');
    }

    getStatusInRomanian(status) {
        const statusMap = {
            'PENDING': 'În așteptare',
            'PROCESSING': 'În procesare',
            'SHIPPED': 'Expediată',
            'DELIVERED': 'Livrată',
            'CANCELLED': 'Anulată'
        };
        return statusMap[status] || status;
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

// Simulare Apple Pay pentru test
function simulateApplePay() {
    // Colectează datele din formular
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const name = document.getElementById('name')?.value || '';
    const email = document.getElementById('email')?.value || '';
    const phone = document.getElementById('phone')?.value || '';
    const address = document.getElementById('address')?.value || '';
    const city = document.getElementById('city')?.value || '';
    const postalCode = document.getElementById('zip')?.value || '';
    const country = 'România';
    // Poți adăuga și shipping method dacă ai
    const shippingMethod = document.querySelector('input[name="shipping"]:checked')?.value || 'standard';
    const shippingCost = shippingMethod === 'express' ? 25 : 10;

    const orderData = {
        items: cart.map(item => ({
            productId: item.id?.toString() || '',
            name: item.name,
            price: parseFloat(item.price),
            quantity: item.quantity
        })),
        shipping: {
            cost: shippingCost,
            method: shippingMethod,
            address: {
                street: address,
                city: city,
                postalCode: postalCode,
                country: country
            }
        },
        customer: {
            name: name,
            email: email,
            phone: phone
        },
        payment: {
            method: "Apple Pay"
        }
    };

    // Trimite comanda către backend
    fetch('http://localhost:3001/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
    })
    .then(res => res.json())
    .then(() => {
        // Afișează modalul de succes
        const successModal = document.getElementById('success-modal');
        if (successModal) successModal.classList.add('active');
        // Golește coșul
        localStorage.removeItem('cart');
        // Redirecționează după 3 secunde
        setTimeout(() => {
            window.location.href = 'store.html';
        }, 3000);
    })
    .catch(() => {
        alert('A apărut o eroare la simularea plății Apple Pay.');
    });
}

// Înlocuiește logica Apple Pay cu simulare
const applePayButton = document.getElementById('apple-pay-button');
if (applePayButton) {
    applePayButton.addEventListener('click', (e) => {
        e.preventDefault();
        simulateApplePay();
    });
}