document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const loginBtn = document.getElementById('loginBtn');

    // Show loading state
    loginBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Authenticating...';
    loginBtn.disabled = true;

    try {
        // Use the new MobileAuth layer
        const user = await MobileAuth.login(username, password);

        if (user) {
            alert(`Welcome, ${user.name}! Login successful.`);
            loginBtn.innerHTML = 'Logged In <i class="fa-solid fa-check"></i>';
            loginBtn.style.backgroundColor = '#2EB086';

            // Store user in session
            sessionStorage.setItem('mobileUser', JSON.stringify(user));

            // Redirect to mobile dashboard
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 800);
        } else {
            alert('Invalid credentials. Please use your Staff ID and generated 6-char password.');
            loginBtn.innerHTML = 'Login <i class="fa-solid fa-arrow-right"></i>';
            loginBtn.disabled = false;
        }
    } catch (error) {
        console.error('Auth error:', error);
        alert('Could not connect to authentication service.');
        loginBtn.innerHTML = 'Login <i class="fa-solid fa-arrow-right"></i>';
        loginBtn.disabled = false;
    }
});
