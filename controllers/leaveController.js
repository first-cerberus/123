const LeaveRequest = require('../models/LeaveRequest');
const { ObjectId } = require('mongodb');

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
            const { startDate, endDate, reason } = req.body;
            const userId = req.session.userId;
            const db = req.app.locals.db;

            const leaveRequest = new LeaveRequest({
                userId: new ObjectId(userId),
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                reason,
                status: 'pending'
            });

            const result = await leaveRequest.save(db);
            res.status(201).json({ message: 'Заява створена успішно', leaveRequest: result.ops[0] });
        } catch (err) {
            console.error('Помилка створення заяви:', err);
            res.status(500).json({ message: 'Помилка сервера при створенні заяви' });
        }
    }

    // Оновлення заявки
    async updateLeaveRequest(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const db = req.app.locals.db;

            await LeaveRequest.updateOne(
                { _id: new ObjectId(id) },
                { status },
                db
            );

            res.json({ message: 'Статус заяви оновлено успішно' });
        } catch (err) {
            console.error('Помилка оновлення заяви:', err);
            res.status(500).json({ message: 'Помилка сервера при оновленні заяви' });
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