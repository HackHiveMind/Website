// ✨ ADMIN DASHBOARD INOVATOR - JavaScript ✨

// Global variables
let currentUser = null;
let currentTheme = 'light';
let charts = {};

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// 🚀 APP INITIALIZATION
function initializeApp() {
    setupThemeToggle();
    setupParticles();
    setupLoginForm();
    checkExistingLogin();
    setupSidebarNavigation();
    setupDashboardAnimations();
    setupSearchFunctionality();
    setupNotifications();
    
    // Initialize greeting based on time
    updateGreeting();
    
    console.log('✨ Admin Dashboard Inovator initialized successfully!');
}

// 🎨 THEME MANAGEMENT
function setupThemeToggle() {
    const themeToggle = document.querySelector('.theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    
    // Check for saved theme
    const savedTheme = localStorage.getItem('admin-theme') || 'light';
    applyTheme(savedTheme);
    
    themeToggle.addEventListener('click', () => {
        currentTheme = currentTheme === 'light' ? 'dark' : 'light';
        applyTheme(currentTheme);
        localStorage.setItem('admin-theme', currentTheme);
    });
}

function applyTheme(theme) {
    currentTheme = theme;
    const themeIcon = document.getElementById('theme-icon');
    
    if (theme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        themeIcon.className = 'fas fa-moon';
    } else {
        document.body.removeAttribute('data-theme');
        themeIcon.className = 'fas fa-sun';
    }
}

// ✨ PARTICLE EFFECTS
function setupParticles() {
    const particlesContainer = document.getElementById('particles-container');
    
    // Create floating particles
    for (let i = 0; i < 50; i++) {
        createParticle(particlesContainer);
    }
    
    // Mouse interaction disabled - no more purple trail
    // document.addEventListener('mousemove', (e) => {
    //     createMouseParticle(e.clientX, e.clientY);
    // });
}

function createParticle(container) {
    const particle = document.createElement('div');
    particle.style.cssText = `
        position: absolute;
        width: ${Math.random() * 4 + 2}px;
        height: ${Math.random() * 4 + 2}px;
        background: rgba(255, 255, 255, ${Math.random() * 0.5 + 0.1});
        border-radius: 50%;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        animation: floatParticle ${Math.random() * 20 + 10}s linear infinite;
        pointer-events: none;
    `;
    
    container.appendChild(particle);
    
    // Remove particle after animation
    setTimeout(() => {
        if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
        }
    }, 30000);
}

function createMouseParticle(x, y) {
    const particle = document.createElement('div');
    particle.style.cssText = `
        position: fixed;
        width: 6px;
        height: 6px;
        background: rgba(102, 126, 234, 0.6);
        border-radius: 50%;
        left: ${x}px;
        top: ${y}px;
        pointer-events: none;
        z-index: 9999;
        animation: mouseParticle 1s ease-out forwards;
    `;
    
    document.body.appendChild(particle);
    
    setTimeout(() => {
        if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
        }
    }, 1000);
}

// 🔐 LOGIN SYSTEM
function setupLoginForm() {
    const loginForm = document.getElementById('admin-login-form');
    const loginBtn = loginForm.querySelector('.login-btn');
    
    loginForm.addEventListener('submit', handleLogin);
    
    // Add floating labels effect
    const inputs = loginForm.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', () => {
            if (!input.value) {
                input.parentElement.classList.remove('focused');
            }
        });
    });
}

async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('admin-email').value.trim();
    const password = document.getElementById('admin-password').value;
    const errorDiv = document.getElementById('admin-login-error');
    const loginBtn = document.querySelector('.login-btn');
    
    // Clear previous errors
    errorDiv.textContent = '';
    
    // Validation
    if (!email || !password) {
        showError('Toate câmpurile sunt obligatorii');
        return;
    }
    
    // Show loading state
    loginBtn.classList.add('loading');
    loginBtn.disabled = true;
    
    try {
        // Simulate API call for demo - replace with real endpoint
        const response = await fetch('/admin/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Store user data
            currentUser = data.user;
            localStorage.setItem('admin_token', data.token);
            localStorage.setItem('admin_user', JSON.stringify(currentUser));
            
            // Show success animation
            await showLoginSuccess();
            
            // Hide login and show dashboard
            hideLoginModal();
            showDashboard();
        } else {
            showError(data.message || 'Credențiale invalide');
        }
    } catch (error) {
        console.error('Login error:', error);
        showError('Eroare de conexiune. Încercați din nou.');
    } finally {
        loginBtn.classList.remove('loading');
        loginBtn.disabled = false;
    }
}

