class LeaveRequest {
    constructor(data) {
        this.userId = data.userId;
        this.startDate = data.startDate;
        this.endDate = data.endDate;
        this.reason = data.reason;
        this.status = data.status || 'pending';
        this.createdAt = data.createdAt || new Date();
    }

    static async find(query, db) {
        return await db.collection('leaveRequests').find(query).toArray();
    }

    static async findById(id, db) {
        return await db.collection('leaveRequests').findOne({ _id: id });
    }

    async save(db) {
        return await db.collection('leaveRequests').insertOne(this);
    }

    static async updateOne(query, update, db) {
        return await db.collection('leaveRequests').updateOne(query, { $set: update });
    }
}

module.exports = LeaveRequest;