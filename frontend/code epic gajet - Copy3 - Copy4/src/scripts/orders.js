// Orders page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    // Initialize page
    initializePage();
    loadOrders();

    // Event listeners
    document.getElementById('logoutBtn').addEventListener('click', logout);
    document.getElementById('statusFilter').addEventListener('change', filterOrders);
    document.getElementById('dateFilter').addEventListener('change', filterOrders);
    document.getElementById('closeModal').addEventListener('click', closeModal);
    
    // Close modal when clicking outside
    document.getElementById('orderModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal();
        }
    });
});

let allOrders = [];
let filteredOrders = [];

function initializePage() {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const userName = userData.first_name || userData.email || 'Utilizator';
    document.getElementById('userName').textContent = userName;
}

async function loadOrders() {
    const loadingSpinner = document.getElementById('loadingSpinner');
    const ordersList = document.getElementById('ordersList');
    const noOrders = document.getElementById('noOrders');

    try {
        loadingSpinner.style.display = 'block';
        ordersList.style.display = 'none';
        noOrders.style.display = 'none';

        const response = await fetch('api/orders.php', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });

        if (response.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
            window.location.href = 'login.html';
            return;
        }

        const data = await response.json();

        if (response.ok && data.success) {
            allOrders = data.orders || [];
            filteredOrders = [...allOrders];
            
            updateStats();
            displayOrders();
        } else {
            throw new Error(data.message || 'Eroare la încărcarea comenzilor');
        }
    } catch (error) {
        console.error('Error loading orders:', error);
        showError('A apărut o eroare la încărcarea comenzilor. Te rog încearcă din nou.');
    } finally {
        loadingSpinner.style.display = 'none';
    }
}

function updateStats() {
    const stats = {
        total: allOrders.length,
        pending: allOrders.filter(order => order.status === 'pending').length,
        shipped: allOrders.filter(order => order.status === 'shipped').length,
        delivered: allOrders.filter(order => order.status === 'delivered').length
    };

    document.getElementById('totalOrders').textContent = stats.total;
    document.getElementById('pendingOrders').textContent = stats.pending;
    document.getElementById('shippedOrders').textContent = stats.shipped;
    document.getElementById('deliveredOrders').textContent = stats.delivered;
}

function displayOrders() {
    const ordersList = document.getElementById('ordersList');
    const noOrders = document.getElementById('noOrders');

    if (filteredOrders.length === 0) {
        ordersList.style.display = 'none';
        noOrders.style.display = 'block';
        return;
    }

    ordersList.style.display = 'block';
    noOrders.style.display = 'none';

    ordersList.innerHTML = filteredOrders.map(order => `
        <div class="order-card" onclick="viewOrderDetails(${order.order_id})">
            <div class="order-header">
                <div>
                    <div class="order-id">Comanda #${order.order_id}</div>
                    <div class="order-date">${formatDate(order.order_date)}</div>
                </div>
                <span class="order-status ${order.status}">${getStatusText(order.status)}</span>
            </div>
            <div class="order-summary">
                <div class="order-items">${order.items_count} produse</div>
                <div class="order-total">${formatPrice(order.total_amount)}</div>
            </div>
            <div class="order-actions">
                <button class="view-details-btn" onclick="event.stopPropagation(); viewOrderDetails(${order.order_id})">
                    Vezi Detalii
                </button>
            </div>
        </div>
    `).join('');
}

function filterOrders() {
    const statusFilter = document.getElementById('statusFilter').value;
    const dateFilter = document.getElementById('dateFilter').value;

    filteredOrders = allOrders.filter(order => {
        // Status filter
        if (statusFilter && order.status !== statusFilter) {
            return false;
        }

        // Date filter
        if (dateFilter) {
            const orderDate = new Date(order.order_date);
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - parseInt(dateFilter));
            
            if (orderDate < cutoffDate) {
                return false;
            }
        }

        return true;
    });

    displayOrders();
}

async function viewOrderDetails(orderId) {
    try {
        const response = await fetch(`api/order-details.php?order_id=${orderId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });

        const data = await response.json();

        if (response.ok && data.success) {
            showOrderModal(data.order);
        } else {
            throw new Error(data.message || 'Eroare la încărcarea detaliilor comenzii');
        }
    } catch (error) {
        console.error('Error loading order details:', error);
        showError('A apărut o eroare la încărcarea detaliilor comenzii.');
    }
}

function showOrderModal(order) {
    const modal = document.getElementById('orderModal');
    const modalBody = document.getElementById('modalBody');

    modalBody.innerHTML = `
        <div class="order-details">
            <div class="detail-section">
                <h3>Informații Comandă</h3>
                <div class="detail-row">
                    <span class="detail-label">Număr comandă:</span>
                    <span class="detail-value">#${order.order_id}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Data comandă:</span>
                    <span class="detail-value">${formatDate(order.order_date)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Status:</span>
                    <span class="detail-value">
                        <span class="order-status ${order.status}">${getStatusText(order.status)}</span>
                    </span>
                </div>
                ${order.tracking_number ? `
                <div class="detail-row">
                    <span class="detail-label">Număr tracking:</span>
                    <span class="detail-value">${order.tracking_number}</span>
                </div>
                ` : ''}
            </div>

            <div class="detail-section">
                <h3>Adresa de Livrare</h3>
                <div class="address-info">
                    ${order.shipping_address ? `
                        <p>${order.shipping_address.street_address}</p>
                        ${order.shipping_address.apartment ? `<p>Apartament: ${order.shipping_address.apartment}</p>` : ''}
                        <p>${order.shipping_address.city}, ${order.shipping_address.state} ${order.shipping_address.postal_code}</p>
                        <p>${order.shipping_address.country}</p>
                    ` : '<p>Adresa nu este disponibilă</p>'}
                </div>
            </div>

            <div class="detail-section">
                <h3>Produse Comandate</h3>
                <div class="order-items-list">
                    ${order.items.map(item => `
                        <div class="order-item">
                            <div class="item-info">
                                <h4>${item.product_name}</h4>
                                <p class="item-price">${formatPrice(item.unit_price)} x ${item.quantity}</p>
                            </div>
                            <div class="item-total">
                                ${formatPrice(item.unit_price * item.quantity)}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="order-total-section">
                <div class="total-row">
                    <span class="total-label">Total Comandă:</span>
                    <span class="total-value">${formatPrice(order.total_amount)}</span>
                </div>
            </div>
        </div>
    `;

    modal.style.display = 'flex';
}

function closeModal() {
    document.getElementById('orderModal').style.display = 'none';
}

function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    window.location.href = 'login.html';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ro-RO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatPrice(price) {
    return new Intl.NumberFormat('ro-RO', {
        style: 'currency',
        currency: 'RON'
    }).format(price);
}

function getStatusText(status) {
    const statusMap = {
        'pending': 'În așteptare',
        'processing': 'În procesare',
        'shipped': 'Expediată',
        'delivered': 'Livrată',
        'cancelled': 'Anulată'
    };
    return statusMap[status] || status;
}

function showError(message) {
    // Create a simple error notification
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #f56565;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 1001;
        max-width: 300px;
    `;
    errorDiv.textContent = message;
    
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
} 