function checkExistingLogin() {
    const token = localStorage.getItem('admin_token');
    const userData = localStorage.getItem('admin_user');
    
    if (token && userData) {
        currentUser = JSON.parse(userData);
        hideLoginModal();
        showDashboard();
    }
}

function hideLoginModal() {
    const loginModal = document.getElementById('login-modal');
    loginModal.style.animation = 'fadeOut 0.5s ease forwards';
    
    setTimeout(() => {
        loginModal.style.display = 'none';
    }, 500);
}

function showDashboard() {
    const dashboard = document.getElementById('admin-dashboard');
    dashboard.style.display = 'flex';
    dashboard.style.animation = 'fadeInUp 0.8s ease forwards';
    
    // Load dashboard data
    loadDashboardData();
    
    // Initialize charts
    setTimeout(() => {
        initializeCharts();
    }, 500);
}

async function showLoginSuccess() {
    return new Promise(resolve => {
        const loginContainer = document.querySelector('.login-container');
        
        // Add success animation
        loginContainer.style.animation = 'successPulse 0.6s ease';
        
        // Show success message
        const successMsg = document.createElement('div');
        successMsg.innerHTML = '✅ Autentificare reușită!';
        successMsg.style.cssText = `
            color: #00d084;
            text-align: center;
            margin-top: 20px;
            font-weight: 600;
            animation: fadeIn 0.3s ease;
        `;
        
        loginContainer.appendChild(successMsg);
        
        setTimeout(() => {
            resolve();
        }, 1000);
    });
}

function showError(message) {
    const errorDiv = document.getElementById('admin-login-error');
    errorDiv.textContent = message;
    errorDiv.style.animation = 'shake 0.5s ease';
}

// 🧭 SIDEBAR NAVIGATION
function setupSidebarNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remove active class from all items
            navItems.forEach(nav => nav.classList.remove('active'));
            
            // Add active class to clicked item
            item.classList.add('active');
            
            // Get section to show
            const sectionName = item.dataset.section;
            showSection(sectionName);
            
            // Add ripple effect
            createRippleEffect(item);
        });
    });
    
    // Setup logout
    const logoutBtn = document.getElementById('admin-logout');
    logoutBtn.addEventListener('click', handleLogout);
}

function showSection(sectionName) {
    // Hide all sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.classList.remove('active');
        section.style.animation = 'fadeOut 0.3s ease';
    });
    
    // Show target section
    setTimeout(() => {
        const targetSection = document.getElementById(`${sectionName}-section`);
        if (targetSection) {
            targetSection.classList.add('active');
            targetSection.style.animation = 'fadeInUp 0.5s ease';
            
            // Load section-specific data
            loadSectionData(sectionName);
        }
    }, 300);
}

