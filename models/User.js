const bcrypt = require('bcrypt');

class User {
    constructor(data) {
        this.username = data.username;
        this.password = data.password;
        this.rank = data.rank;
        this.fullName = data.fullName;
        this.position = data.position;
    }

    static async findOne(query, db) {
        return await db.collection('users').findOne(query);
    }

    static async findById(id, db) {
        return await db.collection('users').findOne({ _id: id });
    }

    async save(db) {
        if (this.password) {
            this.password = await bcrypt.hash(this.password, 10);
        }
        return await db.collection('users').insertOne(this);
    }

    static async comparePassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }
}

module.exports = User;