const User = require('../models/User');

class AuthController {
    // Перевірка статусу авторизації
    async checkAuth(req, res) {
        if (req.session.userId) {
            res.status(200).json({ authenticated: true });
        } else {
            res.status(401).json({ authenticated: false });
        }
    }

    // Отримання списку користувачів
    async getUsers(req, res) {
        try {
            const users = await User.find({}, 'fullName rank position');
            res.json(users);
        } catch (error) {
            res.status(500).json({ message: 'Помилка при отриманні списку користувачів' });
        }
    }

    // Реєстрація нового користувача
    async register(req, res) {
        try {
            const { username, password, rank, fullName, position } = req.body;
            const db = req.app.locals.db;

            // Check if user already exists
            const existingUser = await User.findOne({ username }, db);
            if (existingUser) {
                return res.status(400).json({ message: 'Користувач вже існує' });
            }

            // Create new user
            const user = new User({ username, password, rank, fullName, position });
            const result = await user.save(db);

            res.status(201).json({ message: 'Користувач успішно зареєстрований', userId: result.insertedId });
        } catch (err) {
            console.error('Помилка реєстрації:', err);
            res.status(500).json({ message: 'Помилка сервера при реєстрації' });
        }
    }

    // Вхід користувача
    async login(req, res) {
        try {
            const { username, password } = req.body;
            const db = req.app.locals.db;

            // Find user
            const user = await User.findOne({ username }, db);
            if (!user) {
                return res.status(401).json({ message: 'Неправильне імя користувача або пароль' });
            }

            // Check password
            const isValid = await User.comparePassword(password, user.password);
            if (!isValid) {
                return res.status(401).json({ message: 'Неправильне імя користувача або пароль' });
            }

            // Set session
            req.session.userId = user._id;
            req.session.userRank = user.rank;
            req.session.userFullName = user.fullName;

            res.json({ 
                message: 'Успішний вхід',
                user: {
                    id: user._id,
                    username: user.username,
                    rank: user.rank,
                    fullName: user.fullName,
                    position: user.position
                }
            });
        } catch (err) {
            console.error('Помилка входу:', err);
            res.status(500).json({ message: 'Помилка сервера при вході' });
        }
    }

    // Вихід користувача
    logout(req, res) {
        req.session.destroy(err => {
            if (err) {
                console.error('Помилка виходу:', err);
                return res.status(500).json({ message: 'Помилка сервера при виході' });
            }
            res.json({ message: 'Успішний вихід' });
        });
    }
}

module.exports = new AuthController();