function createRippleEffect(element) {
    const ripple = document.createElement('span');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    
    ripple.style.cssText = `
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: scale(0);
        animation: ripple 0.6s linear;
        width: ${size}px;
        height: ${size}px;
        left: 50%;
        top: 50%;
        margin-left: -${size/2}px;
        margin-top: -${size/2}px;
    `;
    
    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    element.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

function handleLogout() {
    // Clear stored data
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    currentUser = null;
    
    // Show logout animation
    const dashboard = document.getElementById('admin-dashboard');
    dashboard.style.animation = 'fadeOut 0.5s ease forwards';
    
    setTimeout(() => {
        dashboard.style.display = 'none';
        
        // Show login modal
        const loginModal = document.getElementById('login-modal');
        loginModal.style.display = 'flex';
        loginModal.style.animation = 'fadeIn 0.5s ease forwards';
        
        // Reset form
        document.getElementById('admin-login-form').reset();
        document.getElementById('admin-login-error').textContent = '';
    }, 500);
}

// 📊 DASHBOARD DATA & ANIMATIONS
function setupDashboardAnimations() {
    // Animate stats cards on load
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'slideInUp 0.6s ease forwards';
                animateNumber(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe stat cards
    document.querySelectorAll('.stat-card').forEach(card => {
        observer.observe(card);
    });
}

async function loadDashboardData() {
    try {
        // Load overview stats
        await loadOverviewStats();
        
        // Load recent activity
        await loadRecentActivity();
        
        // Update user info
        updateUserInfo();
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

async function loadOverviewStats() {
    // Simulate API call - replace with real endpoints
    const mockData = {
        revenue: 125430,
        orders: 1250,
        users: 850,
        conversion: 15.8
    };
    
    // Animate numbers
    animateValue('total-revenue', 0, mockData.revenue, 2000, ' RON');
    animateValue('total-orders', 0, mockData.orders, 1500);
    animateValue('total-users', 0, mockData.users, 1800);
    animateValue('conversion-rate', 0, mockData.conversion, 2200, '%');
}

function animateValue(elementId, start, end, duration, suffix = '') {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const startTime = Date.now();
    const startValue = start;
    const endValue = end;
    
    function updateValue() {
        const now = Date.now();
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const current = startValue + (endValue - startValue) * easeOutQuart(progress);
        
        if (suffix === ' RON') {
            element.textContent = Math.floor(current).toLocaleString() + suffix;
        } else if (suffix === '%') {
            element.textContent = current.toFixed(1) + suffix;
        } else {
            element.textContent = Math.floor(current).toLocaleString() + suffix;
        }
        
        if (progress < 1) {
            requestAnimationFrame(updateValue);
        }
    }
    
    requestAnimationFrame(updateValue);
}

function easeOutQuart(t) {
    return 1 - (--t) * t * t * t;
}

async function loadRecentActivity() {
    const activityList = document.getElementById('activity-list');
    if (!activityList) return;
    
    const activities = [
        {
            icon: 'fas fa-shopping-cart',
            color: '#667eea',
            title: 'Comandă nouă primită',
            description: 'iPhone 15 Pro Max - Comandă #1234',
            time: 'Acum 5 minute'
        },
        {
            icon: 'fas fa-user-plus',
            color: '#f093fb',
            title: 'Utilizator nou înregistrat',
            description: 'john.doe@email.com',
            time: 'Acum 15 minute'
        },
        {
            icon: 'fas fa-chart-line',
            color: '#4facfe',
            title: 'Vânzări actualizate',
            description: 'Raport lunar generat',
            time: 'Acum 1 oră'
        },
        {
            icon: 'fas fa-bell',
            color: '#43e97b',
            title: 'Notificare sistem',
            description: 'Backup complet realizat',
            time: 'Acum 2 ore'
        }
    ];
    
    activityList.innerHTML = '';
    
    activities.forEach((activity, index) => {
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        activityItem.style.animationDelay = `${index * 0.1}s`;
        
        activityItem.innerHTML = `
            <div class="activity-icon" style="background: ${activity.color}">
                <i class="${activity.icon}"></i>
            </div>
            <div class="activity-content">
                <h4>${activity.title}</h4>
                <p>${activity.description}</p>
            </div>
            <div class="activity-time">${activity.time}</div>
        `;
        
        activityList.appendChild(activityItem);
    });
}

function updateUserInfo() {
    if (currentUser) {
        const usernameElement = document.querySelector('.username');
        if (usernameElement) {
            usernameElement.textContent = currentUser.name || 'Admin';
        }
    }
}

function updateGreeting() {
    const greetingElement = document.getElementById('greeting');
    if (!greetingElement) return;
    
    const hour = new Date().getHours();
    let greeting;
    
    if (hour < 12) {
        greeting = 'Bună dimineața';
    } else if (hour < 18) {
        greeting = 'Bună ziua';
    } else {
        greeting = 'Bună seara';
    }
    
    greetingElement.textContent = greeting;
}

// 🔍 SEARCH FUNCTIONALITY
function setupSearchFunctionality() {
    const searchInputs = document.querySelectorAll('input[type="text"]');
    
    searchInputs.forEach(input => {
        input.addEventListener('input', debounce(handleSearch, 300));
    });
}

function handleSearch(e) {
    const query = e.target.value.toLowerCase();
    const searchType = e.target.closest('.search-box') ? 'global' : 'table';
    
    if (searchType === 'table') {
        filterTable(query);
    } else {
        performGlobalSearch(query);
    }
}

function filterTable(query) {
    const table = document.getElementById('orders-table');
    if (!table) return;
    
    const rows = table.querySelectorAll('tbody tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        const matches = text.includes(query);
        
        row.style.display = matches ? '' : 'none';
        
        if (matches && query) {
            row.style.animation = 'highlightRow 0.3s ease';
        }
    });
}

function performGlobalSearch(query) {
    // Implement global search functionality
    console.log('Global search:', query);
}

// 🔔 NOTIFICATIONS
function setupNotifications() {
    const notificationBell = document.querySelector('.notification-bell');
    
    notificationBell.addEventListener('click', showNotifications);
    
    // Simulate new notifications
    setTimeout(() => {
        addNotification('Comandă nouă primită!', 'info');
    }, 5000);
}

function showNotifications() {
    // Create notifications dropdown
    const dropdown = document.createElement('div');
    dropdown.className = 'notifications-dropdown glass-effect';
    dropdown.innerHTML = `
        <div class="notifications-header">
            <h3>Notificări</h3>
            <button class="mark-all-read">Marchează toate ca citite</button>
        </div>
        <div class="notifications-list">
            <div class="notification-item">
                <div class="notification-icon">
                    <i class="fas fa-shopping-cart"></i>
                </div>
                <div class="notification-content">
                    <h4>Comandă nouă</h4>
                    <p>iPhone 15 Pro Max comandat</p>
                    <span class="notification-time">Acum 5 min</span>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(dropdown);
    
    // Position dropdown
    const bell = document.querySelector('.notification-bell');
    const rect = bell.getBoundingClientRect();
    dropdown.style.cssText += `
        position: fixed;
        top: ${rect.bottom + 10}px;
        right: ${window.innerWidth - rect.right}px;
        width: 300px;
        max-height: 400px;
        z-index: 9999;
        animation: slideInRight 0.3s ease;
    `;
    
    // Close on outside click
    setTimeout(() => {
        document.addEventListener('click', function closeDropdown(e) {
            if (!dropdown.contains(e.target) && e.target !== bell) {
                dropdown.style.animation = 'slideOutRight 0.3s ease forwards';
                setTimeout(() => dropdown.remove(), 300);
                document.removeEventListener('click', closeDropdown);
            }
        });
    }, 100);
}

function addNotification(message, type = 'info') {
    const badge = document.querySelector('.notification-badge');
    const currentCount = parseInt(badge.textContent) || 0;
    badge.textContent = currentCount + 1;
    
    // Animate badge
    badge.style.animation = 'bounce 0.5s ease';
}

// 📈 CHARTS INITIALIZATION
function initializeCharts() {
    initializeStatsCharts();
    initializeMainChart();
}

function initializeStatsCharts() {
    // Revenue chart
    const revenueCtx = document.getElementById('revenue-chart');
    if (revenueCtx) {
        charts.revenue = new Chart(revenueCtx, {
            type: 'line',
            data: {
                labels: ['L', 'M', 'M', 'J', 'V', 'S', 'D'],
                datasets: [{
                    data: [12, 19, 15, 25, 22, 30, 28],
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { display: false },
                    y: { display: false }
                },
                elements: { point: { radius: 0 } }
            }
        });
    }
    
    // Similar charts for other stats...
}

function initializeMainChart() {
    const mainChartCtx = document.getElementById('main-chart');
    if (mainChartCtx) {
        charts.main = new Chart(mainChartCtx, {
            type: 'line',
            data: {
                labels: ['Ian', 'Feb', 'Mar', 'Apr', 'Mai', 'Iun', 'Iul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                datasets: [{
                    label: 'Venituri (RON)',
                    data: [65000, 59000, 80000, 81000, 56000, 95000, 89000, 98000, 87000, 103000, 92000, 110000],
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return value.toLocaleString() + ' RON';
                            }
                        }
                    }
                }
            }
        });
    }
}

// 📄 SECTION DATA LOADING
async function loadSectionData(sectionName) {
    switch (sectionName) {
        case 'orders':
            await loadOrdersData();
            break;
        case 'analytics':
            await loadAnalyticsData();
            break;
        case 'settings':
            loadSettingsData();
            break;
        default:
            break;
    }
}

async function loadOrdersData() {
    const tableBody = document.querySelector('#orders-table tbody');
    if (!tableBody) return;
    
    // Show loading state
    tableBody.innerHTML = '<tr><td colspan="6" class="loading-skeleton">Se încarcă...</td></tr>';
    
    try {
        // Simulate API call
        const orders = await fetchOrdersFromAPI();
        
        tableBody.innerHTML = '';
        orders.forEach((order, index) => {
            const row = document.createElement('tr');
            row.style.animationDelay = `${index * 0.05}s`;
            
            row.innerHTML = `
                <td>#${order.id}</td>
                <td>${formatDate(order.date)}</td>
                <td>${order.customer}</td>
                <td>${order.total.toLocaleString()} RON</td>
                <td><span class="status-badge status-${order.status}">${getStatusText(order.status)}</span></td>
                <td>
                    <button class="btn-action view" onclick="viewOrder(${order.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-action edit" onclick="editOrder(${order.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
        
    } catch (error) {
        tableBody.innerHTML = '<tr><td colspan="6">Eroare la încărcarea comenzilor</td></tr>';
    }
}

async function fetchOrdersFromAPI() {
    // Mock data - replace with real API call
    return [
        { id: 1001, date: new Date(), customer: 'Ion Popescu', total: 5999, status: 'completed' },
        { id: 1002, date: new Date(), customer: 'Maria Ionescu', total: 1299, status: 'pending' },
        { id: 1003, date: new Date(), customer: 'Alexandru Stan', total: 3499, status: 'cancelled' },
        // Add more mock data...
    ];
}

// 🛠️ UTILITY FUNCTIONS
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function formatDate(date) {
    return new Intl.DateTimeFormat('ro-RO', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    }).format(new Date(date));
}

function getStatusText(status) {
    const statusMap = {
        'completed': 'Completată',
        'pending': 'În așteptare',
        'cancelled': 'Anulată',
        'processing': 'În procesare'
    };
    return statusMap[status] || status;
}

function animateNumber(element) {
    const numberElement = element.querySelector('h3');
    if (!numberElement) return;
    
    const finalValue = numberElement.textContent;
    const numericValue = parseInt(finalValue.replace(/[^\d]/g, ''));
    
    if (numericValue) {
        animateValue(numberElement.closest('[id]')?.id, 0, numericValue, 2000);
    }
}

// 📱 RESPONSIVE MOBILE MENU
function setupMobileMenu() {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('mobile-open');
        });
    }
}

