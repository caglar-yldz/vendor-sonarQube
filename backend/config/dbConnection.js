const mongoose = require('mongoose');

const connectDb = async () => {
    try {
        const connection = await mongoose.connect(process.env.CONNECTION_STRING);
        console.log('MongoDB connected:', connection.connection.host, connection.connection.name);
    } catch (error) {
        console.error('MongoDB connection error:', error);
    }
}

module.exports = connectDb;

