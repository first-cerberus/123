const mongoose = require('mongoose');

const leaveRequestSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    requestedById: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    departureDate: {
        type: Date,
        required: true
    },
    returnDate: {
        type: Date,
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    }
}, {
    timestamps: true
});

// Валідація дат
leaveRequestSchema.pre('save', function(next) {
    if (this.departureDate >= this.returnDate) {
        next(new Error('Дата повернення має бути пізніше дати відбуття'));
    }
    if (this.departureDate < new Date()) {
        next(new Error('Дата відбуття не може бути в минулому'));
    }
    next();
});

const LeaveRequest = mongoose.model('LeaveRequest', leaveRequestSchema);

module.exports = LeaveRequest;