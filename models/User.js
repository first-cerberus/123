const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    login: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    fullName: { type: String, required: true},
    rank: { type: String, required: true,
        enum: [
            'Рекрут',
            'Солдат',
            'Старший солдат',
            'Молодший сержант',
            'Сержант',
            'Старший сержант',
            'Головний сержант',
            'Штаб-сержант',
            'Майстер-сержант',
            'Старший майстер-сержант',
            'Головний майстер-сержант',
            'Молодший лейтенант',
            'Лейтенант',
            'Старший лейтенант',
            'Капітан',
            'Майор',
            'Підполковник',
            'Полковник',
            'Бригадний генерал',
            'Генерал-майор',
            'Генерал-лейтенант',
            'Генерал'
        ]
    },
    position: { type: String, required: true },
    role: { type: String, enum: ['admin', 'user'], default: 'user'},
    isFirstUser: { type: Boolean, default: false }
}, {
    timestamps: true
});

// Хешування паролю перед збереженням
userSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

// Метод для перевірки паролю
userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;