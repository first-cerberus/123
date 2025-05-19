const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const path = require('path');

const app = express();

// Налаштування проміжного ПЗ
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Налаштування сесій
app.use(session({
    secret: 'x7K9pL2mQ8vT5rW3nJ6bY4zA1cF0eH9',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

// Підключення до MongoDB
mongoose.connect('mongodb://localhost:27017/military_leave_db', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Підключено до MongoDB'))
.catch((err) => console.error('Помилка підключення до MongoDB:', err));

// Middleware для перевірки авторизації
const authMiddleware = (req, res, next) => {
    if (!req.session.userId) {
        return res.redirect('/html/login.html');
    }
    next();
};

// API маршрути
app.use('/api/auth', require('./routes/auth'));
app.use('/api/leave', authMiddleware, require('./routes/leave'));

// Головна сторінка
app.get('/', authMiddleware, (req, res) => {
    res.redirect('/html/leave-list.html');
});

const PORT = 80;
app.listen(PORT, () => {
    console.log(`Сервер запущено на порту ${PORT}`);
});