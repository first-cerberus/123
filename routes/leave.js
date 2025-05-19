const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');
const User = require('../models/User');

// Middleware для перевірки прав адміна
const isAdmin = async (req, res, next) => {
    try {
        const user = await User.findById(req.session.userId);
        if (user.role !== 'admin') {
            return res.status(403).json({ message: 'Доступ заборонено' });
        }
        next();
    } catch (error) {
        res.status(500).json({ message: 'Помилка перевірки прав' });
    }
};

// Маршрути для роботи з заявами на звільнення
router.get('/', leaveController.getAllLeaveRequests);
router.get('/:id', leaveController.getLeaveRequest);
router.post('/', leaveController.createLeaveRequest);
router.put('/:id', leaveController.updateLeaveRequest);
router.post('/:id/status', isAdmin, leaveController.updateLeaveStatus);
router.delete('/:id', leaveController.deleteLeaveRequest);

module.exports = router;