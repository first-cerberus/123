const LeaveRequest = require('../models/LeaveRequest');
const User = require('../models/User');

class LeaveController {
    // Отримання всіх заявок
    async getAllLeaveRequests(req, res) {
        try {
            const leaveRequests = await LeaveRequest.find()
                .populate('userId', 'fullName rank position')
                .populate('requestedById', 'fullName')
                .sort({ createdAt: -1 });

            const currentUser = await User.findById(req.session.userId);
            
            res.json({ leaveRequests, currentUser });
        } catch (error) {
            res.status(500).json({ message: 'Помилка при отриманні заявок' });
        }
    }

    // Отримання однієї заявки
    async getLeaveRequest(req, res) {
        try {
            const leaveRequest = await LeaveRequest.findById(req.params.id)
                .populate('userId', 'fullName rank position');
            
            if (!leaveRequest) {
                return res.status(404).json({ message: 'Заявку не знайдено' });
            }

            res.json(leaveRequest);
        } catch (error) {
            res.status(500).json({ message: 'Помилка при отриманні заявки' });
        }
    }

    // Створення нової заявки
    async createLeaveRequest(req, res) {
        try {
            const { userId, departureDate, returnDate, reason } = req.body;
            
            const leaveRequest = new LeaveRequest({
                userId,
                requestedById: req.session.userId,
                departureDate,
                returnDate,
                reason,
                status: 'pending'
            });

            await leaveRequest.save();
            res.status(201).json(leaveRequest);
        } catch (error) {
            res.status(500).json({ 
                message: 'Помилка при створенні заявки',
                error: error.message
            });
        }
    }

    // Оновлення заявки
    async updateLeaveRequest(req, res) {
        try {
            const { departureDate, returnDate, reason } = req.body;
            const leaveRequest = await LeaveRequest.findById(req.params.id);

            if (!leaveRequest) {
                return res.status(404).json({ message: 'Заявку не знайдено' });
            }

            // Перевірка прав на редагування
            const currentUser = await User.findById(req.session.userId);
            if (currentUser.role !== 'admin' && 
                leaveRequest.status !== 'pending' &&
                leaveRequest.requestedById.toString() !== req.session.userId &&
                leaveRequest.userId.toString() !== req.session.userId) {
                return res.status(403).json({ message: 'Недостатньо прав для редагування заявки' });
            }

            leaveRequest.departureDate = departureDate;
            leaveRequest.returnDate = returnDate;
            leaveRequest.reason = reason;

            await leaveRequest.save();
            res.json(leaveRequest);
        } catch (error) {
            res.status(500).json({ 
                message: 'Помилка при оновленні заявки',
                error: error.message
            });
        }
    }

    // Оновлення статусу заявки
    async updateLeaveStatus(req, res) {
        try {
            const { status } = req.body;
            const leaveRequest = await LeaveRequest.findById(req.params.id);

            if (!leaveRequest) {
                return res.status(404).json({ message: 'Заявку не знайдено' });
            }

            leaveRequest.status = status;
            await leaveRequest.save();
            res.json(leaveRequest);
        } catch (error) {
            res.status(500).json({ message: 'Помилка при зміні статусу заявки' });
        }
    }

    // Видалення заявки
    async deleteLeaveRequest(req, res) {
        try {
            const leaveRequest = await LeaveRequest.findById(req.params.id);
            
            if (!leaveRequest) {
                return res.status(404).json({ message: 'Заявку не знайдено' });
            }

            const currentUser = await User.findById(req.session.userId);
            
            // Перевірка прав на видалення
            if (currentUser.role !== 'admin' && 
                leaveRequest.requestedById.toString() !== req.session.userId &&
                leaveRequest.status !== 'pending') {
                return res.status(403).json({ message: 'Недостатньо прав для видалення заявки' });
            }

            await LeaveRequest.findByIdAndDelete(req.params.id);
            res.json({ message: 'Заявку успішно видалено' });
        } catch (error) {
            res.status(500).json({ message: 'Помилка при видаленні заявки' });
        }
    }
}

module.exports = new LeaveController();