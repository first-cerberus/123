// Перевірка авторизації при завантаженні сторінки
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupLogoutButton();
    setupModal();
    
    const leaveRequestForm = document.getElementById('leaveRequestForm');
    if (leaveRequestForm) {
        loadUsers();
        setupLeaveRequestForm();
    }

    const leaveRequestsTable = document.getElementById('leaveRequestsTable');
    if (leaveRequestsTable) {
        loadLeaveRequests();
    }
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


// Завантаження списку користувачів для форми заяви
async function loadUsers() {
    try {
        const response = await fetch('/api/auth/users');
        if (response.ok) {
            const users = await response.json();
            const userSelect = document.getElementById('userId');
            users.forEach(user => {
                const option = document.createElement('option');
                option.value = user._id;
                option.textContent = `${user.rank} ${user.fullName}`;
                userSelect.appendChild(option);
            });
        }
    } catch (error) {
        alert('Помилка при завантаженні користувачів');
    }
}

// Налаштування форми подання заяви
function setupLeaveRequestForm() {
    const form = document.getElementById('leaveRequestForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = {
            userId: document.getElementById('userId').value,
            departureDate: document.getElementById('departureDate').value,
            returnDate: document.getElementById('returnDate').value,
            reason: document.getElementById('reason').value
        };

        try {
            const response = await fetch('/api/leave', {
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
                alert(data.message || 'Помилка при створенні заяви');
            }
        } catch (error) {
            alert('Помилка підключення до сервера');
        }
    });
}

// Завантаження списку заяв
async function loadLeaveRequests() {
    try {
        const response = await fetch('/api/leave');
        if (response.ok) {
            const { leaveRequests, currentUser } = await response.json();
            displayLeaveRequests(leaveRequests, currentUser);
        }
    } catch (error) {
        alert('Помилка при завантаженні заяв');
    }
}

// Відображення списку заяв
function displayLeaveRequests(leaveRequests, currentUser) {
    const tbody = document.getElementById('leaveRequestsTable');
    tbody.innerHTML = '';

    leaveRequests.forEach(request => {
        const tr = document.createElement('tr');
        
        const formatDate = (dateString) => {
            const date = new Date(dateString);
            return date.toLocaleString('uk-UA');
        };

        tr.innerHTML = `
            <td>${request.userId.rank} ${request.userId.fullName}</td>
            <td>${request.userId.rank}</td>
            <td>${formatDate(request.departureDate)}</td>
            <td>${formatDate(request.returnDate)}</td>
            <td>${request.reason}</td>
            <td>${getStatusText(request.status)}</td>
            <td>${generateActionButtons(request, currentUser)}</td>
        `;

        tbody.appendChild(tr);
    });

    // Додавання обробників подій для кнопок
    setupActionButtons();
}

// Генерація кнопок дій для заяви
function generateActionButtons(request, currentUser) {
    const buttons = [];

    if (currentUser.role === 'admin') {
        if (request.status === 'pending') {
            buttons.push(`<button class="btn btn-success btn-sm approve-btn" data-id="${request._id}">Підтвердити</button>`);
            buttons.push(`<button class="btn btn-danger btn-sm reject-btn" data-id="${request._id}">Відхилити</button>`);
        }
        buttons.push(`<button class="btn btn-danger btn-sm delete-btn" data-id="${request._id}">Видалити</button>`);
    } else {
        if (request.status === 'pending' && 
            (request.userId._id === currentUser._id || request.requestedById === currentUser._id)) {
            buttons.push(`<button class="btn btn-primary btn-sm edit-btn" data-id="${request._id}">Редагувати</button>`);
            buttons.push(`<button class="btn btn-danger btn-sm delete-btn" data-id="${request._id}">Видалити</button>`);
        }
    }

    return buttons.join(' ');
}

