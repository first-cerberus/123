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
            const { login, password, fullName, rank, position } = req.body;
            
            const userExists = await User.findOne({ login });
            if (userExists) {
                return res.status(400).json({ message: 'Користувач з таким логіном вже існує' });
            }

            const user = new User({
                login,
                password,
                fullName,
                rank,
                position,
                isFirstUser: req.isFirstUser,
                role: req.isFirstUser ? 'admin' : 'user'
            });

            await user.save();
            res.status(200).json({ message: 'Користувач успішно зареєстрований' });
        } catch (error) {
            res.status(500).json({ message: 'Помилка при реєстрації', error: error.message });
        }
    }

    // Вхід користувача
    async login(req, res) {
        try {
            const { login, password } = req.body;
            const user = await User.findOne({ login });

            if (!user || !(await user.comparePassword(password))) {
                return res.status(401).json({ message: 'Невірний логін або пароль' });
            }

            req.session.userId = user._id;
            req.session.userRole = user.role;
            
            res.json({ 
                message: 'Успішний вхід',
                user: {
                    id: user._id,
                    login: user.login,
                    fullName: user.fullName,
                    rank: user.rank,
                    role: user.role
                }
            });
        } catch (error) {
            res.status(500).json({ message: 'Помилка при вході', error: error.message });
        }
    }

    // Вихід користувача
    logout(req, res) {
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({ message: 'Помилка при виході' });
            }
            res.json({ message: 'Успішний вихід' });
        });
    }
}

module.exports = new AuthController();