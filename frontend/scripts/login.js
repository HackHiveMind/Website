// Login functionality
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');
    const loginBtn = document.querySelector('.login-btn');

    // Check if user is already logged in
    const token = localStorage.getItem('authToken');
    if (token) {
        window.location.href = 'orders.html';
        return;
    }

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        // Basic validation
        if (!email || !password) {
            showError('Te rog completează toate câmpurile.');
            return;
        }

        if (!isValidEmail(email)) {
            showError('Te rog introdu o adresă de email validă.');
            return;
        }

        // Show loading state
        setLoadingState(true);

        try {
            const response = await fetch('api/login.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // Store authentication token
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('userData', JSON.stringify(data.user));
                
                // Redirect to orders page
                window.location.href = 'orders.html';
            } else {
                showError(data.message || 'Email sau parolă incorectă.');
            }
        } catch (error) {
            console.error('Login error:', error);
            showError('A apărut o eroare. Te rog încearcă din nou.');
        } finally {
            setLoadingState(false);
        }
    });

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        
        // Hide error after 5 seconds
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 5000);
    }

    function setLoadingState(loading) {
        if (loading) {
            loginBtn.classList.add('loading');
            loginBtn.textContent = 'Se conectează...';
            loginBtn.disabled = true;
        } else {
            loginBtn.classList.remove('loading');
            loginBtn.textContent = 'Conectare';
            loginBtn.disabled = false;
        }
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Register link functionality
    document.getElementById('registerLink').addEventListener('click', function(e) {
        e.preventDefault();
        // For now, just show a message. You can implement registration later
        showError('Funcția de înregistrare va fi disponibilă în curând.');
    });
}); 