// Налаштування обробників подій для кнопок
function setupActionButtons() {
    // Підтвердження заяви
    document.querySelectorAll('.approve-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const id = btn.dataset.id;
            await updateLeaveRequestStatus(id, 'approved');
        });
    });

    // Відхилення заяви
    document.querySelectorAll('.reject-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const id = btn.dataset.id;
            await updateLeaveRequestStatus(id, 'rejected');
        });
    });

    // Редагування заяви
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.id;
            openEditModal(id);
        });
    });

    // Видалення заяви
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            if (confirm('Ви впевнені, що хочете видалити цю заяву?')) {
                const id = btn.dataset.id;
                await deleteLeaveRequest(id);
            }
        });
    });
}

// Оновлення статусу заяви
async function updateLeaveRequestStatus(id, status) {
    try {
        const response = await fetch(`/api/leave/${id}/status`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status })
        });

        if (response.ok) {
            alert('Статус заяви оновлено');
            loadLeaveRequests();
        } else {
            const data = await response.json();
            alert(data.message || 'Помилка при оновленні статусу');
        }
    } catch (error) {
        alert('Помилка підключення до сервера');
    }
}

// Видалення заяви
async function deleteLeaveRequest(id) {
    try {
        const response = await fetch(`/api/leave/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert('Заяву успішно видалено');
            loadLeaveRequests();
        } else {
            const data = await response.json();
            alert(data.message || 'Помилка при видаленні заяви');
        }
    } catch (error) {
        alert('Помилка підключення до сервера');
    }
}

// Відкриття модального вікна
function openModal() {
    const modal = document.getElementById('editModal');
    modal.classList.add('show');
    document.body.style.overflow = 'hidden'; // Заборона прокрутки фону
}

// Закриття модального вікна
function closeModal() {
    const modal = document.getElementById('editModal');
    modal.classList.remove('show');
    document.body.style.overflow = ''; // Відновлення прокрутки
}

// Налаштування модального вікна
function setupModal() {
    // Закриття модального вікна при кліку поза ним
    window.onclick = function(event) {
        const modal = document.getElementById('editModal');
        if (event.target === modal) {
            closeModal();
        }
    }

    // Закриття по клавіші Escape
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeModal();
        }
    });
}

// Відкриття модального вікна для редагування
async function openEditModal(id) {
    try {
        const response = await fetch(`/api/leave/${id}`);
        if (response.ok) {
            const leaveRequest = await response.json();
            
            document.getElementById('editLeaveRequestId').value = id;
            document.getElementById('editDepartureDate').value = 
                new Date(leaveRequest.departureDate).toISOString().slice(0, 16);
            document.getElementById('editReturnDate').value = 
                new Date(leaveRequest.returnDate).toISOString().slice(0, 16);
            document.getElementById('editReason').value = leaveRequest.reason;

            openModal();
            setupEditForm();
        }
    } catch (error) {
        alert('Помилка при завантаженні даних для редагування');
    }
}

// Налаштування форми редагування
function setupEditForm() {
    const saveButton = document.getElementById('saveEditButton');
    const editForm = document.getElementById('editLeaveRequestForm');

    saveButton.onclick = async () => {
        if (!editForm.checkValidity()) {
            editForm.reportValidity();
            return;
        }

        const id = document.getElementById('editLeaveRequestId').value;
        const formData = {
            departureDate: document.getElementById('editDepartureDate').value,
            returnDate: document.getElementById('editReturnDate').value,
            reason: document.getElementById('editReason').value
        };

        try {
            const response = await fetch(`/api/leave/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                alert('Заяву успішно оновлено');
                closeModal();
                loadLeaveRequests();
            } else {
                const data = await response.json();
                alert(data.message || 'Помилка при оновленні заяви');
            }
        } catch (error) {
            alert('Помилка підключення до сервера');
        }
    };
}

// Функції для роботи з модальним вікном
function openModal(id) {
    const modal = document.getElementById('editModal');
    modal.classList.add('show');
}

function closeModal() {
    const modal = document.getElementById('editModal');
    modal.classList.remove('show');
}

// Отримання тексту статусу
function getStatusText(status) {
    const statusMap = {
        'pending': 'На розгляді',
        'approved': 'Підтверджено',
        'rejected': 'Відхилено'
    };
    return statusMap[status] || status;
}