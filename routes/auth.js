const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const User = require('../models/User');

// Middleware для перевірки першого користувача
async function checkFirstUser(req, res, next) {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
        req.isFirstUser = true;
    }
    next();
}

// Маршрути аутентифікації
router.get('/check', authController.checkAuth);
router.get('/users', authController.getUsers);
router.post('/register', checkFirstUser, authController.register);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

module.exports = router;









