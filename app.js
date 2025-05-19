const express = require('express');
const { MongoClient } = require('mongodb');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const path = require('path');

const app = express();

// MongoDB Atlas connection string (замените на ваш URL-подключения из MongoDB Atlas)
const mongoUri = 'mongodb+srv://sans15365:poiuyt123321@cluster0.roheqjh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const client = new MongoClient(mongoUri);

let db;

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

// Підключення до MongoDB Atlas
async function connectToDatabase() {
    try {
        await client.connect();
        db = client.db('military_leave_db');
        console.log('Підключено до MongoDB Atlas');
        
        // Add this line to make db available globally
        app.locals.db = db;
    } catch (err) {
        console.error('Помилка підключення до MongoDB Atlas:', err);
        process.exit(1);
    }
}

// Connect to the database
connectToDatabase();

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

// Graceful shutdown
process.on('SIGINT', async () => {
    await client.close();
    process.exit();
});