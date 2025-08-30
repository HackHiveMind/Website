document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('admin-login-form');
    const emailInput = document.getElementById('admin-email');
    const passwordInput = document.getElementById('admin-password');
    const loginError = document.getElementById('admin-login-error');
    const ordersSection = document.getElementById('admin-orders-section');
    const ordersTableBody = document.querySelector('#orders-table tbody');
    const logoutBtn = document.getElementById('admin-logout');

    // Check if already logged in
    if (localStorage.getItem('admin_token')) {
        showOrders();
    }

    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        loginError.textContent = '';
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        try {
            const res = await fetch('/admin/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (data.success && data.user) {
                // Check if admin
                if (data.user.email === 'admin@example.com') {
                    localStorage.setItem('admin_token', data.token);
                    showOrders();
                } else {
                    loginError.textContent = 'Acces permis doar pentru admin!';
                }
            } else {
                loginError.textContent = data.message || 'Eroare la autentificare';
            }
        } catch (err) {
            loginError.textContent = 'Eroare server. Încearcă din nou.';
        }
    });

    function showOrders() {
        loginForm.style.display = 'none';
        ordersSection.style.display = 'block';
        fetchOrders();
    }

    async function fetchOrders() {
        ordersTableBody.innerHTML = '<tr><td colspan="6">Se încarcă...</td></tr>';
        try {
            const res = await fetch('/admin/api/orders', {
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('admin_token')
                }
            });
            const data = await res.json();
            if (data.success) {
                if (data.orders.length === 0) {
                    ordersTableBody.innerHTML = '<tr><td colspan="6">Nu există comenzi.</td></tr>';
                } else {
                    ordersTableBody.innerHTML = '';
                    data.orders.forEach(order => {
                        ordersTableBody.innerHTML += `
                            <tr>
                                <td>${order.order_id}</td>
                                <td>${order.order_date}</td>
                                <td>${order.total_amount}</td>
                                <td>${order.status}</td>
                                <td>${order.tracking_number || ''}</td>
                                <td>${order.user_email}</td>
                            </tr>
                        `;
                    });
                }
            } else {
                ordersTableBody.innerHTML = `<tr><td colspan="6">${data.message || 'Eroare la încărcarea comenzilor.'}</td></tr>`;
            }
        } catch (err) {
            ordersTableBody.innerHTML = '<tr><td colspan="6">Eroare server.</td></tr>';
        }
    }

    logoutBtn.addEventListener('click', function () {
        localStorage.removeItem('admin_token');
        ordersSection.style.display = 'none';
        loginForm.style.display = 'block';
        emailInput.value = '';
        passwordInput.value = '';
    });
}); 