// 🎯 ACTION FUNCTIONS
async function viewOrder(orderId) {
    // Creează modalul dacă nu există
    let modal = document.getElementById('order-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'order-modal';
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100vw';
        modal.style.height = '100vh';
        modal.style.background = 'rgba(30,34,90,0.65)';
        modal.style.display = 'flex';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';
        modal.style.zIndex = '9999';
        document.body.appendChild(modal);
    }

    // Loading state
    modal.innerHTML = `<div style='background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);border-radius:20px;box-shadow:0 8px 32px #667eea44;padding:32px 40px;min-width:340px;max-width:95vw;color:#fff;position:relative;'>
        <h2 style='margin-bottom:18px;font-size:1.5rem;font-weight:700;letter-spacing:1px;'>Se încarcă detaliile comenzii...</h2>
    </div>`;

    // Preia datele reale din API
    try {
        const token = localStorage.getItem('admin_token');
        const response = await fetch('/admin/api/orders', {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });
        const data = await response.json();
        const order = (data.orders || []).find(o => o.order_id == orderId);

        // Mock produse dacă nu există
        const products = order?.products || [
            { name: 'iPhone 15 Pro Max', qty: 1, price: '7.999 RON' },
            { name: 'Apple Watch Ultra', qty: 2, price: '4.299 RON' }
        ];

        modal.innerHTML = `
            <div style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);border-radius:28px;box-shadow:0 12px 48px #667eea55;padding:48px 56px;min-width:420px;max-width:99vw;color:#fff;position:relative;">
                <button id='close-order-modal' style='position:absolute;top:22px;right:22px;background:none;border:none;font-size:2rem;color:#fff;cursor:pointer;'>&times;</button>
                <h2 style='margin-bottom:22px;font-size:2rem;font-weight:700;letter-spacing:1px;'>Detalii Comandă</h2>
                <div style='font-size:1.18rem;margin-bottom:14px;'><b>ID:</b> #${order?.order_id || orderId}</div>
                <div style='font-size:1.18rem;margin-bottom:14px;'><b>Client:</b> ${order?.user_email || '-'}</div>
                <div style='font-size:1.18rem;margin-bottom:14px;'><b>Data:</b> ${order?.order_date || '-'}</div>
                <div style='font-size:1.18rem;margin-bottom:14px;'><b>Total:</b> ${order?.total_amount || '-'} </div>
                <div style='font-size:1.18rem;margin-bottom:14px;'><b>Status:</b> ${order?.status || '-'} </div>
                <div style='margin-top:22px;'>
                    <b>Produse comandate:</b>
                    <ul style='margin:14px 0 0 0;padding:0;list-style:none;'>
                        ${products.map(p => `<li style='margin-bottom:10px;padding:10px 16px;background:rgba(255,255,255,0.10);border-radius:10px;'>
                            <span style='font-weight:600;'>${p.name}</span> &times; <span>${p.qty}</span> <span style='float:right;font-weight:500;'>${p.price}</span>
                        </li>`).join('')}
                    </ul>
                </div>
                <div style='display:flex;gap:18px;justify-content:center;margin-top:36px;'>
                    <button id='accept-order-btn' style='background:linear-gradient(90deg,#43e97b 0%,#38f9d7 100%);border:none;border-radius:12px;padding:14px 32px;font-size:1.15rem;font-weight:700;color:#fff;box-shadow:0 2px 8px #43e97b55;cursor:pointer;display:flex;align-items:center;gap:10px;'>
                        <span style='font-size:1.5rem;'>✔️</span> Acceptă
                    </button>
                    <button id='decline-order-btn' style='background:linear-gradient(90deg,#ff0844 0%,#ffb199 100%);border:none;border-radius:12px;padding:14px 32px;font-size:1.15rem;font-weight:700;color:#fff;box-shadow:0 2px 8px #ff084455;cursor:pointer;display:flex;align-items:center;gap:10px;'>
                        <span style='font-size:1.5rem;'>❌</span> Respinge
                    </button>
                </div>
            </div>
        `;
        document.getElementById('close-order-modal').onclick = () => {
            modal.remove();
        };
        document.getElementById('accept-order-btn').onclick = async () => {
            const token = localStorage.getItem('admin_token');
            try {
                const resp = await fetch(`/admin/api/orders/${orderId}/status`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + token
                    },
                    body: JSON.stringify({ status: 'accepted' })
                });
                const result = await resp.json();
                if (result.success) {
                    alert('Comanda a fost acceptată!');
                } else {
                    alert('Eroare la acceptarea comenzii!');
                }
            } catch (err) {
                alert('Eroare la acceptarea comenzii!');
            }
            modal.remove();
        };
        document.getElementById('decline-order-btn').onclick = async () => {
            const token = localStorage.getItem('admin_token');
            try {
                const resp = await fetch(`/admin/api/orders/${orderId}/status`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + token
                    },
                    body: JSON.stringify({ status: 'declined' })
                });
                const result = await resp.json();
                if (result.success) {
                    alert('Comanda a fost respinsă!');
                } else {
                    alert('Eroare la respingerea comenzii!');
                }
            } catch (err) {
                alert('Eroare la respingerea comenzii!');
            }
            modal.remove();
        };
    } catch (err) {
        modal.innerHTML = `<div style='background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);border-radius:20px;box-shadow:0 8px 32px #667eea44;padding:32px 40px;min-width:340px;max-width:95vw;color:#fff;position:relative;'>
            <button id='close-order-modal' style='position:absolute;top:18px;right:18px;background:none;border:none;font-size:1.5rem;color:#fff;cursor:pointer;'>&times;</button>
            <h2 style='margin-bottom:18px;font-size:1.5rem;font-weight:700;letter-spacing:1px;'>Eroare la încărcarea comenzii</h2>
            <div style='font-size:1.08rem;'>Nu s-au putut prelua detaliile reale.</div>
        </div>`;
        document.getElementById('close-order-modal').onclick = () => {
            modal.remove();
        };
    }
}

