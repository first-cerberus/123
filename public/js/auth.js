// Обробка форми входу
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = {
                login: document.getElementById('login').value,
                password: document.getElementById('password').value
            };

            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                if (response.ok) {
                    window.location.href = '/html/leave-list.html';
                } else {
                    const data = await response.json();
                    alert(data.message || 'Помилка входу');
                }
            } catch (error) {
                alert('Помилка підключення до сервера');
            }
        });
    }

    // Обробка форми реєстрації
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = {
                login: document.getElementById('login').value,
                password: document.getElementById('password').value,
                fullName: document.getElementById('fullName').value,
                rank: document.getElementById('rank').value,
                position: document.getElementById('position').value
            };

            try {
                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                if (response.ok) {
                    alert('Реєстрація успішна');
                    window.location.href = '/html/login.html';
                } else {
                    const data = await response.json();
                    alert(data.message || 'Помилка реєстрації');
                }
            } catch (error) {
                alert('Помилка підключення до сервера');
            }
        });
    }
});