document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupLogoutButton();
});

// Перевірка авторизації
async function checkAuth() {
    try {
        const response = await fetch('/api/auth/check');
        if (!response.ok) {
            window.location.href = '/html/login.html';
        }
    } catch (error) {
        window.location.href = '/html/login.html';
    }
}

// Налаштування кнопки виходу
function setupLogoutButton() {
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                await fetch('/api/auth/logout');
                window.location.href = '/html/login.html';
            } catch (error) {
                alert('Помилка при виході');
            }
        });
    }
}