function editOrder(orderId) {
    console.log('Editing order:', orderId);
    // Implement order edit functionality
}

// 🎨 DYNAMIC STYLES
const dynamicStyles = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    @keyframes floatParticle {
        0% {
            transform: translateY(100vh) translateX(0px);
            opacity: 1;
        }
        100% {
            transform: translateY(-10px) translateX(100px);
            opacity: 0;
        }
    }
    
    @keyframes mouseParticle {
        0% {
            transform: scale(0);
            opacity: 1;
        }
        100% {
            transform: scale(2);
            opacity: 0;
        }
    }
    
    @keyframes successPulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
    
    @keyframes highlightRow {
        0% { background: transparent; }
        50% { background: rgba(102, 126, 234, 0.1); }
        100% { background: transparent; }
    }
    
    @keyframes bounce {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.2); }
    }
    
    @keyframes slideInRight {
        from { 
            transform: translateX(100%);
            opacity: 0;
        }
        to { 
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from { 
            transform: translateX(0);
            opacity: 1;
        }
        to { 
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;

// Inject dynamic styles
const styleSheet = document.createElement('style');
styleSheet.textContent = dynamicStyles;
document.head.appendChild(styleSheet);

// 🎉 INITIALIZATION COMPLETE
console.log('🚀 Admin Dashboard Inovator - All systems loaded!');

// Setup logout functionality
document.addEventListener('DOMContentLoaded', function() {
    const logoutBtn = document.getElementById('admin-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
});
